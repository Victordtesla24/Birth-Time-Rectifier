"""
Birth Time Rectification Module
Consolidates all agent functionality into a single module.
"""

from datetime import datetime, timedelta
import logging
from typing import Dict, Any, Union
import os
from dotenv import load_dotenv

from .models.birth_data import BirthData
from .models.rectification_result import RectificationResult
from .core.preprocessing import DataPreprocessor
from .analysis.analysis_coordinator import AnalysisCoordinator
from .ml_rectification import MLRectificationEngine

logger = logging.getLogger(__name__)

class BirthTimeRectificationAgent:
    def __init__(self):
        """Initialize birth time rectification agent."""
        # Load environment variables
        load_dotenv()
        
        # Initialize components
        self.preprocessor = DataPreprocessor()
        self.analysis_coordinator = AnalysisCoordinator()
        
        # Initialize ML engine if API key is available
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            logger.info("OpenAI API key found, initializing ML engine")
            try:
                self.ml_engine = MLRectificationEngine(api_key)
                logger.info("ML engine initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize ML engine: {str(e)}")
                self.ml_engine = None
        else:
            logger.warning("OpenAI API key not found in environment variables")
            logger.info("ML engine will not be available")
            self.ml_engine = None

    def generate_questionnaire(self):
        """Generate a questionnaire for birth time rectification."""
        return {
            "questions": [
                {
                    "id": "early_childhood",
                    "type": "multiple_choice",
                    "question": "What significant events do you remember from your early childhood (ages 0-7)?",
                    "options": [
                        "Major family changes",
                        "Significant health events",
                        "Educational milestones",
                        "Relocations",
                        "Other significant events"
                    ]
                },
                {
                    "id": "life_changes",
                    "type": "multiple_choice",
                    "question": "Have you experienced any major life changes around ages 18-21?",
                    "options": [
                        "Career/Education decisions",
                        "Relationships",
                        "Location changes",
                        "Health events",
                        "Other significant events"
                    ]
                },
                {
                    "id": "career_timing",
                    "type": "multiple_choice",
                    "question": "When did you start your career or higher education?",
                    "options": [
                        "Before age 18",
                        "18-20 years",
                        "21-23 years",
                        "24-25 years",
                        "After 25 years"
                    ]
                }
            ]
        }

    async def process_input(self, input_data: Dict[str, Any], 
                          answers: Dict[str, Any] = None) -> Union[Dict[str, Any], RectificationResult]:
        """Process input data and return rectification results."""
        try:
            # Extract birth details
            birth_details = input_data.get("birth_details", {})
            
            # Validate input data
            if not birth_details:
                raise ValueError("Birth details are required")
                
            date = birth_details.get("date")
            time = birth_details.get("time")
            place = birth_details.get("location")
            
            if not all([date, time, place]):
                raise ValueError(f"Invalid birth data: date={date}, time={time}, location={place}")
            
            # Convert date format from DD/MM/YYYY to YYYY-MM-DD if needed
            try:
                if '/' in date:
                    date_obj = datetime.strptime(date, "%d/%m/%Y")
                    date = date_obj.strftime("%Y-%m-%d")
            except ValueError as e:
                raise ValueError(f"Invalid date format: {date}. Expected format: DD/MM/YYYY or YYYY-MM-DD")

            # Create birth data object
            birth_data = BirthData(
                date=date,
                time=time,
                place=place
            )
            
            # Preprocess birth data
            processed_data = self.preprocessor.preprocess_data(birth_data)
            
            # If answers are provided, perform comprehensive analysis
            if answers:
                final_results = await self.comprehensive_analysis(
                    processed_data,
                    answers
                )
                return final_results
            
            # Otherwise, perform preliminary analysis
            preliminary_results = self.analysis_coordinator.perform_preliminary_analysis(processed_data)
            
            return {
                "birth_data": {
                    "date": birth_data.date,
                    "time": birth_data.time,
                    "location": birth_data.place,
                    "latitude": processed_data.latitude,
                    "longitude": processed_data.longitude,
                    "timezone": processed_data.timezone
                },
                "preliminary_analysis": preliminary_results
            }
            
        except Exception as e:
            logger.error(f"Error in birth time rectification: {str(e)}")
            raise ValueError(f"Error in birth time rectification: {str(e)}")

    async def process_ml_analysis(self, birth_data: Dict[str, Any], 
                                preliminary_results: str) -> Dict[str, Any]:
        """Process ML-based birth time rectification analysis."""
        try:
            if not self.ml_engine:
                raise ValueError("ML engine not available (missing API key)")
            
            # Create birth data object
            birth_details = BirthData(
                date=birth_data["date"],
                time=birth_data["time"],
                place=birth_data["location"]
            )
            
            # Preprocess birth data
            processed_data = self.preprocessor.preprocess_data(birth_details)
            
            # Get preliminary analysis
            prelim_analysis = self.analysis_coordinator.perform_preliminary_analysis(processed_data)
            
            # Get ML-enhanced analysis
            ml_analysis = await self.ml_engine.analyze_birth_data(
                birth_data,
                prelim_analysis.get("planetary_positions", {}),
                {"preliminary_results": preliminary_results}
            )
            
            # Calculate confidence score
            confidence = await self.ml_engine.evaluate_confidence(
                birth_data,
                {
                    "analysis_results": ml_analysis,
                    "preliminary_results": preliminary_results
                }
            )
            
            # Return ML analysis results
            return {
                "confidence_score": confidence,
                "suggested_adjustments": ml_analysis.get("time_adjustment", 0),
                "pattern_analysis": {
                    "planetary_patterns": ml_analysis.get("factors", {}),
                    "chart_patterns": prelim_analysis.get("divisional_charts", {})
                },
                "recommendations": [
                    ml_analysis.get("explanation", "No specific recommendations available")
                ]
            }
            
        except Exception as e:
            logger.error(f"Error in ML analysis: {str(e)}")
            raise ValueError(f"Error in ML analysis: {str(e)}")

    async def comprehensive_analysis(self, birth_data: BirthData,
                                  questionnaire_responses: Dict[str, Any]) -> RectificationResult:
        """Perform comprehensive birth time rectification analysis."""
        try:
            # Get base analysis from coordinator
            result = self.analysis_coordinator.perform_comprehensive_analysis(
                birth_data,
                questionnaire_responses
            )
            
            # If ML engine is available, enhance with ML analysis
            if self.ml_engine:
                ml_analysis = await self.ml_engine.analyze_birth_data(
                    {
                        "date": birth_data.date,
                        "time": birth_data.time,
                        "location": birth_data.place
                    },
                    result.planetary_positions,
                    questionnaire_responses
                )
                
                # Blend traditional and ML confidence scores
                ml_weight = 0.3  # 30% weight to ML analysis
                result.confidence_score = (
                    result.confidence_score * (1 - ml_weight) +
                    float(ml_analysis.get("confidence_score", result.confidence_score)) * ml_weight
                )
            
            return result
            
        except Exception as e:
            logger.error(f"Error in comprehensive analysis: {str(e)}")
            raise ValueError(f"Error in comprehensive analysis: {str(e)}")
