"""Tests for enhanced birth time rectification."""

import pytest
from datetime import datetime, timedelta
from typing import Dict, Any
from ..enhanced_rectification import EnhancedRectificationEngine
from ...models.birth_data import BirthData

@pytest.fixture
def engine():
    """Create rectification engine instance."""
    return EnhancedRectificationEngine()

@pytest.fixture
def sample_birth_data():
    """Create sample birth data."""
    return BirthData(
        date=datetime(1990, 1, 1).date(),
        time=datetime(1990, 1, 1, 12, 0).time(),
        latitude=40.7128,
        longitude=-74.0060
    )

@pytest.fixture
def sample_positions():
    """Create sample planetary positions."""
    return {
        "Sun": 45.0,
        "Moon": 120.0,
        "Mars": 90.0,
        "Mercury": 180.0,
        "Jupiter": 270.0,
        "Venus": 300.0,
        "Saturn": 330.0
    }

@pytest.fixture
def sample_appearance_data():
    """Create sample physical appearance data."""
    return {
        "height": 0.7,  # Normalized to 0-1 range
        "build": 0.6,
        "complexion": 0.5
    }

def test_advanced_tattwa_shodhana(engine, sample_positions):
    """Test advanced Tattwa Shodhana implementation."""
    result = engine._advanced_tattwa_shodhana(sample_positions)
    
    # Verify structure
    assert "elements" in result
    assert "balance_score" in result
    assert "elemental_harmony" in result
    
    # Verify elements
    for element in ["fire", "earth", "air", "water", "ether"]:
        assert element in result["elements"]
        assert "score" in result["elements"][element]
        assert "characteristics" in result["elements"][element]
        assert "contributing_planets" in result["elements"][element]
    
    # Verify score ranges
    assert 0 <= result["balance_score"] <= 1
    assert 0 <= result["elemental_harmony"] <= 1
    
    # Verify planet contributions
    for element in result["elements"].values():
        for planet in element["contributing_planets"]:
            assert "planet" in planet
            assert "strength" in planet
            assert 0 <= planet["strength"] <= 1

def test_physical_appearance_correlation(engine, sample_birth_data, sample_appearance_data):
    """Test physical appearance correlation calculation."""
    correlations = engine._calculate_physical_appearance_correlation(
        sample_birth_data,
        sample_appearance_data
    )
    
    # Verify structure
    assert "height" in correlations
    assert "build" in correlations
    assert "complexion" in correlations
    
    # Verify correlation ranges
    for correlation in correlations.values():
        assert -1 <= correlation <= 1
    
    # Test with missing data
    partial_data = {"height": 0.7}
    partial_correlations = engine._calculate_physical_appearance_correlation(
        sample_birth_data,
        partial_data
    )
    assert "height" in partial_correlations
    assert 0 <= partial_correlations["height"] <= 1

def test_advanced_dasha_verification(engine, sample_birth_data):
    """Test advanced dasha-based verification."""
    events = [
        {
            "type": "career",
            "time": datetime(2020, 1, 1, 12, 0),
            "description": "Job promotion"
        },
        {
            "type": "relationship",
            "time": datetime(2019, 6, 15, 14, 30),
            "description": "Marriage"
        }
    ]
    
    result = engine._calculate_dasha_verification(sample_birth_data, events)
    
    # Verify structure
    assert "dasha_correlations" in result
    assert "period_strengths" in result
    assert "confidence_score" in result
    
    # Verify dasha correlations
    assert len(result["dasha_correlations"]) == len(events)
    for correlation in result["dasha_correlations"]:
        assert "event" in correlation
        assert "dasha_lord" in correlation
        assert "antardasha_lord" in correlation
        assert "correlation" in correlation
        assert 0 <= correlation["correlation"] <= 1
    
    # Verify confidence score
    assert 0 <= result["confidence_score"] <= 1

def test_advanced_balance_score(engine):
    """Test advanced balance score calculation."""
    # Test perfect balance
    perfect_values = [1.0, 1.0, 1.0, 1.0]
    perfect_score = engine._calculate_advanced_balance_score(perfect_values)
    assert perfect_score > 0.9
    
    # Test moderate imbalance
    moderate_values = [1.0, 0.8, 0.6, 0.4]
    moderate_score = engine._calculate_advanced_balance_score(moderate_values)
    assert 0.4 < moderate_score < 0.8
    
    # Test severe imbalance
    imbalanced_values = [1.0, 0.2, 0.1, 0.1]
    imbalanced_score = engine._calculate_advanced_balance_score(imbalanced_values)
    assert imbalanced_score < 0.4
    
    # Test empty list
    empty_score = engine._calculate_advanced_balance_score([])
    assert empty_score == 0.0

def test_elemental_harmony(engine):
    """Test elemental harmony calculation."""
    # Create sample normalized elements
    normalized_elements = {
        "fire": {"score": 0.8},
        "air": {"score": 0.7},
        "water": {"score": 0.6},
        "earth": {"score": 0.5},
        "ether": {"score": 0.9}
    }
    
    harmony = engine._calculate_elemental_harmony(normalized_elements)
    
    # Verify harmony score
    assert 0 <= harmony <= 1
    
    # Test with imbalanced elements
    imbalanced_elements = {
        "fire": {"score": 1.0},
        "air": {"score": 0.2},
        "water": {"score": 0.1},
        "earth": {"score": 0.1},
        "ether": {"score": 0.1}
    }
    
    imbalanced_harmony = engine._calculate_elemental_harmony(imbalanced_elements)
    assert imbalanced_harmony < harmony

def test_trait_correlation(engine, sample_birth_data):
    """Test trait correlation calculation."""
    # Test with valid planets and trait
    planets = ["Jupiter", "Sun", "Mars"]
    correlation = engine._calculate_trait_correlation(
        planets,
        0.7,
        sample_birth_data
    )
    assert -1 <= correlation <= 1
    
    # Test with empty planets
    empty_correlation = engine._calculate_trait_correlation(
        [],
        0.7,
        sample_birth_data
    )
    assert empty_correlation == 0.0
    
    # Test with zero trait value
    zero_correlation = engine._calculate_trait_correlation(
        planets,
        0.0,
        sample_birth_data
    )
    assert zero_correlation == 0.0

def test_error_handling(engine, sample_birth_data):
    """Test error handling in calculations."""
    # Test with invalid positions
    invalid_positions = {"Sun": "invalid"}
    result = engine._advanced_tattwa_shodhana(invalid_positions)
    assert all(element["score"] == 0.0 for element in result["elements"].values())
    
    # Test with invalid appearance data
    invalid_appearance = {"height": "tall"}
    correlations = engine._calculate_physical_appearance_correlation(
        sample_birth_data,
        invalid_appearance
    )
    assert all(correlation == 0.0 for correlation in correlations.values())
    
    # Test with invalid events
    invalid_events = [{"type": "career"}]  # Missing time
    result = engine._calculate_dasha_verification(sample_birth_data, invalid_events)
    assert result["confidence_score"] == 0.0 