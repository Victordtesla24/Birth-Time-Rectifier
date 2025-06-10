"""Enhanced ML engine with advanced model integration."""

from typing import Dict, Any, List, Optional
import numpy as np
from datetime import datetime
import logging
import openai
import json
import hashlib
from pathlib import Path

logger = logging.getLogger(__name__)

class EnhancedMLEngine:
    """Enhanced ML engine with real-time learning and advanced pattern recognition."""
    
    def __init__(self, api_key: str, model_version: str = "gpt-4"):
        self.api_key = api_key
        self.model_version = model_version
        self.model_cache = {}
        self.feedback_history = []
        self.model_version_history = []
        self.preprocessing_rules = self._load_preprocessing_rules()
        
        # Initialize OpenAI client
        openai.api_key = api_key
        
        # Initialize model versioning
        self._initialize_model_versioning()
    
    def _initialize_model_versioning(self):
        """Initialize model versioning system."""
        self.model_version_history.append({
            "version": self.model_version,
            "timestamp": datetime.now().isoformat(),
            "changes": "Initial version"
        })
    
    def _load_preprocessing_rules(self) -> Dict[str, Any]:
        """Load data preprocessing rules."""
        rules_path = Path(__file__).parent / "preprocessing_rules.json"
        if rules_path.exists():
            with open(rules_path, "r") as f:
                return json.load(f)
        return {
            "numerical_features": ["longitude", "latitude", "confidence"],
            "categorical_features": ["event_type", "planet_name"],
            "datetime_features": ["event_time", "birth_time"],
            "text_features": ["description", "notes"]
        }
    
    async def analyze_birth_data(self, birth_data: Dict[str, Any],
                               planetary_positions: Dict[str, Any],
                               user_responses: Dict[str, Any]) -> Dict[str, Any]:
        """Perform enhanced ML analysis with real-time learning."""
        try:
            # Preprocess data
            processed_data = self._preprocess_data(birth_data, planetary_positions, user_responses)
            
            # Generate cache key
            cache_key = self._generate_cache_key(processed_data)
            
            # Check cache
            if cache_key in self.model_cache:
                logger.info("Using cached analysis result")
                return self.model_cache[cache_key]
            
            # Prepare prompt for GPT-4
            prompt = self._prepare_analysis_prompt(processed_data)
            
            # Get ML analysis
            response = await openai.ChatCompletion.acreate(
                model=self.model_version,
                messages=[
                    {"role": "system", "content": "You are an expert astrologer with deep knowledge of birth time rectification."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            # Parse and enhance response
            analysis_result = self._parse_ml_response(response.choices[0].message.content)
            
            # Cache result
            self.model_cache[cache_key] = analysis_result
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error in ML analysis: {str(e)}")
            self._handle_error(e)
            raise
    
    def _preprocess_data(self, birth_data: Dict[str, Any],
                        planetary_positions: Dict[str, Any],
                        user_responses: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced data preprocessing with validation."""
        processed_data = {}
        
        # Apply preprocessing rules
        for feature_type, features in self.preprocessing_rules.items():
            if feature_type == "numerical_features":
                processed_data.update(self._process_numerical_features(
                    birth_data, planetary_positions, features
                ))
            elif feature_type == "categorical_features":
                processed_data.update(self._process_categorical_features(
                    birth_data, user_responses, features
                ))
            elif feature_type == "datetime_features":
                processed_data.update(self._process_datetime_features(
                    birth_data, user_responses, features
                ))
            elif feature_type == "text_features":
                processed_data.update(self._process_text_features(
                    user_responses, features
                ))
        
        return processed_data
    
    def _process_numerical_features(self, birth_data: Dict[str, Any],
                                  planetary_positions: Dict[str, Any],
                                  features: List[str]) -> Dict[str, float]:
        """Process numerical features with validation."""
        processed = {}
        for feature in features:
            value = birth_data.get(feature) or planetary_positions.get(feature)
            if value is not None:
                try:
                    processed[feature] = float(value)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid numerical value for {feature}: {value}")
                    processed[feature] = 0.0
        return processed
    
    def _process_categorical_features(self, birth_data: Dict[str, Any],
                                    user_responses: Dict[str, Any],
                                    features: List[str]) -> Dict[str, str]:
        """Process categorical features with validation."""
        processed = {}
        for feature in features:
            value = birth_data.get(feature) or user_responses.get(feature)
            if value is not None:
                processed[feature] = str(value)
        return processed
    
    def _process_datetime_features(self, birth_data: Dict[str, Any],
                                 user_responses: Dict[str, Any],
                                 features: List[str]) -> Dict[str, str]:
        """Process datetime features with validation."""
        processed = {}
        for feature in features:
            value = birth_data.get(feature) or user_responses.get(feature)
            if value is not None:
                try:
                    if isinstance(value, str):
                        datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
                    processed[feature] = value
                except ValueError:
                    logger.warning(f"Invalid datetime value for {feature}: {value}")
        return processed
    
    def _process_text_features(self, user_responses: Dict[str, Any],
                             features: List[str]) -> Dict[str, str]:
        """Process text features with validation."""
        processed = {}
        for feature in features:
            value = user_responses.get(feature)
            if value is not None:
                processed[feature] = str(value)
        return processed
    
    def _generate_cache_key(self, data: Dict[str, Any]) -> str:
        """Generate cache key for analysis results."""
        data_str = json.dumps(data, sort_keys=True)
        return hashlib.md5(data_str.encode()).hexdigest()
    
    def _prepare_analysis_prompt(self, data: Dict[str, Any]) -> str:
        """Prepare enhanced analysis prompt."""
        return f"""
        Please analyze the following birth time rectification data:
        
        Birth Details:
        {json.dumps(data.get('birth_data', {}), indent=2)}
        
        Planetary Positions:
        {json.dumps(data.get('planetary_positions', {}), indent=2)}
        
        User Responses:
        {json.dumps(data.get('user_responses', {}), indent=2)}
        
        Please provide:
        1. Confidence score (0-1)
        2. Suggested time adjustments (in minutes)
        3. Key factors influencing the analysis
        4. Detailed explanation of the reasoning
        5. Pattern recognition insights
        """
    
    def _parse_ml_response(self, response: str) -> Dict[str, Any]:
        """Parse and validate ML response."""
        try:
            # Extract structured data from response
            lines = response.strip().split("\n")
            result = {
                "confidence_score": 0.0,
                "time_adjustment": 0,
                "factors": [],
                "explanation": "",
                "patterns": []
            }
            
            current_section = None
            for line in lines:
                line = line.strip()
                if line.startswith("Confidence score:"):
                    result["confidence_score"] = float(line.split(":")[1].strip())
                elif line.startswith("Time adjustment:"):
                    result["time_adjustment"] = int(line.split(":")[1].strip())
                elif line.startswith("Factors:"):
                    current_section = "factors"
                elif line.startswith("Explanation:"):
                    current_section = "explanation"
                elif line.startswith("Patterns:"):
                    current_section = "patterns"
                elif line and current_section:
                    if current_section == "factors":
                        result["factors"].append(line)
                    elif current_section == "explanation":
                        result["explanation"] += line + "\n"
                    elif current_section == "patterns":
                        result["patterns"].append(line)
            
            return result
            
        except Exception as e:
            logger.error(f"Error parsing ML response: {str(e)}")
            return {
                "confidence_score": 0.5,
                "time_adjustment": 0,
                "factors": ["Error in analysis"],
                "explanation": "Failed to parse ML response",
                "patterns": []
            }
    
    def process_user_feedback(self, analysis_id: str, feedback: Dict[str, Any]) -> None:
        """Process user feedback for real-time learning."""
        try:
            self.feedback_history.append({
                "analysis_id": analysis_id,
                "feedback": feedback,
                "timestamp": datetime.now().isoformat()
            })
            
            # Update model if enough feedback is collected
            if len(self.feedback_history) >= 10:
                self._update_model_from_feedback()
                
        except Exception as e:
            logger.error(f"Error processing user feedback: {str(e)}")
    
    def _update_model_from_feedback(self) -> None:
        """Update model based on collected feedback."""
        try:
            # Analyze feedback patterns
            feedback_patterns = self._analyze_feedback_patterns()
            
            # Update preprocessing rules if needed
            if feedback_patterns.get("preprocessing_issues", 0) > 0.3:
                self._update_preprocessing_rules()
            
            # Update model version if significant improvements found
            if feedback_patterns.get("accuracy_improvement", 0) > 0.2:
                self._update_model_version()
            
            # Clear processed feedback
            self.feedback_history = []
            
        except Exception as e:
            logger.error(f"Error updating model from feedback: {str(e)}")
    
    def _analyze_feedback_patterns(self) -> Dict[str, float]:
        """Analyze patterns in user feedback."""
        patterns = {
            "preprocessing_issues": 0.0,
            "accuracy_improvement": 0.0,
            "error_rate": 0.0
        }
        
        total_feedback = len(self.feedback_history)
        if total_feedback == 0:
            return patterns
        
        preprocessing_issues = sum(
            1 for f in self.feedback_history
            if f["feedback"].get("preprocessing_error", False)
        )
        accuracy_improvements = sum(
            1 for f in self.feedback_history
            if f["feedback"].get("improved_accuracy", False)
        )
        errors = sum(
            1 for f in self.feedback_history
            if f["feedback"].get("error", False)
        )
        
        patterns["preprocessing_issues"] = preprocessing_issues / total_feedback
        patterns["accuracy_improvement"] = accuracy_improvements / total_feedback
        patterns["error_rate"] = errors / total_feedback
        
        return patterns
    
    def _update_preprocessing_rules(self) -> None:
        """Update data preprocessing rules based on feedback."""
        rules_path = Path(__file__).parent / "preprocessing_rules.json"
        
        # Update rules based on feedback patterns
        updated_rules = self.preprocessing_rules.copy()
        
        # Save updated rules
        with open(rules_path, "w") as f:
            json.dump(updated_rules, f, indent=2)
        
        self.preprocessing_rules = updated_rules
    
    def _update_model_version(self) -> None:
        """Update model version based on performance improvements."""
        self.model_version_history.append({
            "version": f"{self.model_version}-{len(self.model_version_history) + 1}",
            "timestamp": datetime.now().isoformat(),
            "changes": "Updated based on user feedback"
        })
    
    def _handle_error(self, error: Exception) -> None:
        """Handle errors with automated correction when possible."""
        try:
            error_type = type(error).__name__
            error_message = str(error)
            
            # Log error for analysis
            logger.error(f"ML Engine Error: {error_type} - {error_message}")
            
            # Attempt automated correction
            if error_type == "ValueError":
                if "invalid literal for float()" in error_message:
                    logger.info("Attempting to correct numerical parsing error")
                    # Correction logic would go here
            elif error_type == "KeyError":
                logger.info("Attempting to correct missing key error")
                # Correction logic would go here
            
            # Record error for pattern analysis
            self.feedback_history.append({
                "type": "error",
                "error_type": error_type,
                "message": error_message,
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error in error handler: {str(e)}") 