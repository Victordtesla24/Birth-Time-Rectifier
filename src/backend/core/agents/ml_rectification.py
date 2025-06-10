from typing import Dict, Any, Optional, List
import logging
import json
from datetime import datetime
import os
from pathlib import Path
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class MLRectificationEngine:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize ML rectification engine with learning capabilities."""
        self.api_key = api_key
        self.client = AsyncOpenAI(api_key=api_key)
        
        # Initialize learning database paths
        self.data_dir = Path(__file__).parent.parent.parent / "data" / "ml_learning"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.case_history_file = self.data_dir / "case_history.json"
        self.learning_patterns_file = self.data_dir / "learning_patterns.json"
        self.confidence_metrics_file = self.data_dir / "confidence_metrics.json"
        
        # Initialize or load learning data
        self._initialize_learning_data()
        
        logger.info("ML Rectification Engine initialized with learning capabilities")

    def _initialize_learning_data(self):
        """Initialize or load learning data from files."""
        try:
            # Initialize case history
            if self.case_history_file.exists():
                with open(self.case_history_file, 'r') as f:
                    self.case_history = json.load(f)
            else:
                self.case_history = []
                self._save_case_history()

            # Initialize learning patterns
            if self.learning_patterns_file.exists():
                with open(self.learning_patterns_file, 'r') as f:
                    self.learning_patterns = json.load(f)
            else:
                self.learning_patterns = {
                    "time_correlations": {},
                    "event_patterns": {},
                    "confidence_factors": {},
                    "success_metrics": {
                        "total_cases": 0,
                        "high_confidence_cases": 0,
                        "average_confidence": 0.0
                    }
                }
                self._save_learning_patterns()

            # Initialize confidence metrics
            if self.confidence_metrics_file.exists():
                with open(self.confidence_metrics_file, 'r') as f:
                    self.confidence_metrics = json.load(f)
            else:
                self.confidence_metrics = {
                    "threshold_adjustments": [],
                    "confidence_history": [],
                    "validation_metrics": {
                        "true_positives": 0,
                        "false_positives": 0,
                        "accuracy": 0.0
                    }
                }
                self._save_confidence_metrics()

        except Exception as e:
            logger.error(f"Error initializing learning data: {str(e)}")
            raise

    def _save_case_history(self):
        """Save case history to file."""
        with open(self.case_history_file, 'w') as f:
            json.dump(self.case_history, f, indent=2)

    def _save_learning_patterns(self):
        """Save learning patterns to file."""
        with open(self.learning_patterns_file, 'w') as f:
            json.dump(self.learning_patterns, f, indent=2)

    def _save_confidence_metrics(self):
        """Save confidence metrics to file."""
        with open(self.confidence_metrics_file, 'w') as f:
            json.dump(self.confidence_metrics, f, indent=2)

    def _update_learning_patterns(self, birth_data: Dict[str, Any], 
                                analysis_result: Dict[str, Any],
                                confidence_score: float):
        """Update learning patterns based on new case data."""
        try:
            # Update success metrics
            self.learning_patterns["success_metrics"]["total_cases"] += 1
            if confidence_score >= 0.95:
                self.learning_patterns["success_metrics"]["high_confidence_cases"] += 1
            
            # Calculate new average confidence
            total_confidence = (
                self.learning_patterns["success_metrics"]["average_confidence"] * 
                (self.learning_patterns["success_metrics"]["total_cases"] - 1) +
                confidence_score
            )
            self.learning_patterns["success_metrics"]["average_confidence"] = (
                total_confidence / self.learning_patterns["success_metrics"]["total_cases"]
            )

            # Update time correlations
            birth_hour = int(birth_data["time"].split(":")[0])
            time_key = f"hour_{birth_hour}"
            if time_key not in self.learning_patterns["time_correlations"]:
                self.learning_patterns["time_correlations"][time_key] = {
                    "count": 0,
                    "avg_confidence": 0.0,
                    "success_rate": 0.0
                }
            
            time_stats = self.learning_patterns["time_correlations"][time_key]
            time_stats["count"] += 1
            time_stats["avg_confidence"] = (
                (time_stats["avg_confidence"] * (time_stats["count"] - 1) + confidence_score) /
                time_stats["count"]
            )
            time_stats["success_rate"] = (
                time_stats["count"] / self.learning_patterns["success_metrics"]["total_cases"]
            )

            # Save updated patterns
            self._save_learning_patterns()
            
        except Exception as e:
            logger.error(f"Error updating learning patterns: {str(e)}")
            raise

    async def analyze_birth_data(self, birth_data: Dict[str, Any],
                               planetary_positions: Dict[str, Any],
                               questionnaire_responses: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze birth data using ML techniques with continuous learning."""
        try:
            # Prepare analysis context
            analysis_context = {
                "birth_data": birth_data,
                "planetary_positions": planetary_positions,
                "questionnaire_responses": questionnaire_responses,
                "learning_patterns": self.learning_patterns
            }

            # Generate analysis prompt
            prompt = self._generate_analysis_prompt(analysis_context)

            # Get ML analysis from OpenAI
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert astrologer and data scientist specializing in birth time rectification."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )

            # Process ML response
            analysis_result = self._process_ml_response(response.choices[0].message.content)

            # Calculate confidence score
            confidence_score = await self.evaluate_confidence(birth_data, {
                "analysis_results": analysis_result,
                "questionnaire_responses": questionnaire_responses
            })

            # Update learning patterns with new case data
            self._update_learning_patterns(birth_data, analysis_result, confidence_score)

            # Add case to history
            case_data = {
                "timestamp": datetime.now().isoformat(),
                "birth_data": birth_data,
                "analysis_result": analysis_result,
                "confidence_score": confidence_score
            }
            self.case_history.append(case_data)
            self._save_case_history()

            # Return enhanced analysis results
            return {
                "time_adjustment": analysis_result.get("time_adjustment", 0),
                "confidence_score": confidence_score,
                "factors": analysis_result.get("factors", {}),
                "explanation": analysis_result.get("explanation", ""),
                "learning_metrics": {
                    "total_cases_analyzed": self.learning_patterns["success_metrics"]["total_cases"],
                    "average_confidence": self.learning_patterns["success_metrics"]["average_confidence"],
                    "pattern_strength": self._calculate_pattern_strength(birth_data)
                }
            }

        except Exception as e:
            logger.error(f"Error in ML analysis: {str(e)}")
            raise

    def _generate_analysis_prompt(self, context: Dict[str, Any]) -> str:
        """Generate detailed analysis prompt incorporating learning patterns."""
        birth_data = context["birth_data"]
        questionnaire = context["questionnaire_responses"]
        learning_patterns = context["learning_patterns"]

        prompt = f"""
        Analyze the following birth time rectification case and provide a response in JSON format with the following structure:
        {{
            "time_adjustment": <number: hours to adjust, can be negative>,
            "confidence_score": <number between 0 and 1>,
            "confidence_factors": {{
                "record_quality": <string: "low", "medium", or "high">,
                "pattern_match": <string: "weak", "moderate", or "strong">,
                "historical_correlation": <string: "negative", "neutral", or "positive">
            }},
            "explanation": <string: detailed explanation>,
            "factors": {{
                <key-value pairs of relevant factors>
            }}
        }}
        
        Birth Details:
        - Date: {birth_data['date']}
        - Time: {birth_data['time']}
        - Location: {birth_data['location']}
        
        Historical Learning Patterns:
        - Total cases analyzed: {learning_patterns['success_metrics']['total_cases']}
        - Average confidence: {learning_patterns['success_metrics']['average_confidence']:.2%}
        - Similar time pattern success rate: {self._get_time_pattern_success_rate(birth_data['time']):.2%}
        
        Questionnaire Responses:
        {json.dumps(questionnaire, indent=2)}
        
        Based on the above data and learning patterns:
        1. Analyze the birth time accuracy
        2. Suggest any necessary adjustments
        3. Explain the confidence level
        4. Identify key factors influencing the analysis
        
        IMPORTANT: Ensure the response is in valid JSON format with all the required fields as shown in the structure above.
        """
        return prompt

    def _process_ml_response(self, response_text: str) -> Dict[str, Any]:
        """Process and structure the ML response."""
        try:
            # Extract JSON from response
            start_idx = response_text.find("{")
            end_idx = response_text.rfind("}") + 1
            json_str = response_text[start_idx:end_idx]
            
            # Parse and validate response
            analysis = json.loads(json_str)
            
            # Ensure required fields exist with default values if missing
            processed_analysis = {
                "time_adjustment": analysis.get("time_adjustment", 0),
                "confidence_score": analysis.get("confidence_score", 0.5),
                "confidence_factors": analysis.get("confidence_factors", {
                    "record_quality": "medium",
                    "pattern_match": "moderate",
                    "historical_correlation": "neutral"
                }),
                "explanation": analysis.get("explanation", "Analysis completed with default confidence."),
                "factors": analysis.get("factors", {})
            }
            
            return processed_analysis
            
        except Exception as e:
            logger.error(f"Error processing ML response: {str(e)}")
            # Return a default analysis structure
            return {
                "time_adjustment": 0,
                "confidence_score": 0.5,
                "confidence_factors": {
                    "record_quality": "medium",
                    "pattern_match": "moderate",
                    "historical_correlation": "neutral"
                },
                "explanation": "Unable to process detailed analysis. Using default values.",
                "factors": {}
            }

    async def evaluate_confidence(self, birth_data: Dict[str, Any],
                                analysis_context: Dict[str, Any]) -> float:
        """Evaluate confidence in the rectification results with learning enhancement."""
        try:
            # Get base confidence from analysis
            base_confidence = float(analysis_context["analysis_results"].get("confidence_score", 0.5))
            
            # Apply learning-based adjustments
            time_pattern_confidence = self._get_time_pattern_confidence(birth_data["time"])
            historical_pattern_confidence = self._get_historical_pattern_confidence(birth_data)
            
            # Weight the confidence factors
            final_confidence = (
                base_confidence * 0.6 +  # Base analysis weight
                time_pattern_confidence * 0.2 +  # Time pattern weight
                historical_pattern_confidence * 0.2  # Historical pattern weight
            )
            
            # Update confidence metrics
            self.confidence_metrics["confidence_history"].append({
                "timestamp": datetime.now().isoformat(),
                "base_confidence": base_confidence,
                "final_confidence": final_confidence,
                "factors": {
                    "time_pattern": time_pattern_confidence,
                    "historical_pattern": historical_pattern_confidence
                }
            })
            self._save_confidence_metrics()
            
            return min(1.0, max(0.0, final_confidence))
            
        except Exception as e:
            logger.error(f"Error in confidence evaluation: {str(e)}")
            raise

    def _get_time_pattern_confidence(self, birth_time: str) -> float:
        """Calculate confidence based on time patterns."""
        try:
            hour = int(birth_time.split(":")[0])
            time_key = f"hour_{hour}"
            
            if time_key in self.learning_patterns["time_correlations"]:
                stats = self.learning_patterns["time_correlations"][time_key]
                return stats["avg_confidence"] * stats["success_rate"]
            return 0.5
        except:
            return 0.5

    def _get_historical_pattern_confidence(self, birth_data: Dict[str, Any]) -> float:
        """Calculate confidence based on historical patterns."""
        try:
            if not self.case_history:
                return 0.5
                
            similar_cases = [
                case for case in self.case_history
                if self._is_similar_case(case["birth_data"], birth_data)
            ]
            
            if not similar_cases:
                return 0.5
                
            return sum(case["confidence_score"] for case in similar_cases) / len(similar_cases)
        except:
            return 0.5

    def _is_similar_case(self, case1: Dict[str, Any], case2: Dict[str, Any]) -> bool:
        """Determine if two cases are similar based on key factors."""
        try:
            # Compare birth times within 2-hour window
            time1 = int(case1["time"].split(":")[0])
            time2 = int(case2["time"].split(":")[0])
            return abs(time1 - time2) <= 2
        except:
            return False

    def _get_time_pattern_success_rate(self, birth_time: str) -> float:
        """Get success rate for similar time patterns."""
        try:
            hour = int(birth_time.split(":")[0])
            time_key = f"hour_{hour}"
            
            if time_key in self.learning_patterns["time_correlations"]:
                return self.learning_patterns["time_correlations"][time_key]["success_rate"]
            return 0.0
        except:
            return 0.0

    def _calculate_pattern_strength(self, birth_data: Dict[str, Any]) -> float:
        """Calculate the strength of pattern matching for the current case."""
        try:
            time_pattern_strength = self._get_time_pattern_success_rate(birth_data["time"])
            historical_pattern_strength = len([
                case for case in self.case_history
                if self._is_similar_case(case["birth_data"], birth_data)
            ]) / max(1, len(self.case_history))
            
            return (time_pattern_strength + historical_pattern_strength) / 2
        except:
            return 0.0
