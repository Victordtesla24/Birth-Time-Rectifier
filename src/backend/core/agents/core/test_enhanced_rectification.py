import pytest
from datetime import datetime, timedelta
from typing import Dict, Any
from .enhanced_rectification import EnhancedRectificationEngine
from ..models.birth_data import BirthData

@pytest.fixture
def engine():
    """Create an instance of EnhancedRectificationEngine."""
    return EnhancedRectificationEngine()

@pytest.fixture
def sample_birth_data():
    """Create sample birth data for testing."""
    return BirthData(
        birth_time=datetime.now(),
        latitude=40.7128,
        longitude=-74.0060,
        location="New York"
    )

@pytest.fixture
def sample_positions():
    """Create sample planetary positions for testing."""
    return {
        'Sun': 45.0,
        'Moon': 120.0,
        'Mars': 180.0,
        'Mercury': 90.0,
        'Jupiter': 150.0,
        'Venus': 60.0,
        'Saturn': 30.0,
        'Rahu': 200.0,
        'Ketu': 20.0
    }

@pytest.fixture
def sample_events():
    """Create sample life events for testing."""
    return [
        {
            'type': 'career',
            'date': '2020-01-01',
            'description': 'Job change'
        },
        {
            'type': 'relationship',
            'date': '2019-06-15',
            'description': 'Marriage'
        }
    ]

def test_initialization(engine):
    """Test initialization of EnhancedRectificationEngine."""
    assert engine.refinement_passes == 3
    assert engine.precision_threshold == 0.001
    assert len(engine.tattwa_elements) == 5
    assert 'fire' in engine.tattwa_elements
    assert 'earth' in engine.tattwa_elements
    assert 'air' in engine.tattwa_elements
    assert 'water' in engine.tattwa_elements
    assert 'ether' in engine.tattwa_elements

def test_tattwa_balance_calculation(engine, sample_positions):
    """Test calculation of Tattwa balance."""
    balance = engine.calculate_tattwa_balance(sample_positions)
    
    assert isinstance(balance, dict)
    assert len(balance) == 5
    assert all(0 <= score <= 1 for score in balance.values())
    assert abs(sum(balance.values()) - 1.0) < 0.0001

def test_multi_pass_refinement(engine, sample_birth_data, sample_events):
    """Test multi-pass refinement process."""
    result = engine.calculate_precise_time(sample_birth_data, sample_events)
    
    assert result is not None
    assert isinstance(result.rectified_time, datetime)
    assert isinstance(result.confidence_score, float)
    assert 0 <= result.confidence_score <= 1
    assert isinstance(result.planetary_positions, dict)
    assert isinstance(result.element_balance, dict)

def test_confidence_calculation(engine, sample_birth_data, sample_positions, sample_events):
    """Test confidence score calculation."""
    confidence = engine._calculate_confidence(
        sample_birth_data,
        sample_positions,
        {'fire': 0.2, 'earth': 0.2, 'air': 0.2, 'water': 0.2, 'ether': 0.2},
        sample_events
    )
    
    assert isinstance(confidence, float)
    assert 0 <= confidence <= 1

def test_event_correlation(engine, sample_positions, sample_events):
    """Test event correlation analysis."""
    correlation = engine._evaluate_event_correlations(sample_positions, sample_events)
    
    assert isinstance(correlation, float)
    assert 0 <= correlation <= 1

def test_planetary_strength(engine, sample_positions):
    """Test planetary strength calculation."""
    strength = engine._evaluate_planetary_strengths(sample_positions)
    
    assert isinstance(strength, float)
    assert 0 <= strength <= 1

def test_chart_harmony(engine, sample_positions):
    """Test chart harmony evaluation."""
    harmony = engine._evaluate_chart_harmony(sample_positions)
    
    assert isinstance(harmony, float)
    assert 0 <= harmony <= 1

def test_precision_threshold(engine, sample_birth_data):
    """Test precision threshold in refinement process."""
    # Test with a small window
    engine.precision_threshold = 0.0001
    result1 = engine.calculate_precise_time(sample_birth_data)
    
    # Test with a larger window
    engine.precision_threshold = 0.01
    result2 = engine.calculate_precise_time(sample_birth_data)
    
    # Second result should have fewer refinement iterations
    assert result2.confidence_score <= result1.confidence_score

def test_invalid_input_handling(engine):
    """Test handling of invalid input data."""
    with pytest.raises(ValueError):
        engine.calculate_precise_time(None)
    
    with pytest.raises(ValueError):
        engine.calculate_tattwa_balance({})
    
    with pytest.raises(ValueError):
        engine._calculate_confidence(None, {}, {}, None) 