from typing import Dict, Any, Optional, List
from datetime import datetime
import logging
from pathlib import Path
import json
import asyncio
from fastapi import FastAPI, Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
from prometheus_client import Counter, Histogram, Gauge

logger = logging.getLogger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter(
    'api_requests_total',
    'Total API requests',
    ['version', 'endpoint', 'method', 'status']
)

REQUEST_LATENCY = Histogram(
    'api_request_latency_seconds',
    'API request latency',
    ['version', 'endpoint']
)

ACTIVE_REQUESTS = Gauge(
    'api_active_requests',
    'Number of active API requests',
    ['version']
)

class APIVersion:
    """API version information."""
    def __init__(self, version: str, deprecated: bool = False, 
                 sunset_date: Optional[datetime] = None):
        self.version = version
        self.deprecated = deprecated
        self.sunset_date = sunset_date
        self.endpoints = {}
        self.analytics = {
            "requests": 0,
            "errors": 0,
            "avg_latency": 0.0
        }

class APIVersionManager:
    """Manager for API versioning and analytics."""
    
    def __init__(self):
        self.versions: Dict[str, APIVersion] = {}
        self.current_version = "1.0.0"
        self.analytics_enabled = True
        self._load_version_config()
    
    def _load_version_config(self) -> None:
        """Load version configuration from file."""
        config_path = Path(__file__).parent / "version_config.json"
        if config_path.exists():
            with open(config_path, "r") as f:
                config = json.load(f)
                for version_info in config["versions"]:
                    self.add_version(
                        version=version_info["version"],
                        deprecated=version_info.get("deprecated", False),
                        sunset_date=version_info.get("sunset_date")
                    )
                self.current_version = config["current_version"]
    
    def add_version(self, version: str, deprecated: bool = False,
                   sunset_date: Optional[str] = None) -> None:
        """Add a new API version."""
        sunset_datetime = None
        if sunset_date:
            try:
                sunset_datetime = datetime.strptime(sunset_date, "%Y-%m-%d")
            except ValueError:
                logger.warning(f"Invalid sunset date format for version {version}")
        
        self.versions[version] = APIVersion(
            version=version,
            deprecated=deprecated,
            sunset_date=sunset_datetime
        )
    
    def get_version(self, version: str) -> Optional[APIVersion]:
        """Get API version information."""
        return self.versions.get(version)
    
    def is_deprecated(self, version: str) -> bool:
        """Check if API version is deprecated."""
        api_version = self.get_version(version)
        if not api_version:
            return False
        
        if api_version.deprecated:
            return True
        
        if api_version.sunset_date and datetime.now() > api_version.sunset_date:
            return True
        
        return False
    
    def track_request(self, version: str, endpoint: str,
                     method: str, status: int, latency: float) -> None:
        """Track API request for analytics."""
        if not self.analytics_enabled:
            return
        
        api_version = self.get_version(version)
        if not api_version:
            return
        
        # Update Prometheus metrics
        REQUEST_COUNT.labels(version=version, endpoint=endpoint,
                           method=method, status=status).inc()
        REQUEST_LATENCY.labels(version=version, endpoint=endpoint).observe(latency)
        
        # Update internal analytics
        api_version.analytics["requests"] += 1
        if status >= 400:
            api_version.analytics["errors"] += 1
        
        # Update average latency
        current_avg = api_version.analytics["avg_latency"]
        current_requests = api_version.analytics["requests"]
        api_version.analytics["avg_latency"] = (
            (current_avg * (current_requests - 1) + latency) / current_requests
        )
    
    def get_analytics(self, version: Optional[str] = None) -> Dict[str, Any]:
        """Get API analytics."""
        if version:
            api_version = self.get_version(version)
            if not api_version:
                return {}
            return {
                "version": version,
                "analytics": api_version.analytics,
                "deprecated": api_version.deprecated,
                "sunset_date": api_version.sunset_date.isoformat() if api_version.sunset_date else None
            }
        
        return {
            version: {
                "analytics": api_version.analytics,
                "deprecated": api_version.deprecated,
                "sunset_date": api_version.sunset_date.isoformat() if api_version.sunset_date else None
            }
            for version, api_version in self.versions.items()
        }

class VersionedAPIMiddleware(BaseHTTPMiddleware):
    """Middleware for API versioning and analytics."""
    
    def __init__(self, app: FastAPI, version_manager: APIVersionManager):
        super().__init__(app)
        self.version_manager = version_manager
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """Process request with versioning and analytics."""
        start_time = datetime.now()
        version = request.headers.get("X-API-Version", self.version_manager.current_version)
        
        # Track active requests
        ACTIVE_REQUESTS.labels(version=version).inc()
        
        try:
            # Check version deprecation
            if self.version_manager.is_deprecated(version):
                return Response(
                    content=json.dumps({
                        "error": "API version deprecated",
                        "message": "Please upgrade to a newer version",
                        "current_version": self.version_manager.current_version
                    }),
                    status_code=410,
                    media_type="application/json"
                )
            
            # Process request
            response = await call_next(request)
            
            # Track analytics
            end_time = datetime.now()
            latency = (end_time - start_time).total_seconds()
            
            self.version_manager.track_request(
                version=version,
                endpoint=str(request.url.path),
                method=request.method,
                status=response.status_code,
                latency=latency
            )
            
            # Add version headers
            response.headers["X-API-Version"] = version
            if self.version_manager.is_deprecated(version):
                response.headers["X-API-Deprecated"] = "true"
                api_version = self.version_manager.get_version(version)
                if api_version and api_version.sunset_date:
                    response.headers["X-API-Sunset-Date"] = api_version.sunset_date.isoformat()
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing request: {str(e)}")
            return Response(
                content=json.dumps({
                    "error": "Internal server error",
                    "message": str(e)
                }),
                status_code=500,
                media_type="application/json"
            )
            
        finally:
            # Decrement active requests
            ACTIVE_REQUESTS.labels(version=version).dec()

# Global version manager instance
version_manager = APIVersionManager() 