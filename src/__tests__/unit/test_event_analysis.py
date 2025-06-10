"""Tests for the enhanced event analysis module."""

import pytest
from datetime import datetime, timedelta
from typing import Dict, Any, List
from ..event_analysis import EventAnalyzer
from ...models.birth_data import BirthData

@pytest.fixture
def event_analyzer():
    """Create an instance of EventAnalyzer."""
    return EventAnalyzer()

@pytest.fixture
def sample_birth_data():
    """Create sample birth data for testing."""
    return BirthData(
        date=datetime(1990, 1, 1).date(),
        time=datetime(1990, 1, 1, 12, 0).time(),
        latitude=40.7128,
        longitude=-74.0060
    )

@pytest.fixture
def sample_events():
    """Create sample events for testing."""
    return [
        {
            'id': 'event1',
            'type': 'career',
            'time': datetime(2020, 6, 15, 14, 30),
            'description': 'Job promotion',
            'intensity': 0.8
        },
        {
            'id': 'event2',
            'type': 'relationship',
            'time': datetime(2019, 8, 20, 10, 0),
            'description': 'Marriage',
            'intensity': 0.9
        },
        {
            'id': 'event3',
            'type': 'health',
            'time': datetime(2021, 3, 10, 9, 0),
            'description': 'Surgery',
            'intensity': 0.7
        }
    ]

def test_event_pattern_recognition(event_analyzer, sample_events):
    """Test sophisticated event pattern recognition."""
    patterns = event_analyzer._analyze_event_patterns(sample_events)
    
    assert 'timing_patterns' in patterns
    assert 'type_patterns' in patterns
    assert 'intensity_patterns' in patterns
    assert 'cyclical_patterns' in patterns
    
    # Verify pattern details
    assert len(patterns['timing_patterns']) > 0
    assert len(patterns['type_patterns']) > 0
    assert len(patterns['intensity_patterns']) > 0

def test_dasha_correlation(event_analyzer, sample_birth_data, sample_events):
    """Test dasha-based event correlation."""
    correlations = event_analyzer._analyze_dasha_periods(sample_birth_data, sample_events)
    
    for event_id, correlation in correlations.items():
        assert 'maha_dasha' in correlation
        assert 'antar_dasha' in correlation
        assert 'pratyantar_dasha' in correlation
        assert 'correlation_score' in correlation
        assert 0 <= correlation['correlation_score'] <= 1

def test_divisional_chart_analysis(event_analyzer, sample_birth_data, sample_events):
    """Test divisional chart analysis for events."""
    base_positions = event_analyzer.planetary_calculator.calculate_positions(sample_birth_data)
    correlations = event_analyzer._analyze_divisional_charts(
        sample_birth_data,
        sample_events,
        base_positions
    )
    
    for event_id, chart_correlations in correlations.items():
        event = next(e for e in sample_events if e['id'] == event_id)
        relevant_charts = event_analyzer.divisional_mappings.get(event['type'], [])
        
        # Verify all relevant charts are analyzed
        assert all(chart in chart_correlations for chart in relevant_charts)
        
        # Verify correlation scores
        for score in chart_correlations.values():
            assert 0 <= score <= 1

def test_multiple_time_period_analysis(event_analyzer, sample_birth_data, sample_events):
    """Test multiple time-period analysis."""
    analysis = event_analyzer._analyze_time_periods(sample_birth_data, sample_events)
    
    for period, period_data in analysis.items():
        assert 'event_count' in period_data
        assert 'event_types' in period_data
        assert 'intensity' in period_data
        assert 'planetary_influences' in period_data
        
        assert period_data['event_count'] > 0
        assert len(period_data['event_types']) > 0
        assert 0 <= period_data['intensity'] <= 1

def test_event_correlation(event_analyzer, sample_events):
    """Test correlation between multiple events."""
    correlations = event_analyzer._correlate_events(sample_events)
    
    assert len(correlations) > 0
    for correlation in correlations:
        assert 'event1' in correlation
        assert 'event2' in correlation
        assert 'strength' in correlation
        assert 'type' in correlation
        assert 0 <= correlation['strength'] <= 1

