"""Tests for the real-time feedback learning module."""

import pytest
from datetime import datetime
import json
from pathlib import Path
from ..feedback_learner import FeedbackLearner

@pytest.fixture
def feedback_learner():
    """Create feedback learner instance for testing."""
    return FeedbackLearner(feedback_threshold=3)  # Lower threshold for testing

@pytest.fixture
def sample_feedback():
    """Create sample feedback data for testing."""
    return {
        "analysis_id": "test_analysis",
        "accuracy_rating": 0.8,
        "user_comments": "Good analysis but could be more detailed",
        "improvement_suggestions": [
            {
                "category": "detail",
                "detail": "Add more explanation",
                "impact": 0.7
            }
        ],
        "satisfaction_rating": 0.75,
        "issues": [
            {
                "type": "clarity",
                "description": "Explanation could be clearer",
                "severity": 0.3
            }
        ]
    }

def test_initialization(feedback_learner):
    """Test feedback learner initialization."""
    assert feedback_learner.feedback_threshold == 3
    assert len(feedback_learner.feedback_history) == 0
    assert feedback_learner.learning_metrics["total_feedback"] == 0
    assert feedback_learner.learning_metrics["error_rate"] == 0.0
    assert isinstance(feedback_learner.adaptation_rules, dict)

def test_process_feedback(feedback_learner, sample_feedback):
    """Test feedback processing."""
    result = feedback_learner.process_feedback(sample_feedback)
    
    assert result["status"] == "success"
    assert "metrics" in result
    assert len(feedback_learner.feedback_history) == 1
    assert feedback_learner.learning_metrics["total_feedback"] == 1
    assert feedback_learner.learning_metrics["positive_feedback"] == 1

def test_feedback_validation(feedback_learner):
    """Test feedback data validation."""
    invalid_feedback = {
        "analysis_id": "test"
        # Missing required fields
    }
    
    result = feedback_learner.process_feedback(invalid_feedback)
    assert result["status"] == "error"
    assert "Invalid feedback data" in result["message"]
    assert len(feedback_learner.feedback_history) == 0

def test_learning_metrics_update(feedback_learner, sample_feedback):
    """Test learning metrics updates."""
    # Process multiple feedback items
    feedback_learner.process_feedback(sample_feedback)
    
    low_accuracy_feedback = sample_feedback.copy()
    low_accuracy_feedback["accuracy_rating"] = 0.4
    feedback_learner.process_feedback(low_accuracy_feedback)
    
    metrics = feedback_learner.learning_metrics
    assert metrics["total_feedback"] == 2
    assert metrics["positive_feedback"] == 1
    assert 0 <= metrics["error_rate"] <= 1

def test_system_adaptation(feedback_learner, sample_feedback):
    """Test system adaptation after threshold."""
    # Process feedback up to threshold
    for _ in range(3):
        result = feedback_learner.process_feedback(sample_feedback)
    
    assert result["status"] == "success"
    assert "patterns" in result
    assert "adaptation_scores" in result
    assert "new_rules" in result
    assert len(feedback_learner.feedback_history) == 0  # History cleared after adaptation

def test_feedback_pattern_analysis(feedback_learner, sample_feedback):
    """Test feedback pattern analysis."""
    # Add multiple feedback items
    feedback_learner.process_feedback(sample_feedback)
    
    different_feedback = sample_feedback.copy()
    different_feedback["accuracy_rating"] = 0.9
    feedback_learner.process_feedback(different_feedback)
    
    patterns = feedback_learner._analyze_feedback_patterns()
    
    assert "accuracy_trend" in patterns
    assert "common_issues" in patterns
    assert "improvement_suggestions" in patterns
    assert "user_satisfaction" in patterns
    
    assert isinstance(patterns["accuracy_trend"], dict)
    assert isinstance(patterns["common_issues"], list)
    assert isinstance(patterns["user_satisfaction"], float)

def test_accuracy_trend_calculation(feedback_learner, sample_feedback):
    """Test accuracy trend calculation."""
    # Add feedback with increasing accuracy
    for accuracy in [0.7, 0.8, 0.9]:
        feedback = sample_feedback.copy()
        feedback["accuracy_rating"] = accuracy
        feedback_learner.process_feedback(feedback)
    
    trend = feedback_learner._calculate_accuracy_trend()
    assert "trend" in trend
    assert "confidence" in trend
    assert trend["trend"] > 0  # Positive trend

def test_common_issues_identification(feedback_learner, sample_feedback):
    """Test common issues identification."""
    # Add multiple feedback items with different issues
    feedback_learner.process_feedback(sample_feedback)
    
    different_issue = sample_feedback.copy()
    different_issue["issues"] = [
        {
            "type": "completeness",
            "description": "Missing some details",
            "severity": 0.4
        }
    ]
    feedback_learner.process_feedback(different_issue)
    
    issues = feedback_learner._identify_common_issues()
    assert len(issues) > 0
    assert "type" in issues[0]
    assert "count" in issues[0]
    assert "severity" in issues[0]

def test_suggestion_analysis(feedback_learner, sample_feedback):
    """Test improvement suggestion analysis."""
    # Add multiple feedback items with different suggestions
    feedback_learner.process_feedback(sample_feedback)
    
    different_suggestion = sample_feedback.copy()
    different_suggestion["improvement_suggestions"] = [
        {
            "category": "accuracy",
            "detail": "Improve calculation precision",
            "impact": 0.8
        }
    ]
    feedback_learner.process_feedback(different_suggestion)
    
    suggestions = feedback_learner._analyze_suggestions()
    assert len(suggestions) > 0
    assert "category" in suggestions[0]
    assert "count" in suggestions[0]
    assert "impact" in suggestions[0]

def test_adaptation_rules_generation(feedback_learner, sample_feedback):
    """Test adaptation rules generation."""
    # Process feedback to generate adaptation scores
    for _ in range(3):
        feedback_learner.process_feedback(sample_feedback)
    
    patterns = feedback_learner._analyze_feedback_patterns()
    scores = feedback_learner._calculate_adaptation_scores(patterns)
    new_rules = feedback_learner._generate_adaptation_rules(scores)
    
    assert "accuracy_threshold" in new_rules
    assert "error_threshold" in new_rules
    assert "learning_rate" in new_rules
    assert 0 <= new_rules["accuracy_threshold"] <= 1
    assert 0 <= new_rules["error_threshold"] <= 1
    assert 0 <= new_rules["learning_rate"] <= 1

def test_error_handling(feedback_learner):
    """Test error handling in feedback processing."""
    result = feedback_learner.process_feedback(None)
    assert result["status"] == "error"
    assert "message" in result
    
    result = feedback_learner.process_feedback({"invalid": "data"})
    assert result["status"] == "error"
    assert "message" in result 