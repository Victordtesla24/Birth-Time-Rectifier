import pytest
from datetime import datetime, timedelta
import numpy as np
from ..event_analyzer import EventAnalyzer
from ..models.birth_data import BirthData

@pytest.fixture
def event_analyzer():
    """Create an event analyzer instance."""
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
    base_time = datetime(2020, 1, 1, 12, 0)
    return [
        {
            "id": "event1",
            "type": "career",
            "time": base_time,
            "significance": 0.8,
            "description": "Job change"
        },
        {
            "id": "event2",
            "type": "career",
            "time": base_time + timedelta(days=30),
            "significance": 0.7,
            "description": "Promotion"
        },
        {
            "id": "event3",
            "type": "relationship",
            "time": base_time + timedelta(days=60),
            "significance": 0.9,
            "description": "Marriage"
        }
    ]

@pytest.fixture
def sample_time_periods():
    """Create sample time periods for testing."""
    base_time = datetime(2020, 1, 1)
    return [
        {
            "name": "Period_1",
            "start": base_time,
            "end": base_time + timedelta(days=180)
        },
        {
            "name": "Period_2",
            "start": base_time + timedelta(days=181),
            "end": base_time + timedelta(days=365)
        }
    ]

def test_initialization(event_analyzer):
    """Test event analyzer initialization."""
    assert event_analyzer.scaler is not None
    assert event_analyzer.clustering is not None
    assert event_analyzer.confidence_history == []
    assert event_analyzer.pattern_cache == {}

def test_analyze_events(event_analyzer, sample_birth_data, sample_events, sample_time_periods):
    """Test complete event analysis."""
    results = event_analyzer.analyze_events(
        sample_birth_data,
        sample_events,
        sample_time_periods
    )
    
    assert "period_analysis" in results
    assert "patterns" in results
    assert "correlations" in results
    assert "confidence_scores" in results
    
    # Verify period analysis
    assert isinstance(results["period_analysis"], dict)
    assert all(period in results["period_analysis"] 
              for period in ["Period_1", "Period_2"])
    
    # Verify patterns
    assert isinstance(results["patterns"], list)
    
    # Verify correlations
    assert "event_correlations" in results["correlations"]
    assert "pattern_correlations" in results["correlations"]
    assert "time_correlations" in results["correlations"]
    assert "overall_strength" in results["correlations"]
    
    # Verify confidence scores
    assert "period_confidence" in results["confidence_scores"]
    assert "pattern_confidence" in results["confidence_scores"]
    assert "correlation_confidence" in results["confidence_scores"]
    assert "overall" in results["confidence_scores"]

def test_time_period_analysis(event_analyzer, sample_events):
    """Test time period analysis functionality."""
    periods = event_analyzer._generate_default_periods(sample_events)
    analysis = event_analyzer._analyze_time_periods(sample_events, periods)
    
    assert isinstance(analysis, dict)
    assert len(analysis) > 0
    
    for period_analysis in analysis.values():
        assert "events" in period_analysis
        assert "density" in period_analysis
        assert "type_distribution" in period_analysis
        assert "significance" in period_analysis
        assert isinstance(period_analysis["density"], float)
        assert 0 <= period_analysis["significance"] <= 1

def test_pattern_detection(event_analyzer, sample_events):
    """Test pattern detection in events."""
    patterns = event_analyzer._detect_patterns(sample_events)
    
    assert isinstance(patterns, list)
    for pattern in patterns:
        assert "type" in pattern
        assert "start_time" in pattern
        assert "end_time" in pattern
        assert "event_count" in pattern
        assert "dominant_type" in pattern
        assert "type_distribution" in pattern
        assert "significance" in pattern
        assert 0 <= pattern["significance"] <= 1

def test_correlation_calculation(event_analyzer, sample_birth_data, sample_events):
    """Test correlation calculations."""
    correlations = event_analyzer._calculate_correlations(
        sample_birth_data,
        sample_events,
        []  # Empty patterns list
    )
    
    assert "event_correlations" in correlations
    assert "pattern_correlations" in correlations
    assert "time_correlations" in correlations
    assert "overall_strength" in correlations
    
    assert isinstance(correlations["event_correlations"], dict)
    assert isinstance(correlations["pattern_correlations"], dict)
    assert isinstance(correlations["time_correlations"], dict)
    assert isinstance(correlations["overall_strength"], float)
    assert 0 <= correlations["overall_strength"] <= 1

