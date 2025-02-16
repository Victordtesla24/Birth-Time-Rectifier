import json
import asyncio
import logging
from typing import Dict, Any, Optional, Set
from fastapi import WebSocket, WebSocketDisconnect
from ...agents.core.enhanced_rectification import EnhancedRectificationEngine
from ...agents.validation.enhanced_validator import EnhancedValidator

logger = logging.getLogger(__name__)

class RectificationSocketManager:
    """Manager for rectification WebSocket connections."""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.progress_trackers: Dict[str, Dict[str, Any]] = {}
        self.engine = EnhancedRectificationEngine()
        self.validator = EnhancedValidator()
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Connect a new client."""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.progress_trackers[client_id] = {
            "status": "connected",
            "progress": 0,
            "current_stage": "initialization"
        }
        
        await self._send_status_update(client_id)
    
    async def disconnect(self, client_id: str):
        """Disconnect a client."""
        if client_id in self.active_connections:
            await self.active_connections[client_id].close()
            del self.active_connections[client_id]
        
        if client_id in self.progress_trackers:
            del self.progress_trackers[client_id]
    
    async def start_rectification(self, client_id: str, data: Dict[str, Any]):
        """Start birth time rectification process."""
        try:
            # Validate input
            validation_errors = self.validator.validate(data)
            if validation_errors:
                await self._send_error(client_id, validation_errors)
                return
            
            # Update progress
            self.progress_trackers[client_id].update({
                "status": "processing",
                "progress": 10,
                "current_stage": "validation_complete"
            })
            await self._send_status_update(client_id)
            
            # Process in stages
            stages = [
                ("preprocessing", self._preprocess_data),
                ("calculation", self._calculate_rectification),
                ("analysis", self._analyze_results),
                ("finalization", self._finalize_results)
            ]
            
            progress_per_stage = 80 / len(stages)  # 80% for processing stages
            
            for stage_name, stage_func in stages:
                self.progress_trackers[client_id].update({
                    "current_stage": stage_name,
                    "progress": self.progress_trackers[client_id]["progress"]
                })
                await self._send_status_update(client_id)
                
                # Process stage
                result = await stage_func(data)
                
                # Update progress
                self.progress_trackers[client_id]["progress"] += progress_per_stage
                await self._send_status_update(client_id)
                
                # Update data with stage results
                data.update(result)
            
            # Send final results
            self.progress_trackers[client_id].update({
                "status": "complete",
                "progress": 100,
                "current_stage": "complete"
            })
            await self._send_result(client_id, data)
            
        except Exception as e:
            logger.error(f"Error in rectification process: {str(e)}")
            await self._send_error(client_id, {"general": [str(e)]})
    
    async def _preprocess_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Preprocess birth data and events."""
        await asyncio.sleep(1)  # Simulate processing time
        return {
            "preprocessed": True,
            "normalized_data": data
        }
    
    async def _calculate_rectification(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate birth time rectification."""
        await asyncio.sleep(2)  # Simulate processing time
        result = await self.engine.calculate_precise_time(
            birth_data=data["birth_data"],
            events=data.get("events", [])
        )
        return {
            "calculation_complete": True,
            "rectification_result": result
        }
    
    async def _analyze_results(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze rectification results."""
        await asyncio.sleep(1)  # Simulate processing time
        return {
            "analysis_complete": True,
            "confidence_metrics": {
                "overall": data["rectification_result"]["confidence_score"],
                "calculation": 0.95,
                "events": 0.90
            }
        }
    
    async def _finalize_results(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Finalize and format results."""
        await asyncio.sleep(1)  # Simulate processing time
        return {
            "finalization_complete": True,
            "final_results": {
                "rectified_time": data["rectification_result"]["rectified_time"],
                "confidence_score": data["rectification_result"]["confidence_score"],
                "explanation": data["rectification_result"].get("explanation", ""),
                "factors": data["rectification_result"].get("factors", [])
            }
        }
    
    async def _send_status_update(self, client_id: str):
        """Send status update to client."""
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json({
                "type": "status_update",
                "data": self.progress_trackers[client_id]
            })
    
    async def _send_result(self, client_id: str, data: Dict[str, Any]):
        """Send final result to client."""
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json({
                "type": "result",
                "data": data["final_results"]
            })
    
    async def _send_error(self, client_id: str, errors: Dict[str, Any]):
        """Send error message to client."""
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json({
                "type": "error",
                "data": {
                    "errors": errors,
                    "suggestions": {
                        field: self.validator.suggest_corrections(field, "")
                        for field in errors.keys()
                    }
                }
            })

# Global socket manager instance
socket_manager = RectificationSocketManager()

async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for birth time rectification."""
    try:
        await socket_manager.connect(websocket, client_id)
        
        while True:
            try:
                # Receive message
                data = await websocket.receive_json()
                
                # Process message
                if data["type"] == "start_rectification":
                    await socket_manager.start_rectification(client_id, data["data"])
                else:
                    await websocket.send_json({
                        "type": "error",
                        "data": {"message": "Unknown message type"}
                    })
                    
            except WebSocketDisconnect:
                await socket_manager.disconnect(client_id)
                break
                
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "data": {"message": "Invalid JSON format"}
                })
                
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                await websocket.send_json({
                    "type": "error",
                    "data": {"message": str(e)}
                })
                
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        if client_id in socket_manager.active_connections:
            await socket_manager.disconnect(client_id) 