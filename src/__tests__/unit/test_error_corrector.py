"""Tests for the automated error correction module."""

import pytest
from datetime import datetime
from ..error_corrector import ErrorCorrector

@pytest.fixture
def error_corrector():
    """Create error corrector instance for testing."""
    return ErrorCorrector()

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
    return [
        {
            "id": "event1",
            "type": "career",
            "time": "2020-01-01 12:00:00",
            "description": "Job promotion",
            "intensity": 0.8
        },
        {
            "id": "event2",
            "type": "relationship",
            "time": "2019-06-15 14:30:00",
            "description": "Marriage",
            "intensity": 0.9
        }
    ]

@pytest.fixture
def sample_planetary_positions():
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

def test_initialization(error_corrector):
    """Test error corrector initialization."""
    assert error_corrector.correction_rules is not None
    assert error_corrector.error_history == []
    assert error_corrector.correction_metrics["total_errors"] == 0
    assert error_corrector.correction_metrics["corrected_errors"] == 0

def test_birth_data_correction(error_corrector):
    """Test birth data error correction."""
    invalid_data = {
        "date": "01/01/1990",  # Wrong format
        "time": "12:00:00",
        "latitude": 40.7128,
        "longitude": -74.0060
    }
    
    corrected_data, result = error_corrector.correct_errors(
        invalid_data,
        "birth_data"
    )
    
    assert result["corrected"]
    assert result["confidence"] > 0
    assert len(result["changes"]) > 0
    assert corrected_data["date"] == "1990-01-01"

def test_event_correction(error_corrector):
    """Test event data error correction."""
    invalid_events = [
        {
            "id": "event1",
            "type": "career",
            "time": "2020-01-01 25:00:00",  # Invalid time
            "description": "Job promotion"
        }
    ]
    
    corrected_data, result = error_corrector.correct_errors(
        invalid_events,
        "events"
    )
    
    assert result["corrected"]
    assert result["confidence"] > 0
    assert len(result["changes"]) > 0
    assert "00:00:00" in corrected_data[0]["time"]

def test_planetary_correction(error_corrector):
    """Test planetary position error correction."""
    invalid_positions = {
        "Sun": 400.0,  # Out of range
        "Moon": 120.0,
        "Mars": 90.0
    }
    
    corrected_data, result = error_corrector.correct_errors(
        invalid_positions,
        "planetary"
    )
    
    assert result["corrected"]
    assert result["confidence"] > 0
    assert len(result["changes"]) > 0
    assert 0 <= corrected_data["Sun"] < 360

def test_coordinate_correction(error_corrector):
    """Test coordinate error correction."""
    invalid_coordinates = {
        "latitude": "40°42'46\"N",  # Wrong format
        "longitude": -74.0060
    }
    
    corrected_data, result = error_corrector.correct_errors(
        invalid_coordinates,
        "coordinates"
    )
    
    assert result["corrected"]
    assert result["confidence"] > 0
    assert len(result["changes"]) > 0
    assert isinstance(corrected_data["latitude"], float)

def test_validation_rules(error_corrector):
    """Test validation rules."""
    # Test birth data validation
    assert error_corrector._validate_date_time(
        "1990-01-01",
        "12:00:00",
        error_corrector.correction_rules["validation_rules"]["birth_data"]
    )
    
    # Test coordinate validation
    assert error_corrector._validate_coordinates(
        40.7128,
        -74.0060,
        error_corrector.correction_rules["validation_rules"]["birth_data"]
    )
    
    # Test event validation
    assert error_corrector._validate_event(
        {
            "id": "event1",
            "type": "career",
            "time": "2020-01-01 12:00:00",
            "description": "Job promotion",
            "intensity": 0.8
        },
        error_corrector.correction_rules["validation_rules"]["events"]
    )
    
    # Test position validation
    assert error_corrector._validate_position(
        45.0,
        error_corrector.correction_rules["validation_rules"]["planetary"]
    )

def test_correction_strategies(error_corrector):
    """Test correction strategy selection."""
    # Test date/time strategy
    strategy = error_corrector._get_correction_strategy(
        "date_time",
        {"date": "01/01/1990"}
    )
    assert strategy == "parse_common_formats"
    
    # Test coordinate strategy
    strategy = error_corrector._get_correction_strategy(
        "coordinates",
        {"latitude": "40°42'46\"N"}
    )
    assert strategy == "convert_to_decimal"
    
    # Test event strategy
    strategy = error_corrector._get_correction_strategy(
        "events",
        [{"id": "event1"}]  # Missing required fields
    )
    assert strategy == "add_default_values"
    
    # Test planetary strategy
    strategy = error_corrector._get_correction_strategy(
        "planetary",
        {"Sun": 400.0}  # Invalid position
    )
    assert strategy == "normalize_position"

def test_confidence_calculation(error_corrector):
    """Test correction confidence calculation."""
    # Test datetime confidence
    confidence = error_corrector._calculate_datetime_confidence(
        {"date": "01/01/1990"},
        {"date": "1990-01-01"}
    )
    assert 0 <= confidence <= 1
    
    # Test coordinate confidence
    confidence = error_corrector._calculate_coordinates_confidence(
        {"latitude": "40°42'46\"N"},
        {"latitude": 40.7128}
    )
    assert 0 <= confidence <= 1
    
    # Test event confidence
    confidence = error_corrector._calculate_events_confidence(
        [{"time": "2020-01-01 25:00:00"}],
        [{"time": "2020-01-02 00:00:00"}]
    )
    assert 0 <= confidence <= 1
    
    # Test planetary confidence
    confidence = error_corrector._calculate_planetary_confidence(
        {"Sun": 400.0},
        {"Sun": 40.0}
    )
    assert 0 <= confidence <= 1

def test_metrics_update(error_corrector):
    """Test correction metrics updates."""
    # Test successful correction
    error_corrector._update_metrics(True)
    assert error_corrector.correction_metrics["total_errors"] == 1
    assert error_corrector.correction_metrics["corrected_errors"] == 1
    assert error_corrector.correction_metrics["correction_rate"] == 1.0
    
    # Test failed correction
    error_corrector._update_metrics(False)
    assert error_corrector.correction_metrics["total_errors"] == 2
    assert error_corrector.correction_metrics["corrected_errors"] == 1
    assert error_corrector.correction_metrics["correction_rate"] == 0.5

def test_correction_changes(error_corrector):
    """Test correction change tracking."""
    original = {
        "date": "01/01/1990",
        "time": "12:00:00"
    }
    
    corrected = {
        "date": "1990-01-01",
        "time": "12:00:00"
    }
    
    changes = error_corrector._get_correction_changes(original, corrected)
    assert len(changes) == 1
    assert changes[0]["field"] == "date"
    assert changes[0]["original"] == "01/01/1990"
    assert changes[0]["corrected"] == "1990-01-01"

def test_error_handling(error_corrector):
    """Test error handling in correction process."""
    # Test with invalid input
    corrected_data, result = error_corrector.correct_errors(
        None,
        "unknown_type"
    )
    
    assert not result["corrected"]
    assert result["confidence"] == 0.0
    assert len(result["changes"]) == 0
    
    # Test with missing required fields
    corrected_data, result = error_corrector.correct_errors(
        {},
        "birth_data"
    )
    
    assert not result["corrected"]
    assert result["confidence"] == 0.0
    assert len(result["changes"]) == 0 