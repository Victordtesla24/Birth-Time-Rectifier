"""
Rectification API routes
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import Dict, Any

from ..models.schemas import (
    BirthDataRequest,
    RectificationRequest,
    MLAnalysisRequest,
    QuestionnaireResponse,
    BirthData
)
from ..services.rectification import RectificationService

router = APIRouter()
rectification_service = RectificationService()

@router.post("/start")
async def start_rectification(birth_data: BirthDataRequest):
    """Start the rectification process"""
    try:
        return await rectification_service.start_rectification(birth_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/analyze")
async def analyze_rectification(request: RectificationRequest):
    """Process birth time rectification analysis"""
    try:
        return await rectification_service.analyze_rectification(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/questions")
async def get_questions():
    """Get dynamic questionnaire"""
    try:
        return await rectification_service.get_questions()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/questions/process")
async def process_questionnaire(request: QuestionnaireResponse):
    """Process questionnaire responses"""
    try:
        return await rectification_service.process_questionnaire(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/ml-analysis")
async def ml_analysis(request: MLAnalysisRequest):
    """Perform ML-based analysis"""
    try:
        return await rectification_service.ml_analysis(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate-chart")
async def generate_chart(birth_data: BirthData) -> Dict[str, Any]:
    """Generate astrological chart"""
    try:
        return await rectification_service.generate_chart(birth_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 