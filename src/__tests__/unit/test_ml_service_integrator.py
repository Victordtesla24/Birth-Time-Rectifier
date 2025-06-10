"""Tests for the external ML services integration module."""

import pytest
from datetime import datetime
import json
from unittest.mock import patch, MagicMock
from ..ml_service_integrator import MLServiceIntegrator

@pytest.fixture
def service_integrator():
    """Create service integrator instance for testing."""
    return MLServiceIntegrator()

@pytest.fixture
def sample_birth_data():
    """Create sample birth data for testing."""
    return {
        "date": "1990-01-01",
        "time": "12:00:00",
        "latitude": 40.7128,
        "longitude": -74.0060
    }

@pytest.fixture
def sample_events():
    """Create sample events for testing."""
    return {
        "events": [
            {
                "type": "career",
                "time": "2020-01-01 12:00:00",
                "description": "Job promotion"
            },
            {
                "type": "relationship",
                "time": "2019-06-15 14:30:00",
                "description": "Marriage"
            }
        ]
    }

@pytest.fixture
def sample_patterns():
    """Create sample patterns for testing."""
    return {
        "patterns": [
            {
                "type": "temporal",
                "interval": 30,
                "confidence": 0.8
            },
            {
                "type": "event",
                "category": "career",
                "confidence": 0.9
            }
        ]
    }

def test_initialization(service_integrator):
    """Test service integrator initialization."""
    assert service_integrator.service_configs is not None
    assert service_integrator.service_metrics["total_requests"] == 0
    assert service_integrator.service_cache == {}
    assert isinstance(service_integrator.active_services, dict)

@pytest.mark.asyncio
async def test_analyze_birth_data(service_integrator, sample_birth_data):
    """Test birth data analysis with external services."""
    with patch('openai.ChatCompletion.acreate') as mock_openai:
        mock_openai.return_value = MagicMock(
            choices=[
                MagicMock(
                    message=MagicMock(
                        content="""
                        Confidence: 0.85
                        Prediction: adjustment: +15 minutes
                        Explanation: Strong planetary positions support this adjustment.
                        """
                    )
                )
            ]
        )
        
        result = await service_integrator.analyze_data(
            sample_birth_data,
            "birth_time",
            ["openai"]
        )
        
        assert isinstance(result, dict)
        assert "confidence" in result
        assert "predictions" in result
        assert "explanations" in result
        assert "services_used" in result
        assert result["confidence"] > 0
        assert len(result["predictions"]) > 0
        assert len(result["explanations"]) > 0
        assert "openai" in result["services_used"]

@pytest.mark.asyncio
async def test_analyze_events(service_integrator, sample_events):
    """Test event correlation analysis with external services."""
    with patch('openai.ChatCompletion.acreate') as mock_openai:
        mock_openai.return_value = MagicMock(
            choices=[
                MagicMock(
                    message=MagicMock(
                        content="""
                        Confidence: 0.9
                        Prediction: strong_correlation
                        Explanation: Clear pattern in career progression.
                        """
                    )
                )
            ]
        )
        
        result = await service_integrator.analyze_data(
            sample_events,
            "event_correlation",
            ["openai"]
        )
        
        assert isinstance(result, dict)
        assert result["confidence"] > 0
        assert len(result["predictions"]) > 0
        assert any("correlation" in str(p).lower() for p in result["predictions"])

@pytest.mark.asyncio
async def test_analyze_patterns(service_integrator, sample_patterns):
    """Test pattern recognition analysis with external services."""
    with patch('openai.ChatCompletion.acreate') as mock_openai:
        mock_openai.return_value = MagicMock(
            choices=[
                MagicMock(
                    message=MagicMock(
                        content="""
                        Confidence: 0.95
                        Prediction: significant_pattern
                        Explanation: Strong temporal and event patterns detected.
                        """
                    )
                )
            ]
        )
        
        result = await service_integrator.analyze_data(
            sample_patterns,
            "pattern_recognition",
            ["openai"]
        )
        
        assert isinstance(result, dict)
        assert result["confidence"] > 0
        assert len(result["predictions"]) > 0
        assert any("pattern" in str(p).lower() for p in result["predictions"])

def test_service_selection(service_integrator):
    """Test service selection logic."""
    # Test with specific services requested
    selected = service_integrator._select_services(["openai", "huggingface"])
    assert all(s in ["openai", "huggingface"] for s in selected)
    
    # Test with no services specified
    selected = service_integrator._select_services()
    assert len(selected) > 0
    assert all(s in service_integrator.active_services for s in selected)

def test_input_validation(service_integrator, sample_birth_data,
                         sample_events, sample_patterns):
    """Test input data validation."""
    # Test birth time validation
    assert service_integrator._validate_input(sample_birth_data, "birth_time")
    
    # Test event correlation validation
    assert service_integrator._validate_input(sample_events, "event_correlation")
    
    # Test pattern recognition validation
    assert service_integrator._validate_input(sample_patterns, "pattern_recognition")
    
    # Test invalid type
    assert not service_integrator._validate_input(sample_birth_data, "invalid_type")

