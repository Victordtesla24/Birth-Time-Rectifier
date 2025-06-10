"""
Pydantic models for API request/response schemas
"""
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class BirthDataRequest(BaseModel):
    birthDate: str = Field(..., description="Birth date in DD/MM/YYYY format")
    birthTime: str = Field(..., description="Birth time in HH:MM format")
    birthPlace: str = Field(..., description="Birth place (city, country)")
    latitude: Optional[float] = Field(None, description="Latitude of birth place")
    longitude: Optional[float] = Field(None, description="Longitude of birth place")
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "birthDate": "24/10/1985",
                "birthTime": "14:30",
                "birthPlace": "Pune, India",
                "latitude": 18.5204,
                "longitude": 73.8567
            }]
        }
    }

class Event(BaseModel):
    type: str
    date: str
    description: str
    impact: str
    timeAccuracy: str
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "type": "life_event",
                "date": "2020-01-01",
                "description": "Got married",
                "impact": "high",
                "timeAccuracy": "exact"
            }]
        }
    }

class RectificationRequest(BaseModel):
    birthData: BirthDataRequest
    stage: str = Field(..., description="Analysis stage (preliminary/final)")
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "birthData": {
                    "birthDate": "24/10/1985",
                    "birthTime": "14:30",
                    "birthPlace": "Pune, India",
                    "latitude": 18.5204,
                    "longitude": 73.8567
                },
                "stage": "preliminary"
            }]
        }
    }

class MLAnalysisRequest(BaseModel):
    birthData: BirthDataRequest
    preliminaryResults: str
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "birthData": {
                    "birthDate": "24/10/1985",
                    "birthTime": "14:30",
                    "birthPlace": "Pune, India"
                },
                "preliminaryResults": "preliminary_analysis_id"
            }]
        }
    }

class QuestionnaireResponse(BaseModel):
    birthData: BirthDataRequest
    responses: Dict[str, Any]
    currentConfidence: float = Field(default=0.0, ge=0.0, le=1.0)
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "birthData": {
                    "birthDate": "24/10/1985",
                    "birthTime": "14:30",
                    "birthPlace": "Pune, India"
                },
                "responses": {
                    "birth_record_type": "Official hospital record",
                    "birth_time_certainty": "yes",
                    "time_of_day": "Afternoon (12 PM - 6 PM)"
                },
                "currentConfidence": 0.5
            }]
        }
    }

class BirthData(BaseModel):
    date: str
    time: str
    latitude: float
    longitude: float
    altitude: Optional[float] = 0 