def test_ml_pattern_detection(event_analyzer, sample_events):
    """Test ML-based pattern detection."""
    base_positions = {'Sun': 0.0, 'Moon': 90.0}  # Simplified positions
    patterns = event_analyzer._detect_ml_patterns(sample_events, base_positions)
    
    assert 'clusters' in patterns
    assert 'sequences' in patterns
    assert 'anomalies' in patterns
    assert 'trends' in patterns
    
    # Verify pattern details
    assert len(patterns['clusters']) > 0
    assert len(patterns['sequences']) > 0
    assert isinstance(patterns['anomalies'], list)
    assert isinstance(patterns['trends'], dict)

def test_confidence_scoring(event_analyzer, sample_birth_data, sample_events):
    """Test confidence scoring for event correlations."""
    # Get all analysis components
    patterns = event_analyzer._analyze_event_patterns(sample_events)
    dasha_correlations = event_analyzer._analyze_dasha_periods(sample_birth_data, sample_events)
    base_positions = event_analyzer.planetary_calculator.calculate_positions(sample_birth_data)
    divisional_correlations = event_analyzer._analyze_divisional_charts(
        sample_birth_data,
        sample_events,
        base_positions
    )
    period_analysis = event_analyzer._analyze_time_periods(sample_birth_data, sample_events)
    event_correlations = event_analyzer._correlate_events(sample_events)
    ml_patterns = event_analyzer._detect_ml_patterns(sample_events, base_positions)
    
    # Calculate confidence scores
    scores = event_analyzer._calculate_confidence_scores(
        patterns,
        dasha_correlations,
        divisional_correlations,
        period_analysis,
        event_correlations,
        ml_patterns
    )
    
    # Verify scores
    assert 'overall' in scores
    assert 'pattern_confidence' in scores
    assert 'dasha_confidence' in scores
    assert 'divisional_confidence' in scores
    assert 'period_confidence' in scores
    assert 'correlation_confidence' in scores
    assert 'ml_confidence' in scores
    
    # Verify score ranges
    for score in scores.values():
        assert 0 <= score <= 1

def test_comprehensive_analysis(event_analyzer, sample_birth_data, sample_events):
    """Test complete event analysis workflow."""
    analysis = event_analyzer.analyze_events(sample_birth_data, sample_events)
    
    # Verify all components are present
    assert 'patterns' in analysis
    assert 'dasha_correlations' in analysis
    assert 'divisional_correlations' in analysis
    assert 'period_analysis' in analysis
    assert 'event_correlations' in analysis
    assert 'ml_patterns' in analysis
    assert 'confidence_scores' in analysis
    
    # Verify component details
    assert len(analysis['patterns']) > 0
    assert len(analysis['dasha_correlations']) == len(sample_events)
    assert len(analysis['divisional_correlations']) == len(sample_events)
    assert len(analysis['period_analysis']) > 0
    assert isinstance(analysis['event_correlations'], list)
    assert len(analysis['ml_patterns']) > 0
    assert 'overall' in analysis['confidence_scores']

def test_error_handling(event_analyzer, sample_birth_data):
    """Test error handling with invalid input."""
    # Test with invalid events
    invalid_events = [{'id': 'invalid'}]
    analysis = event_analyzer.analyze_events(sample_birth_data, invalid_events)
    
    # Verify fallback analysis is returned
    assert 'patterns' in analysis
    assert 'confidence_scores' in analysis
    assert analysis['confidence_scores']['overall'] == 0.5
    
    # Test with invalid birth data
    invalid_birth_data = None
    analysis = event_analyzer.analyze_events(invalid_birth_data, [])
    
    # Verify fallback analysis is returned
    assert 'patterns' in analysis
    assert 'confidence_scores' in analysis
    assert analysis['confidence_scores']['overall'] == 0.5 