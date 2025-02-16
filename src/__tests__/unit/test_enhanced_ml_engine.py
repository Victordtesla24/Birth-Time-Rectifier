import pytest
from datetime import datetime
import json
from pathlib import Path
from ..enhanced_ml_engine import EnhancedMLEngine

@pytest.fixture
def ml_engine():
    return EnhancedMLEngine("test_api_key")

@pytest.fixture
def sample_birth_data():
    return {
        "date": "1990-01-01",
        "time": "12:00:00",
        "location": "New York",
        "latitude": 40.7128,
        "longitude": -74.0060
    }

@pytest.fixture
def sample_planetary_positions():
    return {
        "Sun": {"longitude": 280.5, "latitude": 0.0},
        "Moon": {"longitude": 120.3, "latitude": 1.2},
        "Mars": {"longitude": 45.8, "latitude": -0.5}
    }

@pytest.fixture
def sample_user_responses():
    return {
        "event_type": "career",
        "time": "14:30:00",
        "description": "Job promotion",
        "confidence": 0.8
    }

@pytest.mark.asyncio
async def test_analyze_birth_data(ml_engine, sample_birth_data,
                                sample_planetary_positions, sample_user_responses):
    """Test ML analysis with real-time learning."""
    result = await ml_engine.analyze_birth_data(
        sample_birth_data,
        sample_planetary_positions,
        sample_user_responses
    )
    
    assert isinstance(result, dict)
    assert "confidence_score" in result
    assert "time_adjustment" in result
    assert "factors" in result
    assert "explanation" in result
    assert "patterns" in result

def test_preprocess_data(ml_engine, sample_birth_data,
                        sample_planetary_positions, sample_user_responses):
    """Test enhanced data preprocessing."""
    processed = ml_engine._preprocess_data(
        sample_birth_data,
        sample_planetary_positions,
        sample_user_responses
    )
    
    assert isinstance(processed, dict)
    assert "longitude" in processed
    assert "latitude" in processed
    assert "event_type" in processed
    assert isinstance(processed["longitude"], float)
    assert isinstance(processed["event_type"], str)

def test_process_user_feedback(ml_engine):
    """Test real-time learning from user feedback."""
    feedback = {
        "improved_accuracy": True,
        "preprocessing_error": False,
        "comments": "Better results after adjustment"
    }
    
    ml_engine.process_user_feedback("test_analysis", feedback)
    assert len(ml_engine.feedback_history) == 1
    assert ml_engine.feedback_history[0]["feedback"] == feedback

def test_analyze_feedback_patterns(ml_engine):
    """Test feedback pattern analysis."""
    # Add sample feedback
    feedbacks = [
        {"improved_accuracy": True, "preprocessing_error": False},
        {"improved_accuracy": True, "preprocessing_error": True},
        {"improved_accuracy": False, "preprocessing_error": True},
        {"error": True}
    ]
    
    for i, feedback in enumerate(feedbacks):
        ml_engine.process_user_feedback(f"test_{i}", feedback)
    
    patterns = ml_engine._analyze_feedback_patterns()
    assert "preprocessing_issues" in patterns
    assert "accuracy_improvement" in patterns
    assert "error_rate" in patterns
    assert isinstance(patterns["preprocessing_issues"], float)

def test_model_versioning(ml_engine):
    """Test model versioning system."""
    assert len(ml_engine.model_version_history) == 1
    assert ml_engine.model_version_history[0]["version"] == ml_engine.model_version
    
    # Simulate model update
    ml_engine._update_model_version()
    assert len(ml_engine.model_version_history) == 2
    assert ml_engine.model_version_history[-1]["version"].startswith(ml_engine.model_version)

def test_preprocessing_rules(ml_engine):
    """Test preprocessing rules management."""
    rules = ml_engine._load_preprocessing_rules()
    assert isinstance(rules, dict)
    assert "numerical_features" in rules
    assert "categorical_features" in rules
    assert "datetime_features" in rules
    assert "text_features" in rules

def test_error_handling(ml_engine):
    """Test automated error correction."""
    # Test numerical error handling
    error = ValueError("invalid literal for float(): 'abc'")
    ml_engine._handle_error(error)
    assert len(ml_engine.feedback_history) == 1
    assert ml_engine.feedback_history[0]["type"] == "error"
    
    # Test missing key error handling
    error = KeyError("missing_key")
    ml_engine._handle_error(error)
    assert len(ml_engine.feedback_history) == 2

def test_cache_management(ml_engine, sample_birth_data,
                        sample_planetary_positions, sample_user_responses):
    """Test analysis result caching."""
    # Generate cache key
    processed_data = ml_engine._preprocess_data(
        sample_birth_data,
        sample_planetary_positions,
        sample_user_responses
    )
    cache_key = ml_engine._generate_cache_key(processed_data)
    
    # Add to cache
    ml_engine.model_cache[cache_key] = {
        "confidence_score": 0.8,
        "time_adjustment": 15,
        "factors": ["Test factor"],
        "explanation": "Test explanation",
        "patterns": ["Test pattern"]
    }
    
    # Verify cache hit
    assert cache_key in ml_engine.model_cache
    assert ml_engine.model_cache[cache_key]["confidence_score"] == 0.8

def test_datetime_validation(ml_engine):
    """Test datetime feature validation."""
    valid_data = {"birth_time": "2023-01-01 12:00:00"}
    invalid_data = {"birth_time": "invalid_time"}
    
    # Test valid datetime
    processed = ml_engine._process_datetime_features(
        valid_data, {}, ["birth_time"]
    )
    assert "birth_time" in processed
    
    # Test invalid datetime
    processed = ml_engine._process_datetime_features(
        invalid_data, {}, ["birth_time"]
    )
    assert "birth_time" not in processed 