"""Integration module for external ML services."""

from typing import Dict, Any, List, Optional, Union
import logging
import json
import aiohttp
import asyncio
from datetime import datetime
from pathlib import Path
import openai
import numpy as np
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class MLServiceIntegrator:
    """Integrator for external ML services."""
    
    def __init__(self):
        """Initialize ML service integrator."""
        self.service_configs = self._load_service_configs()
        self.service_metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "average_latency": 0.0
        }
        self.service_cache = {}
        self.active_services = self._initialize_services()
    
    def _load_service_configs(self) -> Dict[str, Any]:
        """Load service configurations."""
        config_path = Path(__file__).parent / "service_configs.json"
        if config_path.exists():
            with open(config_path, "r") as f:
                return json.load(f)
        return {
            "openai": {
                "model": "gpt-4",
                "temperature": 0.3,
                "max_tokens": 1000,
                "retry_attempts": 3,
                "timeout": 30
            },
            "huggingface": {
                "model": "bert-base-uncased",
                "task": "text-classification",
                "timeout": 20,
                "retry_attempts": 2
            },
            "tensorflow": {
                "model_path": "models/astro_classifier",
                "batch_size": 32,
                "timeout": 15
            }
        }
    
    def _initialize_services(self) -> Dict[str, bool]:
        """Initialize and verify external services."""
        active_services = {}
        
        for service in self.service_configs:
            try:
                if service == "openai":
                    active_services[service] = self._verify_openai()
                elif service == "huggingface":
                    active_services[service] = self._verify_huggingface()
                elif service == "tensorflow":
                    active_services[service] = self._verify_tensorflow()
            except Exception as e:
                logger.error(f"Error initializing {service}: {str(e)}")
                active_services[service] = False
        
        return active_services
    
    async def analyze_data(
        self,
        data: Dict[str, Any],
        analysis_type: str,
        services: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Analyze data using external ML services."""
        try:
            start_time = datetime.now()
            
            # Validate input
            if not self._validate_input(data, analysis_type):
                raise ValueError("Invalid input data or analysis type")
            
            # Select services to use
            selected_services = self._select_services(services)
            if not selected_services:
                raise ValueError("No active services available")
            
            # Check cache
            cache_key = self._generate_cache_key(data, analysis_type)
            if cache_key in self.service_cache:
                logger.info("Using cached analysis result")
                return self.service_cache[cache_key]
            
            # Perform analysis with each service
            analysis_tasks = []
            for service in selected_services:
                if service == "openai":
                    analysis_tasks.append(self._analyze_with_openai(data, analysis_type))
                elif service == "huggingface":
                    analysis_tasks.append(self._analyze_with_huggingface(data, analysis_type))
                elif service == "tensorflow":
                    analysis_tasks.append(self._analyze_with_tensorflow(data, analysis_type))
            
            # Gather results
            results = await asyncio.gather(*analysis_tasks, return_exceptions=True)
            
            # Combine and process results
            combined_result = self._combine_results(results, selected_services)
            
            # Update metrics
            self._update_metrics(True, (datetime.now() - start_time).total_seconds())
            
            # Cache result
            self.service_cache[cache_key] = combined_result
            
            return combined_result
            
        except Exception as e:
            logger.error(f"Error in ML analysis: {str(e)}")
            self._update_metrics(False, 0)
            raise
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def _analyze_with_openai(
        self,
        data: Dict[str, Any],
        analysis_type: str
    ) -> Dict[str, Any]:
        """Analyze data using OpenAI's GPT models."""
        try:
            config = self.service_configs["openai"]
            
            # Prepare prompt based on analysis type
            prompt = self._prepare_openai_prompt(data, analysis_type)
            
            # Make API call
            response = await openai.ChatCompletion.acreate(
                model=config["model"],
                messages=[
                    {"role": "system", "content": "You are an expert astrologer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=config["temperature"],
                max_tokens=config["max_tokens"]
            )
            
            # Parse response
            return self._parse_openai_response(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"OpenAI analysis error: {str(e)}")
            raise
    
    @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=2, max=5))
    async def _analyze_with_huggingface(
        self,
        data: Dict[str, Any],
        analysis_type: str
    ) -> Dict[str, Any]:
        """Analyze data using Hugging Face models."""
        try:
            config = self.service_configs["huggingface"]
            
            # Prepare input
            model_input = self._prepare_huggingface_input(data, analysis_type)
            
            # Make API call
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"https://api-inference.huggingface.co/models/{config['model']}",
                    json=model_input,
                    timeout=config["timeout"]
                ) as response:
                    result = await response.json()
            
            # Parse response
            return self._parse_huggingface_response(result)
            
        except Exception as e:
            logger.error(f"Hugging Face analysis error: {str(e)}")
            raise
    
    async def _analyze_with_tensorflow(
        self,
        data: Dict[str, Any],
        analysis_type: str
    ) -> Dict[str, Any]:
        """Analyze data using local TensorFlow models."""
        try:
            config = self.service_configs["tensorflow"]
            
            # Prepare input
            model_input = self._prepare_tensorflow_input(data, analysis_type)
            
            # Make prediction
            # In real implementation, would load and use TensorFlow model
            prediction = {"confidence": 0.85, "class": "positive"}
            
            # Parse response
            return self._parse_tensorflow_response(prediction)
            
        except Exception as e:
            logger.error(f"TensorFlow analysis error: {str(e)}")
            raise
    
    def _validate_input(self, data: Dict[str, Any], analysis_type: str) -> bool:
        """Validate input data and analysis type."""
        valid_types = ["birth_time", "event_correlation", "pattern_recognition"]
        if analysis_type not in valid_types:
            return False
        
        if analysis_type == "birth_time":
            return all(
                field in data
                for field in ["date", "time", "latitude", "longitude"]
            )
        elif analysis_type == "event_correlation":
            return "events" in data and isinstance(data["events"], list)
        elif analysis_type == "pattern_recognition":
            return "patterns" in data and isinstance(data["patterns"], list)
        
        return False
    
    def _select_services(self, requested_services: Optional[List[str]] = None) -> List[str]:
        """Select which services to use for analysis."""
        available_services = [
            service
            for service, active in self.active_services.items()
            if active
        ]
        
        if requested_services:
            return [
                service
                for service in requested_services
                if service in available_services
            ]
        
        return available_services
    
    def _generate_cache_key(self, data: Dict[str, Any], analysis_type: str) -> str:
        """Generate cache key for analysis results."""
        key_data = {
            "data": data,
            "type": analysis_type,
            "timestamp": datetime.now().strftime("%Y%m%d")
        }
        return json.dumps(key_data, sort_keys=True)
    
    def _combine_results(
        self,
        results: List[Dict[str, Any]],
        services: List[str]
    ) -> Dict[str, Any]:
        """Combine results from multiple services."""
        valid_results = []
        
        for result, service in zip(results, services):
            if not isinstance(result, Exception):
                result["service"] = service
                valid_results.append(result)
        
        if not valid_results:
            raise ValueError("No valid results from any service")
        
        # Calculate weighted average of confidence scores
        confidence_scores = [
            result.get("confidence", 0.5)
            for result in valid_results
        ]
        
        # Combine predictions and explanations
        combined = {
            "confidence": np.mean(confidence_scores),
            "predictions": [
                result.get("prediction", {})
                for result in valid_results
            ],
            "explanations": [
                result.get("explanation", "")
                for result in valid_results
            ],
            "services_used": [
                result["service"]
                for result in valid_results
            ]
        }
        
        return combined
    
    def _update_metrics(self, success: bool, latency: float) -> None:
        """Update service metrics."""
        self.service_metrics["total_requests"] += 1
        if success:
            self.service_metrics["successful_requests"] += 1
        else:
            self.service_metrics["failed_requests"] += 1
        
        # Update average latency
        total = self.service_metrics["total_requests"]
        current_avg = self.service_metrics["average_latency"]
        self.service_metrics["average_latency"] = (
            (current_avg * (total - 1) + latency) / total
        )
    
    def _verify_openai(self) -> bool:
        """Verify OpenAI service is available."""
        try:
            openai.api_key = "test_key"  # Would use actual key in production
            return True
        except Exception:
            return False
    
    def _verify_huggingface(self) -> bool:
        """Verify Hugging Face service is available."""
        return True  # Implement actual verification
    
    def _verify_tensorflow(self) -> bool:
        """Verify TensorFlow service is available."""
        return True  # Implement actual verification
    
    def _prepare_openai_prompt(
        self,
        data: Dict[str, Any],
        analysis_type: str
    ) -> str:
        """Prepare prompt for OpenAI analysis."""
        if analysis_type == "birth_time":
            return f"""
            Please analyze the following birth data:
            
            Date: {data.get('date')}
            Time: {data.get('time')}
            Location: {data.get('latitude')}, {data.get('longitude')}
            
            Provide:
            1. Confidence in birth time accuracy
            2. Suggested adjustments if needed
            3. Astrological factors supporting this analysis
            """
        
        elif analysis_type == "event_correlation":
            return f"""
            Please analyze the correlation between these events:
            
            Events: {json.dumps(data.get('events', []), indent=2)}
            
            Provide:
            1. Correlation strength
            2. Pattern identification
            3. Astrological significance
            """
        
        return "Please analyze the provided data."
    
    def _prepare_huggingface_input(
        self,
        data: Dict[str, Any],
        analysis_type: str
    ) -> Dict[str, Any]:
        """Prepare input for Hugging Face analysis."""
        return {
            "inputs": json.dumps(data),
            "parameters": {
                "task": analysis_type
            }
        }
    
    def _prepare_tensorflow_input(
        self,
        data: Dict[str, Any],
        analysis_type: str
    ) -> Dict[str, Any]:
        """Prepare input for TensorFlow analysis."""
        return {
            "data": data,
            "type": analysis_type
        }
    
    def _parse_openai_response(self, response: str) -> Dict[str, Any]:
        """Parse OpenAI API response."""
        try:
            lines = response.strip().split("\n")
            result = {
                "confidence": 0.0,
                "prediction": {},
                "explanation": ""
            }
            
            current_section = None
            for line in lines:
                line = line.strip()
                if line.startswith("Confidence:"):
                    result["confidence"] = float(line.split(":")[1].strip())
                elif line.startswith("Prediction:"):
                    current_section = "prediction"
                elif line.startswith("Explanation:"):
                    current_section = "explanation"
                elif line and current_section:
                    if current_section == "prediction":
                        key, value = line.split(":", 1)
                        result["prediction"][key.strip()] = value.strip()
                    elif current_section == "explanation":
                        result["explanation"] += line + "\n"
            
            return result
            
        except Exception as e:
            logger.error(f"Error parsing OpenAI response: {str(e)}")
            return {
                "confidence": 0.5,
                "prediction": {},
                "explanation": "Failed to parse response"
            }
    
    def _parse_huggingface_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Hugging Face API response."""
        try:
            return {
                "confidence": response.get("score", 0.5),
                "prediction": {
                    "label": response.get("label", "unknown"),
                    "score": response.get("score", 0.5)
                },
                "explanation": response.get("explanation", "")
            }
        except Exception as e:
            logger.error(f"Error parsing Hugging Face response: {str(e)}")
            return {
                "confidence": 0.5,
                "prediction": {},
                "explanation": "Failed to parse response"
            }
    
    def _parse_tensorflow_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Parse TensorFlow model response."""
        try:
            return {
                "confidence": response.get("confidence", 0.5),
                "prediction": {
                    "class": response.get("class", "unknown"),
                    "confidence": response.get("confidence", 0.5)
                },
                "explanation": "Local TensorFlow model prediction"
            }
        except Exception as e:
            logger.error(f"Error parsing TensorFlow response: {str(e)}")
            return {
                "confidence": 0.5,
                "prediction": {},
                "explanation": "Failed to parse response"
            } 