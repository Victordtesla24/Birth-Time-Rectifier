"""
Rectification service implementation
"""
from datetime import datetime
from typing import Dict, Any
import logging

from ..models.schemas import (
    BirthDataRequest,
    RectificationRequest,
    MLAnalysisRequest,
    QuestionnaireResponse,
    BirthData
)
from src.backend.core.rectification_agent import BirthTimeRectificationAgent
from src.backend.core.chart_generator import UnifiedChartGenerator

logger = logging.getLogger(__name__)

class RectificationService:
    def __init__(self):
        self.rectification_agent = BirthTimeRectificationAgent()
        self.chart_generator = UnifiedChartGenerator()

    async def start_rectification(self, birth_data: BirthDataRequest):
        """Start rectification process"""
        logger.debug(f"Received birth data: {birth_data.model_dump()}")
        
        # Validate date format
        try:
            datetime.strptime(birth_data.birthDate, "%d/%m/%Y")
        except ValueError:
            raise ValueError("Invalid date format. Use DD/MM/YYYY")
            
        # Validate time format
        try:
            datetime.strptime(birth_data.birthTime, "%H:%M")
        except ValueError:
            raise ValueError("Invalid time format. Use HH:MM (24-hour)")
        
        # Convert date format
        date_obj = datetime.strptime(birth_data.birthDate, "%d/%m/%Y")
        formatted_date = date_obj.strftime("%Y-%m-%d")
        
        mapped_data = {
            "birth_details": {
                "date": formatted_date,
                "time": birth_data.birthTime,
                "location": birth_data.birthPlace
            }
        }
        
        result = await self.rectification_agent.process_input(mapped_data)
        return {"status": "success", **result}

    async def analyze_rectification(self, request: RectificationRequest):
        """Analyze birth time rectification"""
        return await self.rectification_agent.analyze(
            request.birthData,
            request.stage
        )

    async def get_questions(self):
        """Get dynamic questionnaire"""
        return await self.rectification_agent.generate_questions()

    async def process_questionnaire(self, request: QuestionnaireResponse):
        """Process questionnaire responses"""
        return await self.rectification_agent.process_responses(
            request.birthData,
            request.responses,
            request.currentConfidence
        )

    async def ml_analysis(self, request: MLAnalysisRequest):
        """Perform ML-based analysis"""
        return await self.rectification_agent.perform_ml_analysis(
            request.birthData,
            request.preliminaryResults
        )

    async def generate_chart(self, birth_data: BirthData) -> Dict[str, Any]:
        """Generate astrological chart"""
        return await self.chart_generator.generate_chart(
            birth_data.date,
            birth_data.time,
            birth_data.latitude,
            birth_data.longitude,
            birth_data.altitude
        ) 