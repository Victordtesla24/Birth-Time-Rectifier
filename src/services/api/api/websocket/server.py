"""WebSocket server with security features for real-time updates."""

import asyncio
import jwt
import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from graphql_ws.websockets_lib import WsLibSubscriptionServer
from ..graphql.schema import schema
from prometheus_client import Counter, Histogram

logger = logging.getLogger(__name__)

# Metrics
WS_CONNECTIONS = Counter('ws_connections_total', 'Total WebSocket connections')
WS_MESSAGES = Counter('ws_messages_total', 'Total WebSocket messages')
WS_ERRORS = Counter('ws_errors_total', 'Total WebSocket errors')
WS_LATENCY = Histogram('ws_message_latency_seconds', 'WebSocket message latency')

class SecureWebSocketServer:
    """Secure WebSocket server with GraphQL subscription support."""
    
    def __init__(self, app: FastAPI, jwt_secret: str):
        """Initialize WebSocket server."""
        self.app = app
        self.jwt_secret = jwt_secret
        self.active_connections: Dict[str, WebSocket] = {}
        self.subscription_server = WsLibSubscriptionServer(schema)
        self.security = HTTPBearer()
        
        # Rate limiting
        self.rate_limits: Dict[str, Dict[str, Any]] = {}
        self.max_messages_per_minute = 100
        
        # Setup WebSocket route
        self.app.add_websocket_route("/ws", self.handle_websocket)
    
    async def handle_websocket(self, websocket: WebSocket):
        """Handle WebSocket connections with security checks."""
        try:
            # Verify JWT token
            token = await self._verify_token(websocket)
            if not token:
                await websocket.close(code=4001)
                return
            
            # Accept connection
            await websocket.accept()
            client_id = token["sub"]
            self.active_connections[client_id] = websocket
            WS_CONNECTIONS.inc()
            
            # Initialize rate limiting
            self.rate_limits[client_id] = {
                "message_count": 0,
                "last_reset": asyncio.get_event_loop().time()
            }
            
            try:
                while True:
                    # Handle messages
                    message = await websocket.receive_text()
                    
                    # Check rate limit
                    if not self._check_rate_limit(client_id):
                        await websocket.send_json({
                            "type": "error",
                            "payload": "Rate limit exceeded"
                        })
                        continue
                    
                    # Process message
                    start_time = asyncio.get_event_loop().time()
                    WS_MESSAGES.inc()
                    
                    try:
                        # Handle GraphQL subscription
                        response = await self.subscription_server.handle(message, {
                            "client_id": client_id,
                            "token": token
                        })
                        
                        await websocket.send_json(response)
                        
                        # Record latency
                        latency = asyncio.get_event_loop().time() - start_time
                        WS_LATENCY.observe(latency)
                        
                    except Exception as e:
                        logger.error(f"Message processing error: {str(e)}")
                        WS_ERRORS.inc()
                        await websocket.send_json({
                            "type": "error",
                            "payload": str(e)
                        })
                    
            except WebSocketDisconnect:
                self._cleanup_connection(client_id)
                
        except Exception as e:
            logger.error(f"WebSocket error: {str(e)}")
            WS_ERRORS.inc()
            try:
                await websocket.close(code=4000)
            except:
                pass
    
    async def _verify_token(self, websocket: WebSocket) -> Optional[Dict[str, Any]]:
        """Verify JWT token from WebSocket headers."""
        try:
            # Get token from headers
            auth_header = websocket.headers.get("authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return None
            
            token = auth_header.split(" ")[1]
            
            # Verify token
            payload = jwt.decode(
                token,
                self.jwt_secret,
                algorithms=["HS256"]
            )
            
            return payload
            
        except jwt.InvalidTokenError:
            return None
    
    def _check_rate_limit(self, client_id: str) -> bool:
        """Check if client has exceeded rate limit."""
        now = asyncio.get_event_loop().time()
        client_limits = self.rate_limits[client_id]
        
        # Reset counter if minute has passed
        if now - client_limits["last_reset"] >= 60:
            client_limits["message_count"] = 0
            client_limits["last_reset"] = now
        
        # Check limit
        if client_limits["message_count"] >= self.max_messages_per_minute:
            return False
        
        # Increment counter
        client_limits["message_count"] += 1
        return True
    
    def _cleanup_connection(self, client_id: str) -> None:
        """Clean up client connection data."""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        if client_id in self.rate_limits:
            del self.rate_limits[client_id]
    
    async def broadcast(self, message: Dict[str, Any]) -> None:
        """Broadcast message to all connected clients."""
        disconnected_clients = []
        
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except:
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self._cleanup_connection(client_id)
    
    def get_connection_stats(self) -> Dict[str, int]:
        """Get WebSocket connection statistics."""
        return {
            "active_connections": len(self.active_connections),
            "total_connections": WS_CONNECTIONS._value.get(),
            "total_messages": WS_MESSAGES._value.get(),
            "total_errors": WS_ERRORS._value.get()
        } 