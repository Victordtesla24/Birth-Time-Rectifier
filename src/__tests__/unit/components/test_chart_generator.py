"""
Test suite for the UnifiedChartGenerator class.
"""

import pytest
from datetime import datetime
from src.backend.agents.core.chart_generator import UnifiedChartGenerator

@pytest.fixture
def chart_generator():
    return UnifiedChartGenerator()

@pytest.fixture
def sample_date():
    return datetime(2024, 2, 15, 12, 0)

@pytest.fixture
def sample_location():
    return {
        "lat": 40.7128,  # New York
        "lon": -74.0060,
        "alt": 0
    }

def test_calculate_positions(chart_generator, sample_date, sample_location):
    """Test planetary position calculations."""
    positions = chart_generator.calculate_positions(
        sample_date,
        sample_location["lat"],
        sample_location["lon"],
        sample_location["alt"]
    )
    
    assert positions is not None
    assert len(positions) > 0
    
    # Verify position structure
    for planet, pos in positions.items():
        assert "longitude" in pos
        assert "latitude" in pos
        assert "distance" in pos
        assert "speed_long" in pos
        assert "speed_lat" in pos
        
        # Verify value ranges
        assert 0 <= pos["longitude"] <= 360
        assert -90 <= pos["latitude"] <= 90

def test_calculate_houses(chart_generator, sample_date, sample_location):
    """Test house cusp calculations."""
    houses = chart_generator.calculate_houses(
        sample_date,
        sample_location["lat"],
        sample_location["lon"]
    )
    
    assert houses is not None
    assert "houses" in houses
    assert "ascendant" in houses
    assert "midheaven" in houses
    
    # Verify house cusps
    assert len(houses["houses"]) == 12
    for cusp in houses["houses"]:
        assert 0 <= cusp <= 360
        
    # Verify angles
    assert 0 <= houses["ascendant"] <= 360
    assert 0 <= houses["midheaven"] <= 360

def test_calculate_aspects(chart_generator, sample_date, sample_location):
    """Test aspect calculations."""
    positions = chart_generator.calculate_positions(
        sample_date,
        sample_location["lat"],
        sample_location["lon"]
    )
    
    aspects = chart_generator.calculate_aspects(positions)
    
    assert aspects is not None
    assert isinstance(aspects, list)
    
    # Verify aspect structure
    for aspect in aspects:
        assert "planet1" in aspect
        assert "planet2" in aspect
        assert "aspect" in aspect
        assert "orb" in aspect
        
        # Verify orb is within limits
        assert aspect["orb"] <= 1.0

def test_generate_chart(chart_generator, sample_date, sample_location):
    """Test complete chart generation."""
    chart = chart_generator.generate_chart(
        sample_date,
        sample_location["lat"],
        sample_location["lon"],
        sample_location["alt"]
    )
    
    assert chart is not None
    assert "timestamp" in chart
    assert "location" in chart
    assert "positions" in chart
    assert "houses" in chart
    assert "aspects" in chart
    
    # Verify location
    assert chart["location"]["latitude"] == sample_location["lat"]
    assert chart["location"]["longitude"] == sample_location["lon"]
    
    # Verify timestamp
    assert chart["timestamp"] == sample_date.isoformat()

def test_calculate_divisional_charts(chart_generator, sample_date, sample_location):
    """Test divisional chart calculations."""
    positions = chart_generator.calculate_positions(
        sample_date,
        sample_location["lat"],
        sample_location["lon"]
    )
    
    d9_chart = chart_generator.calculate_divisional_charts(positions, 9)
    
    assert d9_chart is not None
    assert len(d9_chart) == len(positions)
    
    # Verify position structure in divisional chart
    for planet, pos in d9_chart.items():
        assert "longitude" in pos
        assert "latitude" in pos
        assert "distance" in pos
        assert "speed_long" in pos
        assert "speed_lat" in pos
        
        # Verify value ranges
        assert 0 <= pos["longitude"] <= 360
        assert -90 <= pos["latitude"] <= 90

def test_calculate_kp_sublords(chart_generator, sample_date, sample_location):
    """Test KP sublord calculations."""
    positions = chart_generator.calculate_positions(
        sample_date,
        sample_location["lat"],
        sample_location["lon"]
    )
    
    sublords = chart_generator.calculate_kp_sublords(positions)
    
    assert sublords is not None
    assert len(sublords) == len(positions)
    
    # Verify sublord structure
    for planet, lords in sublords.items():
        assert "star_lord" in lords
        assert "sub_lord" in lords
        
        # Verify lord format
        assert lords["star_lord"].startswith("Star_")
        assert lords["sub_lord"].startswith("Sub_") 