def test_cache_management(service_integrator, sample_birth_data):
    """Test analysis result caching."""
    # Generate cache key
    cache_key = service_integrator._generate_cache_key(
        sample_birth_data,
        "birth_time"
    )
    
    # Add to cache
    cached_result = {
        "confidence": 0.8,
        "predictions": [{"adjustment": "+15 minutes"}],
        "explanations": ["Test explanation"],
        "services_used": ["openai"]
    }
    service_integrator.service_cache[cache_key] = cached_result
    
    # Verify cache key generation
    assert isinstance(cache_key, str)
    assert cache_key in service_integrator.service_cache
    assert service_integrator.service_cache[cache_key] == cached_result

def test_metrics_tracking(service_integrator):
    """Test service metrics tracking."""
    # Test successful request
    service_integrator._update_metrics(True, 0.5)
    assert service_integrator.service_metrics["total_requests"] == 1
    assert service_integrator.service_metrics["successful_requests"] == 1
    assert service_integrator.service_metrics["average_latency"] == 0.5
    
    # Test failed request
    service_integrator._update_metrics(False, 0.0)
    assert service_integrator.service_metrics["total_requests"] == 2
    assert service_integrator.service_metrics["failed_requests"] == 1

def test_openai_integration(service_integrator, sample_birth_data):
    """Test OpenAI service integration."""
    # Test prompt preparation
    prompt = service_integrator._prepare_openai_prompt(
        sample_birth_data,
        "birth_time"
    )
    assert isinstance(prompt, str)
    assert "birth data" in prompt.lower()
    assert str(sample_birth_data["latitude"]) in prompt
    
    # Test response parsing
    response = """
    Confidence: 0.85
    Prediction: adjustment: +15 minutes
    Explanation: Strong planetary positions support this adjustment.
    """
    result = service_integrator._parse_openai_response(response)
    assert result["confidence"] == 0.85
    assert "adjustment" in str(result["prediction"]).lower()
    assert len(result["explanation"]) > 0

def test_huggingface_integration(service_integrator, sample_events):
    """Test Hugging Face service integration."""
    # Test input preparation
    model_input = service_integrator._prepare_huggingface_input(
        sample_events,
        "event_correlation"
    )
    assert isinstance(model_input, dict)
    assert "inputs" in model_input
    assert "parameters" in model_input
    
    # Test response parsing
    response = {
        "label": "strong_correlation",
        "score": 0.9,
        "explanation": "Clear pattern detected"
    }
    result = service_integrator._parse_huggingface_response(response)
    assert result["confidence"] == 0.9
    assert result["prediction"]["label"] == "strong_correlation"
    assert len(result["explanation"]) > 0

def test_tensorflow_integration(service_integrator, sample_patterns):
    """Test TensorFlow service integration."""
    # Test input preparation
    model_input = service_integrator._prepare_tensorflow_input(
        sample_patterns,
        "pattern_recognition"
    )
    assert isinstance(model_input, dict)
    assert "data" in model_input
    assert "type" in model_input
    
    # Test response parsing
    response = {
        "class": "significant_pattern",
        "confidence": 0.95
    }
    result = service_integrator._parse_tensorflow_response(response)
    assert result["confidence"] == 0.95
    assert result["prediction"]["class"] == "significant_pattern"
    assert len(result["explanation"]) > 0

def test_result_combination(service_integrator):
    """Test combination of results from multiple services."""
    results = [
        {
            "confidence": 0.8,
            "prediction": {"adjustment": "+15 minutes"},
            "explanation": "OpenAI prediction"
        },
        {
            "confidence": 0.9,
            "prediction": {"label": "significant"},
            "explanation": "Hugging Face prediction"
        }
    ]
    services = ["openai", "huggingface"]
    
    combined = service_integrator._combine_results(results, services)
    assert isinstance(combined, dict)
    assert combined["confidence"] == 0.85  # Average of 0.8 and 0.9
    assert len(combined["predictions"]) == 2
    assert len(combined["explanations"]) == 2
    assert combined["services_used"] == services

def test_error_handling(service_integrator):
    """Test error handling in service integration."""
    # Test with invalid input
    with pytest.raises(ValueError):
        service_integrator._validate_input(None, "invalid_type")
    
    # Test with failed service
    failed_results = [Exception("Service failed"), {"confidence": 0.8}]
    services = ["failed_service", "working_service"]
    
    combined = service_integrator._combine_results(failed_results, services)
    assert len(combined["predictions"]) == 1
    assert len(combined["services_used"]) == 1
    assert "working_service" in combined["services_used"] 