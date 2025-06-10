"""Tests for the enhanced data preprocessing module."""

import pytest
from datetime import datetime
import numpy as np
from ..data_preprocessor import DataPreprocessor

@pytest.fixture
def preprocessor():
    """Create data preprocessor instance for testing."""
    return DataPreprocessor()

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
        "type": "career",
        "time": "2020-01-01 12:00:00",
        "description": "Job promotion",
        "intensity": 0.8
    }

@pytest.fixture
def sample_planetary():
    """Create sample planetary positions for testing."""
    return {
        "Sun": 45.0,
        "Moon": 120.0,
        "Mars": 90.0,
        "Mercury": 180.0,
        "Jupiter": 270.0,
        "Venus": 300.0,
        "Saturn": 330.0
    }

def test_initialization(preprocessor):
    """Test data preprocessor initialization."""
    assert preprocessor.preprocessing_rules is not None
    assert len(preprocessor.scalers) == 3
    assert len(preprocessor.imputers) == 3
    assert preprocessor.feature_selector is not None
    assert preprocessor.pca is not None
    assert preprocessor.preprocessing_metrics["total_processed"] == 0

def test_birth_data_preprocessing(preprocessor, sample_birth_data):
    """Test birth data preprocessing."""
    processed_data, info = preprocessor.preprocess_data(
        sample_birth_data,
        "birth_data"
    )
    
    assert "latitude_scaled" in processed_data
    assert "longitude_scaled" in processed_data
    assert -1 <= processed_data["latitude_scaled"] <= 1
    assert -1 <= processed_data["longitude_scaled"] <= 1
    assert "feature_scaling" in info["transformations"]

def test_event_preprocessing(preprocessor, sample_events):
    """Test event data preprocessing."""
    processed_data, info = preprocessor.preprocess_data(
        sample_events,
        "events",
        feature_selection=True
    )
    
    assert "type_encoded" in processed_data
    assert "intensity_scaled" in processed_data
    assert 0 <= processed_data["intensity_scaled"] <= 1
    assert "categorical_encoding" in info["transformations"]
    assert "feature_scaling" in info["transformations"]

def test_planetary_preprocessing(preprocessor, sample_planetary):
    """Test planetary position preprocessing."""
    processed_data, info = preprocessor.preprocess_data(
        sample_planetary,
        "planetary",
        dimensionality_reduction=True
    )
    
    assert any(key.startswith("pca_component_") for key in processed_data)
    assert "feature_scaling" in info["transformations"]
    assert "dimensionality_reduction" in info["transformations"]

def test_missing_value_handling(preprocessor):
    """Test missing value handling."""
    data = {
        "type": "career",
        "time": "2020-01-01 12:00:00",
        "description": "Job promotion",
        "intensity": None
    }
    
    processed_data, info = preprocessor.preprocess_data(data, "events")
    
    assert processed_data["intensity"] is not None
    assert info["missing_values"]["total_missing"] == 1
    assert "intensity" in info["missing_values"]["imputed_fields"]

def test_outlier_handling(preprocessor):
    """Test outlier detection and handling."""
    data = {
        "type": "career",
        "time": "2020-01-01 12:00:00",
        "description": "Job promotion",
        "intensity": 5.0  # Outlier value
    }
    
    processed_data, info = preprocessor.preprocess_data(data, "events")
    
    assert processed_data["intensity"] <= 3.0  # Clipped to threshold
    assert info["outliers"]["total_outliers"] == 1
    assert "intensity" in info["outliers"]["outlier_fields"]

def test_categorical_encoding(preprocessor):
    """Test categorical variable encoding."""
    data = {
        "type": "career",
        "time": "2020-01-01 12:00:00",
        "description": "Job promotion",
        "intensity": 0.8
    }
    
    processed_data, info = preprocessor.preprocess_data(data, "events")
    
    assert "type_encoded" in processed_data
    assert isinstance(processed_data["type_encoded"], int)
    assert "categorical_encoding" in info["transformations"]

def test_feature_scaling(preprocessor):
    """Test feature scaling."""
    # Test standard scaling
    birth_data = {
        "date": "1990-01-01",
        "time": "12:00:00",
        "latitude": 40.7128,
        "longitude": -74.0060
    }
    processed_birth, info1 = preprocessor.preprocess_data(birth_data, "birth_data")
    assert -5 <= processed_birth["latitude_scaled"] <= 5
    assert -5 <= processed_birth["longitude_scaled"] <= 5
    
    # Test minmax scaling
    event_data = {
        "type": "career",
        "time": "2020-01-01 12:00:00",
        "description": "Job promotion",
        "intensity": 0.8
    }
    processed_event, info2 = preprocessor.preprocess_data(event_data, "events")
    assert 0 <= processed_event["intensity_scaled"] <= 1

def test_feature_selection(preprocessor):
    """Test feature selection."""
    data = {
        "type": "career",
        "time": "2020-01-01 12:00:00",
        "description": "Job promotion",
        "intensity": 0.8,
        "confidence": 0.9,
        "impact": 0.7
    }
    
    processed_data, info = preprocessor.preprocess_data(
        data,
        "events",
        feature_selection=True
    )
    
    assert len(info["selected_features"]) > 0
    assert all(f"{feature}_scaled" in processed_data for feature in info["selected_features"])

def test_dimensionality_reduction(preprocessor, sample_planetary):
    """Test dimensionality reduction."""
    processed_data, info = preprocessor.preprocess_data(
        sample_planetary,
        "planetary",
        dimensionality_reduction=True
    )
    
    pca_components = [k for k in processed_data if k.startswith("pca_component_")]
    assert len(pca_components) > 0
    assert not any(k.endswith("_scaled") for k in processed_data)
    assert "dimensionality_reduction" in info["transformations"]

def test_input_validation(preprocessor):
    """Test input data validation."""
    # Test invalid birth data
    invalid_birth = {
        "date": "invalid",
        "time": "12:00:00",
        "latitude": 40.7128,
        "longitude": -74.0060
    }
    with pytest.raises(ValueError):
        preprocessor.preprocess_data(invalid_birth, "birth_data")
    
    # Test invalid planetary data
    invalid_planetary = {
        "Sun": 400.0,  # Invalid position
        "Moon": 120.0
    }
    with pytest.raises(ValueError):
        preprocessor.preprocess_data(invalid_planetary, "planetary")

def test_metrics_tracking(preprocessor, sample_events):
    """Test preprocessing metrics tracking."""
    # Process multiple events
    for _ in range(3):
        preprocessor.preprocess_data(sample_events, "events")
    
    metrics = preprocessor.preprocessing_metrics
    assert metrics["total_processed"] == 3
    assert metrics["missing_values"] >= 0
    assert metrics["outliers_detected"] >= 0
    assert metrics["features_selected"] >= 0

def test_error_handling(preprocessor):
    """Test error handling in preprocessing."""
    # Test with invalid data type
    with pytest.raises(ValueError):
        preprocessor.preprocess_data({}, "invalid_type")
    
    # Test with missing required fields
    with pytest.raises(ValueError):
        preprocessor.preprocess_data({"date": "1990-01-01"}, "birth_data")
    
    # Test with invalid coordinate ranges
    invalid_coords = {
        "date": "1990-01-01",
        "time": "12:00:00",
        "latitude": 100.0,  # Invalid latitude
        "longitude": -74.0060
    }
    with pytest.raises(ValueError):
        preprocessor.preprocess_data(invalid_coords, "birth_data") 