import pytest
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.testclient import TestClient
from ..versioning import APIVersionManager, VersionedAPIMiddleware
import json

@pytest.fixture
def version_manager():
    manager = APIVersionManager()
    manager.add_version("1.0.0")
    manager.add_version("1.1.0")
    manager.add_version("0.9.0", deprecated=True)
    manager.add_version(
        "0.8.0",
        deprecated=True,
        sunset_date=(datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    )
    return manager

@pytest.fixture
def app(version_manager):
    app = FastAPI()
    app.add_middleware(VersionedAPIMiddleware, version_manager=version_manager)
    
    @app.get("/test")
    async def test_endpoint():
        return {"message": "success"}
    
    return app

@pytest.fixture
def client(app):
    return TestClient(app)

def test_version_manager_initialization(version_manager):
    """Test version manager initialization."""
    assert version_manager.current_version == "1.0.0"
    assert len(version_manager.versions) == 4
    assert version_manager.analytics_enabled

def test_version_addition(version_manager):
    """Test adding new API versions."""
    version_manager.add_version("2.0.0")
    assert "2.0.0" in version_manager.versions
    
    # Test with sunset date
    future_date = (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")
    version_manager.add_version("2.1.0", sunset_date=future_date)
    assert "2.1.0" in version_manager.versions
    assert version_manager.versions["2.1.0"].sunset_date is not None

def test_version_deprecation(version_manager):
    """Test version deprecation checks."""
    assert version_manager.is_deprecated("0.9.0")
    assert version_manager.is_deprecated("0.8.0")
    assert not version_manager.is_deprecated("1.0.0")
    assert not version_manager.is_deprecated("1.1.0")

def test_request_tracking(version_manager):
    """Test API request tracking."""
    version_manager.track_request(
        version="1.0.0",
        endpoint="/test",
        method="GET",
        status=200,
        latency=0.1
    )
    
    analytics = version_manager.get_analytics("1.0.0")
    assert analytics["analytics"]["requests"] == 1
    assert analytics["analytics"]["errors"] == 0
    assert analytics["analytics"]["avg_latency"] == 0.1

def test_error_tracking(version_manager):
    """Test error tracking in analytics."""
    version_manager.track_request(
        version="1.0.0",
        endpoint="/test",
        method="GET",
        status=500,
        latency=0.2
    )
    
    analytics = version_manager.get_analytics("1.0.0")
    assert analytics["analytics"]["errors"] == 1

def test_middleware_version_header(client):
    """Test API version header handling."""
    response = client.get("/test", headers={"X-API-Version": "1.0.0"})
    assert response.status_code == 200
    assert response.headers["X-API-Version"] == "1.0.0"

def test_middleware_deprecated_version(client):
    """Test deprecated version handling."""
    response = client.get("/test", headers={"X-API-Version": "0.9.0"})
    assert response.status_code == 410
    assert "deprecated" in response.json()["error"].lower()

def test_middleware_sunset_version(client):
    """Test sunset version handling."""
    response = client.get("/test", headers={"X-API-Version": "0.8.0"})
    assert response.status_code == 410
    assert "deprecated" in response.json()["error"].lower()

def test_middleware_missing_version(client):
    """Test request without version header."""
    response = client.get("/test")
    assert response.status_code == 200
    assert response.headers["X-API-Version"] == "1.0.0"  # Default version

def test_analytics_aggregation(version_manager):
    """Test analytics aggregation across versions."""
    # Add requests to different versions
    versions = ["1.0.0", "1.1.0"]
    for version in versions:
        for _ in range(3):
            version_manager.track_request(
                version=version,
                endpoint="/test",
                method="GET",
                status=200,
                latency=0.1
            )
    
    # Get aggregated analytics
    analytics = version_manager.get_analytics()
    
    for version in versions:
        assert analytics[version]["analytics"]["requests"] == 3
        assert analytics[version]["analytics"]["errors"] == 0

def test_latency_calculation(version_manager):
    """Test average latency calculation."""
    latencies = [0.1, 0.2, 0.3]
    for latency in latencies:
        version_manager.track_request(
            version="1.0.0",
            endpoint="/test",
            method="GET",
            status=200,
            latency=latency
        )
    
    analytics = version_manager.get_analytics("1.0.0")
    expected_avg = sum(latencies) / len(latencies)
    assert abs(analytics["analytics"]["avg_latency"] - expected_avg) < 0.0001

def test_middleware_error_handling(client):
    """Test middleware error handling."""
    @client.app.get("/error")
    async def error_endpoint():
        raise ValueError("Test error")
    
    response = client.get("/error")
    assert response.status_code == 500
    assert "error" in response.json()
    assert "message" in response.json()

def test_version_config_loading(tmp_path):
    """Test version configuration loading."""
    config_path = tmp_path / "version_config.json"
    config = {
        "current_version": "2.0.0",
        "versions": [
            {"version": "2.0.0"},
            {"version": "1.9.0", "deprecated": True}
        ]
    }
    
    with open(config_path, "w") as f:
        json.dump(config, f)
    
    manager = APIVersionManager()
    manager._load_version_config()
    
    assert manager.current_version == "2.0.0"
    assert "2.0.0" in manager.versions
    assert "1.9.0" in manager.versions
    assert manager.versions["1.9.0"].deprecated 