def test_confidence_scoring(event_analyzer):
    """Test confidence score calculations."""
    period_analysis = {
        "period1": {"significance": 0.8},
        "period2": {"significance": 0.6}
    }
    patterns = [
        {"significance": 0.7},
        {"significance": 0.9}
    ]
    correlations = {"overall_strength": 0.75}
    
    scores = event_analyzer._calculate_confidence_scores(
        period_analysis,
        patterns,
        correlations
    )
    
    assert "period_confidence" in scores
    assert "pattern_confidence" in scores
    assert "correlation_confidence" in scores
    assert "overall" in scores
    
    assert 0 <= scores["overall"] <= 1
    assert 0 <= scores["period_confidence"] <= 1
    assert 0 <= scores["pattern_confidence"] <= 1
    assert 0 <= scores["correlation_confidence"] <= 1

def test_event_correlation(event_analyzer, sample_events):
    """Test correlation calculation between events."""
    event1 = sample_events[0]
    event2 = sample_events[1]
    
    correlation = event_analyzer._calculate_event_correlation(event1, event2)
    
    assert isinstance(correlation, float)
    assert 0 <= correlation <= 1

def test_pattern_correlation(event_analyzer):
    """Test correlation calculation between patterns."""
    pattern1 = {
        "start_time": datetime(2020, 1, 1),
        "dominant_type": "career",
        "significance": 0.8
    }
    pattern2 = {
        "start_time": datetime(2020, 2, 1),
        "dominant_type": "career",
        "significance": 0.7
    }
    
    correlation = event_analyzer._calculate_pattern_correlation(pattern1, pattern2)
    
    assert isinstance(correlation, float)
    assert 0 <= correlation <= 1

def test_time_correlation(event_analyzer):
    """Test time correlation calculation."""
    time1 = datetime(2020, 1, 1)
    time2 = datetime(2020, 2, 1)
    
    correlation = event_analyzer._calculate_time_correlation(time1, time2)
    
    assert isinstance(correlation, float)
    assert 0 <= correlation <= 1

def test_error_handling(event_analyzer, sample_birth_data):
    """Test error handling and fallback analysis."""
    # Test with empty events list
    results = event_analyzer.analyze_events(sample_birth_data, [])
    
    assert "period_analysis" in results
    assert "patterns" in results
    assert "correlations" in results
    assert "confidence_scores" in results
    
    # Test with invalid event data
    invalid_events = [{"invalid": "data"}]
    results = event_analyzer.analyze_events(sample_birth_data, invalid_events)
    
    assert "period_analysis" in results
    assert "patterns" in results
    assert "correlations" in results
    assert "confidence_scores" in results
    assert results["confidence_scores"]["overall"] == 0.0

def test_pattern_caching(event_analyzer, sample_birth_data, sample_events):
    """Test pattern caching functionality."""
    # First analysis
    results1 = event_analyzer.analyze_events(sample_birth_data, sample_events)
    cache_size1 = len(event_analyzer.pattern_cache)
    
    # Second analysis with same data
    results2 = event_analyzer.analyze_events(sample_birth_data, sample_events)
    cache_size2 = len(event_analyzer.pattern_cache)
    
    assert cache_size2 > cache_size1
    assert hash(str(results1)) in event_analyzer.pattern_cache
    assert "timestamp" in event_analyzer.pattern_cache[hash(str(results1))]

def test_event_feature_extraction(event_analyzer, sample_events):
    """Test event feature extraction for ML analysis."""
    features = event_analyzer._extract_event_features(sample_events)
    
    assert isinstance(features, np.ndarray)
    assert features.shape[0] == len(sample_events)
    assert features.shape[1] == 7  # Expected number of features

def test_cluster_analysis(event_analyzer, sample_events):
    """Test cluster analysis functionality."""
    cluster_result = event_analyzer._analyze_cluster(sample_events)
    
    assert isinstance(cluster_result, dict)
    assert "type" in cluster_result
    assert "start_time" in cluster_result
    assert "end_time" in cluster_result
    assert "event_count" in cluster_result
    assert "dominant_type" in cluster_result
    assert "type_distribution" in cluster_result
    assert "significance" in cluster_result 