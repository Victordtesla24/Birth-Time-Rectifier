"""Tests for the enhanced pattern recognition module."""

import pytest
from datetime import datetime, timedelta
import numpy as np
from ..pattern_recognizer import PatternRecognizer

@pytest.fixture
def pattern_recognizer():
    """Create pattern recognizer instance for testing."""
    return PatternRecognizer()

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
    base_time = datetime(2020, 1, 1, 12, 0)
    return [
        {
            "id": "event1",
            "type": "career",
            "time": base_time,
            "description": "Job promotion",
            "intensity": 0.8
        },
        {
            "id": "event2",
            "type": "career",
            "time": base_time + timedelta(days=30),
            "description": "New project",
            "intensity": 0.7
        },
        {
            "id": "event3",
            "type": "relationship",
            "time": base_time + timedelta(days=60),
            "description": "Marriage",
            "intensity": 0.9
        }
    ]

@pytest.fixture
def sample_planetary_positions():
    """Create sample planetary positions for testing."""
    return {
        "Sun": 0.0,
        "Moon": 120.0,
        "Mars": 90.0,
        "Jupiter": 180.0,
        "Venus": 60.0,
        "Saturn": 240.0
    }

def test_initialization(pattern_recognizer):
    """Test pattern recognizer initialization."""
    assert pattern_recognizer.scaler is not None
    assert pattern_recognizer.pca is not None
    assert pattern_recognizer.pattern_cache == {}
    assert all(0 <= v <= 1 for v in pattern_recognizer.confidence_thresholds.values())

def test_analyze_patterns(pattern_recognizer, sample_birth_data,
                        sample_events, sample_planetary_positions):
    """Test comprehensive pattern analysis."""
    result = pattern_recognizer.analyze_patterns(
        sample_birth_data,
        sample_events,
        sample_planetary_positions
    )
    
    assert "temporal_patterns" in result
    assert "event_patterns" in result
    assert "planetary_patterns" in result
    assert "correlation_patterns" in result
    assert "clusters" in result
    assert "anomalies" in result
    assert "confidence_scores" in result
    
    assert isinstance(result["confidence_scores"], dict)
    assert all(0 <= v <= 1 for v in result["confidence_scores"].values())

def test_feature_extraction(pattern_recognizer, sample_birth_data,
                          sample_events, sample_planetary_positions):
    """Test feature extraction for pattern analysis."""
    features = pattern_recognizer._extract_features(
        sample_birth_data,
        sample_events,
        sample_planetary_positions
    )
    
    assert isinstance(features, np.ndarray)
    assert features.shape[0] == len(sample_events)
    assert features.shape[1] > 0

def test_temporal_pattern_analysis(pattern_recognizer, sample_events):
    """Test temporal pattern analysis."""
    patterns = pattern_recognizer._analyze_temporal_patterns(sample_events)
    
    assert isinstance(patterns, list)
    for pattern in patterns:
        assert "type" in pattern
        if pattern["type"] == "regular_interval":
            assert "mean_interval" in pattern
            assert "std_interval" in pattern
            assert "occurrences" in pattern
        elif pattern["type"] == "seasonal_concentration":
            assert "month" in pattern
            assert "count" in pattern
            assert "events" in pattern

def test_event_pattern_analysis(pattern_recognizer, sample_events):
    """Test event pattern analysis."""
    patterns = pattern_recognizer._analyze_event_patterns(sample_events)
    
    assert isinstance(patterns, list)
    for pattern in patterns:
        assert "type" in pattern
        assert "event_type" in pattern
        assert "count" in pattern
        assert "average_intensity" in pattern
        assert "events" in pattern
        assert 0 <= pattern["average_intensity"] <= 1

def test_planetary_pattern_analysis(pattern_recognizer, sample_events,
                                  sample_planetary_positions):
    """Test planetary pattern analysis."""
    patterns = pattern_recognizer._analyze_planetary_patterns(
        sample_planetary_positions,
        sample_events
    )
    
    assert isinstance(patterns, list)
    for pattern in patterns:
        assert "type" in pattern
        if pattern["type"] == "planetary_aspect":
            assert "planet1" in pattern
            assert "planet2" in pattern
            assert "aspect_type" in pattern
            assert "event_count" in pattern
            assert "events" in pattern

def test_correlation_pattern_analysis(pattern_recognizer, sample_events,
                                    sample_planetary_positions):
    """Test correlation pattern analysis."""
    patterns = pattern_recognizer._analyze_correlation_patterns(
        sample_events,
        sample_planetary_positions
    )
    
    assert isinstance(patterns, list)
    for pattern in patterns:
        assert "type" in pattern
        if pattern["type"] == "event_correlation":
            assert "correlation_type" in pattern
            assert "count" in pattern
            assert "average_strength" in pattern
            assert "correlations" in pattern
            assert 0 <= pattern["average_strength"] <= 1

