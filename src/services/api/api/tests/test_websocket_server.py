"""Tests for the WebSocket server implementation."""

import pytest
import jwt
import json
import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from fastapi import FastAPI, WebSocket
from ..websocket.server import SecureWebSocketServer

@pytest.fixture
def app():
    """Create FastAPI application instance."""
    return FastAPI()

@pytest.fixture
def jwt_secret():
    """Get JWT secret for testing."""
    return "test_secret"

@pytest.fixture
def ws_server(app, jwt_secret):
    """Create WebSocket server instance."""
    return SecureWebSocketServer(app, jwt_secret)

@pytest.fixture
def valid_token(jwt_secret):
    """Create valid JWT token."""
    return jwt.encode(
        {
            "sub": "test_user",
            "exp": datetime.utcnow() + timedelta(hours=1)
        },
        jwt_secret,
        algorithm="HS256"
    )

class MockWebSocket:
    """Mock WebSocket for testing."""
    def __init__(self, headers=None):
        self.headers = headers or {}
        self.closed = False
        self.close_code = None
        self.messages = []
        self.sent_messages = []
    
    async def accept(self):
        """Accept connection."""
        pass
    
    async def close(self, code=1000):
        """Close connection."""
        self.closed = True
        self.close_code = code
    
    async def receive_text(self):
        """Receive text message."""
        if not self.messages:
            raise Exception("No more messages")
        return self.messages.pop(0)
    
    async def send_json(self, data):
        """Send JSON message."""
        self.sent_messages.append(data)

@pytest.mark.asyncio
async def test_connection_with_valid_token(ws_server, valid_token):
    """Test WebSocket connection with valid token."""
    websocket = MockWebSocket(headers={"authorization": f"Bearer {valid_token}"})
    
    # Add test message
    websocket.messages.append(json.dumps({
        "type": "connection_init",
        "payload": {}
    }))
    
    # Handle connection
    await ws_server.handle_websocket(websocket)
    
    # Verify connection was accepted
    assert not websocket.closed
    assert "test_user" in ws_server.active_connections

@pytest.mark.asyncio
async def test_connection_with_invalid_token(ws_server):
    """Test WebSocket connection with invalid token."""
    websocket = MockWebSocket(headers={"authorization": "Bearer invalid_token"})
    
    # Handle connection
    await ws_server.handle_websocket(websocket)
    
    # Verify connection was rejected
    assert websocket.closed
    assert websocket.close_code == 4001
    assert len(ws_server.active_connections) == 0

@pytest.mark.asyncio
async def test_rate_limiting(ws_server, valid_token):
    """Test WebSocket rate limiting."""
    websocket = MockWebSocket(headers={"authorization": f"Bearer {valid_token}"})
    
    # Add messages (exceeding rate limit)
    for i in range(ws_server.max_messages_per_minute + 1):
        websocket.messages.append(json.dumps({
            "type": "subscription",
            "payload": {"query": "subscription { test }"}
        }))
    
    # Handle connection
    await ws_server.handle_websocket(websocket)
    
    # Verify rate limit error was sent
    assert any(
        msg.get("type") == "error" and "Rate limit exceeded" in msg.get("payload", "")
        for msg in websocket.sent_messages
    )

@pytest.mark.asyncio
async def test_subscription_handling(ws_server, valid_token):
    """Test GraphQL subscription handling."""
    websocket = MockWebSocket(headers={"authorization": f"Bearer {valid_token}"})
    
    # Add subscription message
    websocket.messages.append(json.dumps({
        "id": "1",
        "type": "start",
        "payload": {
            "query": """
                subscription {
                    rectificationUpdate(id: "test") {
                        status
                        progress
                    }
                }
            """
        }
    }))
    
    # Mock subscription server
    ws_server.subscription_server.handle = Mock(
        return_value={"type": "data", "id": "1", "payload": {"data": {"test": "value"}}}
    )
    
    # Handle connection
    await ws_server.handle_websocket(websocket)
    
    # Verify subscription response
    assert any(
        msg.get("type") == "data" and msg.get("id") == "1"
        for msg in websocket.sent_messages
    )

@pytest.mark.asyncio
async def test_error_handling(ws_server, valid_token):
    """Test error handling in message processing."""
    websocket = MockWebSocket(headers={"authorization": f"Bearer {valid_token}"})
    
    # Add message that will cause error
    websocket.messages.append(json.dumps({
        "type": "invalid",
        "payload": {}
    }))
    
    # Mock subscription server to raise error
    ws_server.subscription_server.handle = Mock(side_effect=Exception("Test error"))
    
    # Handle connection
    await ws_server.handle_websocket(websocket)
    
    # Verify error response
    assert any(
        msg.get("type") == "error" and "Test error" in msg.get("payload", "")
        for msg in websocket.sent_messages
    )

@pytest.mark.asyncio
async def test_connection_cleanup(ws_server, valid_token):
    """Test connection cleanup on disconnect."""
    websocket = MockWebSocket(headers={"authorization": f"Bearer {valid_token}"})
    
    # Simulate disconnect after connection
    websocket.receive_text = Mock(side_effect=Exception("Connection closed"))
    
    # Handle connection
    await ws_server.handle_websocket(websocket)
    
    # Verify cleanup
    assert "test_user" not in ws_server.active_connections
    assert "test_user" not in ws_server.rate_limits

@pytest.mark.asyncio
async def test_broadcast(ws_server, valid_token):
    """Test message broadcasting."""
    # Setup multiple connections
    websocket1 = MockWebSocket(headers={"authorization": f"Bearer {valid_token}"})
    websocket2 = MockWebSocket(headers={"authorization": f"Bearer {valid_token}"})
    
    ws_server.active_connections = {
        "user1": websocket1,
        "user2": websocket2
    }
    
    # Broadcast message
    message = {"type": "update", "payload": "test"}
    await ws_server.broadcast(message)
    
    # Verify message was sent to all connections
    assert message in websocket1.sent_messages
    assert message in websocket2.sent_messages

def test_connection_stats(ws_server, valid_token):
    """Test connection statistics."""
    # Add some connections
    ws_server.active_connections = {
        "user1": MockWebSocket(),
        "user2": MockWebSocket()
    }
    
    # Get stats
    stats = ws_server.get_connection_stats()
    
    assert stats["active_connections"] == 2
    assert "total_connections" in stats
    assert "total_messages" in stats
    assert "total_errors" in stats 