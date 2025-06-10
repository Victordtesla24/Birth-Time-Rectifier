"""
Birth Time Rectifier API - Consolidated Main Entry Point

This module creates and configures the FastAPI application following clean
architecture principles without over-engineering or complexity.
"""

import logging
import os
import time
import json
from typing import Dict, Any
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Define API version prefix
API_PREFIX = "/api/v1"

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    logger.info("Application startup initiated")

    # Initialize basic services without over-engineering
    try:
        # Load environment variables
        from ai_service.utils.env_loader import load_env_file
        load_env_file()

        # Initialize dependency container
        from ai_service.utils.dependency_container import get_container, initialize_container
        initialize_container()
        container = get_container()

        # Initialize session service
        from ai_service.services.session_service import SessionService
        session_service = SessionService()
        container.register_instance("session_service", session_service)

        logger.info("Core services initialized successfully")

    except Exception as e:
        logger.error(f"Service initialization error: {e}")
        # Continue with limited functionality

    logger.info("Application startup completed")

    yield

    # Cleanup
    logger.info("Application shutdown initiated")
    try:
        # Close shared HTTP session if exists
        from ai_service.utils.geocoding import close_shared_session
        await close_shared_session()
    except Exception as e:
        logger.warning(f"Error during cleanup: {e}")

    logger.info("Application shutdown completed")

# Create FastAPI application
app = FastAPI(
    title="Birth Time Rectifier API",
    description="API for birth time rectification",
    version="1.0.0",
    docs_url=f"{API_PREFIX}/docs",
    redoc_url=f"{API_PREFIX}/redoc",
    openapi_url=f"{API_PREFIX}/openapi.json",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/", tags=["Info"])
async def root():
    """Root endpoint returning service information."""
    return {
        "service": "Birth Time Rectifier AI Service",
        "status": "online",
        "version": "1.0.0",
        "api_prefix": API_PREFIX
    }

# Health check endpoints
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "ai_service"
    }

@app.get(f"{API_PREFIX}/health", tags=["Health"])
async def api_health_check():
    """Versioned health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "ai_service",
        "version": "v1"
    }

# Include API routers with single registration (no dual-registration)
from ai_service.api.routers import router
app.include_router(router, prefix=API_PREFIX)

# WebSocket session registration endpoint (consolidated from backup)
@app.post(f"{API_PREFIX}/ws-session/register", tags=["WebSocket"])
async def register_websocket_session(request: Request):
    """Register a session that is allowed to connect via WebSocket."""
    try:
        from ai_service.utils.websocket_manager import get_websocket_manager
        manager = get_websocket_manager()

        # Check if request is from the API Gateway
        headers = {k.lower(): v for k, v in request.headers.items()}
        is_from_gateway = headers.get("x-api-gateway-source") == "true"

        if not is_from_gateway:
            logger.warning("Unauthorized attempt to register WebSocket session")
            raise HTTPException(
                status_code=403,
                detail="Only the API Gateway can register WebSocket sessions"
            )

        # Get session data from request
        data = await request.json()
        session_id = data.get("session_id")

        if not session_id:
            raise HTTPException(
                status_code=400,
                detail="session_id is required"
            )

        # Register the session
        manager.register_session(session_id)

        # Also store in session service for redundancy
        from ai_service.services.session_service import get_session_service
        session_service = get_session_service()
        session_service.create_session(session_id)

        logger.info(f"Registered WebSocket session: {session_id}")

        return {
            "success": True,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering WebSocket session: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to register WebSocket session: {str(e)}"
        )

# Simple WebSocket endpoint (consolidated from multiple implementations)
@app.websocket(f"{API_PREFIX}/ws/{{session_id}}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time communication."""
    await websocket.accept()
    logger.info(f"WebSocket connection established for session {session_id}")

    try:
        # Get WebSocket manager
        from ai_service.utils.websocket_manager import get_websocket_manager
        manager = get_websocket_manager()
        await manager.connect(websocket, session_id)

        # Message processing loop
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                message_type = message.get("type", "")

                if message_type == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat(),
                        "session_id": session_id
                    })
                else:
                    # Handle other message types
                    await websocket.send_json({
                        "type": "message_received",
                        "original_type": message_type,
                        "session_id": session_id,
                        "timestamp": datetime.now().isoformat()
                    })

            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format",
                    "timestamp": datetime.now().isoformat()
                })

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        # Cleanup connection
        try:
            from ai_service.utils.websocket_manager import get_websocket_manager
            manager = get_websocket_manager()
            manager.disconnect(session_id)
        except Exception as e:
            logger.error(f"Error cleaning up WebSocket: {e}")

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log HTTP requests with timing."""
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")

    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions."""
    logger.error(f"Unhandled exception: {exc}")

    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred",
                "timestamp": datetime.now().isoformat()
            }
        }
    )

if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("API_HOST", "localhost")
    port = int(os.environ.get("API_PORT", "8001"))
    uvicorn.run("ai_service.main_consolidated:app", host=host, port=port, reload=True)
