from typing import Dict, Any, List, Optional, Union
import requests
import json
import asyncio
import aiohttp
from datetime import datetime
from ..utils.error_handler import ErrorHandler
from ..config.api_config import APIConfig
from ..models.ml_request import MLRequest
from ..models.ml_response import MLResponse

class ExternalMLIntegrator:
    def __init__(self, config: Dict[str, Any]):
        self.error_handler = ErrorHandler()
        self.config = config
        self.api_config = APIConfig()
        self.service_endpoints = self._load_service_endpoints()
        self.api_keys = self._load_api_keys()
        self.rate_limiters = self._initialize_rate_limiters()
        
    async def process_request(
        self,
        request: MLRequest,
        context: Optional[Dict[str, Any]] = None
    ) -> MLResponse:
        """Process a request using external ML services."""
        try:
            # Validate request
            validated_request = self._validate_request(request)
            
            # Select appropriate services
            selected_services = self._select_services(validated_request, context)
            
            # Process request with selected services
            results = await self._process_with_services(
                validated_request,
                selected_services,
                context
            )
            
            # Combine and validate results
            combined_results = self._combine_results(results)
            validated_results = self._validate_results(combined_results)
            
            return MLResponse(
                request_id=request.request_id,
                results=validated_results,
                metadata=self._generate_response_metadata(results)
            )
            
        except Exception as e:
            self.error_handler.handle_error(
                "External ML service processing failed",
                str(e),
                severity="high"
            )
            return self._get_fallback_response(request)
    
    def _load_service_endpoints(self) -> Dict[str, Dict[str, Any]]:
        """Load external service endpoint configurations."""
        try:
            return {
                'openai': {
                    'base_url': 'https://api.openai.com/v1',
                    'endpoints': {
                        'completion': '/completions',
                        'embedding': '/embeddings'
                    }
                },
                'huggingface': {
                    'base_url': 'https://api-inference.huggingface.co/models',
                    'endpoints': {
                        'inference': '/{model}'
                    }
                },
                'azure_ml': {
                    'base_url': 'https://{workspace}.azureml.net',
                    'endpoints': {
                        'prediction': '/v1/service/{endpoint_name}/score'
                    }
                }
            }
            
        except Exception as e:
            self.error_handler.handle_error(
                "Service endpoint loading failed",
                str(e),
                severity="critical"
            )
            return {}
    
    def _load_api_keys(self) -> Dict[str, str]:
        """Load API keys for external services."""
        try:
            return self.api_config.load_api_keys()
            
        except Exception as e:
            self.error_handler.handle_error(
                "API key loading failed",
                str(e),
                severity="critical"
            )
            return {}
    
    def _initialize_rate_limiters(self) -> Dict[str, Any]:
        """Initialize rate limiters for external services."""
        return {
            'openai': {
                'requests_per_minute': 60,
                'tokens_per_minute': 150000
            },
            'huggingface': {
                'requests_per_minute': 30,
                'inference_time': 10
            },
            'azure_ml': {
                'requests_per_second': 10,
                'concurrent_requests': 5
            }
        }
    
    def _validate_request(self, request: MLRequest) -> MLRequest:
        """Validate and preprocess the ML request."""
        try:
            # Validate request format
            if not request.is_valid():
                raise ValueError("Invalid request format")
            
            # Check required fields
            self._check_required_fields(request)
            
            # Validate input data
            self._validate_input_data(request.input_data)
            
            # Validate request parameters
            self._validate_parameters(request.parameters)
            
            return request
            
        except Exception as e:
            self.error_handler.handle_error(
                "Request validation failed",
                str(e),
                severity="high"
            )
            raise
    
    def _select_services(
        self,
        request: MLRequest,
        context: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Select appropriate external services for the request."""
        try:
            selected = []
            
            # Check service capabilities
            for service, config in self.service_endpoints.items():
                if self._service_matches_request(service, request, context):
                    selected.append({
                        'service': service,
                        'config': config,
                        'priority': self._calculate_service_priority(
                            service,
                            request,
                            context
                        )
                    })
            
            # Sort by priority
            selected.sort(key=lambda x: x['priority'], reverse=True)
            
            return selected
            
        except Exception as e:
            self.error_handler.handle_error(
                "Service selection failed",
                str(e),
                severity="medium"
            )
            return []
    
    async def _process_with_services(
        self,
        request: MLRequest,
        services: List[Dict[str, Any]],
        context: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Process request with selected external services."""
        try:
            tasks = []
            
            async with aiohttp.ClientSession() as session:
                for service in services:
                    task = self._process_single_service(
                        session,
                        service,
                        request,
                        context
                    )
                    tasks.append(task)
                
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Filter out failed results
                valid_results = [
                    r for r in results
                    if not isinstance(r, Exception)
                ]
                
                return valid_results
                
        except Exception as e:
            self.error_handler.handle_error(
                "Service processing failed",
                str(e),
                severity="high"
            )
            return []
    
    async def _process_single_service(
        self,
        session: aiohttp.ClientSession,
        service: Dict[str, Any],
        request: MLRequest,
        context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Process request with a single external service."""
        try:
            # Prepare request for service
            service_request = self._prepare_service_request(
                service,
                request,
                context
            )
            
            # Check rate limits
            await self._check_rate_limits(service['service'])
            
            # Make API call
            async with session.post(
                service_request['url'],
                json=service_request['data'],
                headers=service_request['headers']
            ) as response:
                response_data = await response.json()
                
                # Process response
                processed_response = self._process_service_response(
                    service['service'],
                    response_data
                )
                
                return {
                    'service': service['service'],
                    'response': processed_response,
                    'metadata': {
                        'timestamp': datetime.utcnow().isoformat(),
                        'status': response.status,
                        'latency': response.headers.get('x-process-time')
                    }
                }
                
        except Exception as e:
            self.error_handler.handle_error(
                f"Service {service['service']} processing failed",
                str(e),
                severity="medium"
            )
            raise
    
    def _combine_results(
        self,
        results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Combine results from multiple services."""
        try:
            combined = {
                'predictions': self._combine_predictions(results),
                'confidence_scores': self._combine_confidence_scores(results),
                'metadata': self._combine_metadata(results)
            }
            
            return combined
            
        except Exception as e:
            self.error_handler.handle_error(
                "Result combination failed",
                str(e),
                severity="medium"
            )
            return {}
    
    def _validate_results(
        self,
        results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate combined results."""
        try:
            # Validate predictions
            validated_predictions = self._validate_predictions(
                results['predictions']
            )
            
            # Check confidence scores
            validated_confidence = self._validate_confidence_scores(
                results['confidence_scores']
            )
            
            # Ensure consistency
            consistent_results = self._ensure_result_consistency(
                validated_predictions,
                validated_confidence
            )
            
            return consistent_results
            
        except Exception as e:
            self.error_handler.handle_error(
                "Result validation failed",
                str(e),
                severity="medium"
            )
            return results
    
    def _generate_response_metadata(
        self,
        results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate metadata for the response."""
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'services_used': [r['service'] for r in results],
            'processing_time': sum(
                float(r['metadata']['latency'] or 0)
                for r in results
            ),
            'success_rate': len(results) / len(self.service_endpoints)
        }
    
    def _get_fallback_response(
        self,
        request: MLRequest
    ) -> MLResponse:
        """Return fallback response when processing fails."""
        return MLResponse(
            request_id=request.request_id,
            results={},
            metadata={
                'timestamp': datetime.utcnow().isoformat(),
                'status': 'failed',
                'error': 'Processing failed, using fallback response'
            }
        ) 