def test_cluster_detection(pattern_recognizer, sample_birth_data,
                         sample_events, sample_planetary_positions):
    """Test cluster detection in event features."""
    features = pattern_recognizer._extract_features(
        sample_birth_data,
        sample_events,
        sample_planetary_positions
    )
    clusters = pattern_recognizer._detect_clusters(features)
    
    assert isinstance(clusters, list)
    for cluster in clusters:
        assert "cluster_id" in cluster
        assert "size" in cluster
        assert "indices" in cluster
        assert "centroid" in cluster
        assert len(cluster["indices"]) > 0
        assert len(cluster["centroid"]) == features.shape[1]

def test_anomaly_detection(pattern_recognizer, sample_birth_data,
                         sample_events, sample_planetary_positions):
    """Test anomaly detection in event features."""
    features = pattern_recognizer._extract_features(
        sample_birth_data,
        sample_events,
        sample_planetary_positions
    )
    anomalies = pattern_recognizer._detect_anomalies(features)
    
    assert isinstance(anomalies, list)
    for anomaly in anomalies:
        assert "index" in anomaly
        assert "z_scores" in anomaly
        assert "features" in anomaly
        assert len(anomaly["z_scores"]) == features.shape[1]
        assert len(anomaly["features"]) == features.shape[1]

def test_confidence_score_calculation(pattern_recognizer):
    """Test confidence score calculation."""
    scores = pattern_recognizer._calculate_confidence_scores(
        temporal_patterns=[{"type": "regular_interval"}],
        event_patterns=[{"type": "significant_event_type"}],
        planetary_patterns=[{"type": "planetary_aspect"}],
        correlation_patterns=[{"type": "event_correlation"}],
        clusters=[{"cluster_id": 0}],
        anomalies=[]
    )
    
    assert isinstance(scores, dict)
    assert "temporal" in scores
    assert "event" in scores
    assert "planetary" in scores
    assert "correlation" in scores
    assert "clustering" in scores
    assert "overall" in scores
    
    assert all(0 <= v <= 1 for v in scores.values())
    assert scores["overall"] == np.mean(list(scores.values()))

def test_seasonal_pattern_detection(pattern_recognizer, sample_events):
    """Test seasonal pattern detection."""
    patterns = pattern_recognizer._detect_seasonal_patterns(sample_events)
    
    assert isinstance(patterns, list)
    for pattern in patterns:
        assert "type" in pattern
        assert pattern["type"] == "seasonal_concentration"
        assert "month" in pattern
        assert 1 <= pattern["month"] <= 12
        assert "count" in pattern
        assert "events" in pattern
        assert len(pattern["events"]) > 0

def test_aspect_calculation(pattern_recognizer, sample_planetary_positions):
    """Test planetary aspect calculation."""
    aspects = pattern_recognizer._calculate_aspects(sample_planetary_positions)
    
    assert isinstance(aspects, list)
    for aspect in aspects:
        assert "planet1" in aspect
        assert "planet2" in aspect
        assert "type" in aspect
        assert "orb" in aspect
        assert aspect["planet1"] in sample_planetary_positions
        assert aspect["planet2"] in sample_planetary_positions
        assert aspect["type"] in ["conjunction", "opposition", "trine", "square", "sextile"]
        assert 0 <= aspect["orb"] <= 10

def test_event_correlation_calculation(pattern_recognizer, sample_events,
                                     sample_planetary_positions):
    """Test event correlation calculation."""
    correlation = pattern_recognizer._calculate_event_correlation(
        sample_events[0],
        sample_events[1],
        sample_planetary_positions
    )
    
    assert isinstance(correlation, dict)
    assert "event1_id" in correlation
    assert "event2_id" in correlation
    assert "type" in correlation
    assert "strength" in correlation
    assert "time_difference_days" in correlation
    assert 0 <= correlation["strength"] <= 1
    assert correlation["time_difference_days"] >= 0

def test_error_handling(pattern_recognizer):
    """Test error handling and fallback analysis."""
    result = pattern_recognizer.analyze_patterns(
        None,  # Invalid birth data
        [],    # Empty events
        {}     # Empty positions
    )
    
    assert isinstance(result, dict)
    assert all(len(result[key]) == 0 for key in [
        "temporal_patterns",
        "event_patterns",
        "planetary_patterns",
        "correlation_patterns",
        "clusters",
        "anomalies"
    ])
    assert all(v == 0.0 for v in result["confidence_scores"].values()) 