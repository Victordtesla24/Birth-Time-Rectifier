import pytest
from datetime import datetime, time
from typing import Dict, Any
from ..ml_question_generator import MLQuestionGenerator
from ..models.birth_data import BirthData
from unittest.mock import MagicMock, patch

@pytest.fixture
def question_generator():
    """Create question generator instance."""
    return MLQuestionGenerator()

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
def sample_responses():
    return {
        "q1": {
            "event_type": "career",
            "time": "14:30",
            "confidence": 0.8
        },
        "q2": {
            "event_type": "relationship",
            "time": "morning",
            "confidence": 0.6
        }
    }

@pytest.fixture
def sample_confidence_metrics():
    """Create sample confidence metrics."""
    return {
        "career": 0.6,
        "relationship": 0.8,
        "health": 0.5,
        "spirituality": 0.9
    }

@pytest.fixture
def sample_previous_responses():
    """Create sample previous responses."""
    return [
        {
            "type": "career",
            "response": "job_change",
            "confidence": 0.8,
            "timestamp": "2024-01-01T12:00:00"
        },
        {
            "type": "relationship",
            "response": "marriage",
            "confidence": 0.7,
            "timestamp": "2024-01-01T12:05:00"
        }
    ]

def test_initialization(question_generator):
    """Test question generator initialization."""
    assert question_generator.language == "en"
    assert question_generator.response_patterns == []
    assert question_generator.confidence_history == []
    assert question_generator.prashna_rules is not None
    assert all(lang in question_generator.translations for lang in ["mr", "sa", "hi"])

def test_language_setting(question_generator):
    """Test language setting functionality."""
    # Test valid language
    question_generator.set_language("hi")
    assert question_generator.language == "hi"
    
    # Test invalid language
    question_generator.set_language("invalid")
    assert question_generator.language == "en"

def test_ml_driven_question_generation(
    question_generator,
    sample_birth_data,
    sample_previous_responses,
    sample_confidence_metrics
):
    """Test ML-driven dynamic question generation."""
    question = question_generator.generate_question(
        sample_birth_data,
        sample_previous_responses,
        sample_confidence_metrics
    )
    
    assert question is not None
    assert "type" in question
    assert "text" in question
    assert "options" in question
    assert "confidence_weight" in question
    assert "pattern_context" in question
    assert "required" in question
    assert 0 <= question["confidence_weight"] <= 1

def test_response_pattern_analysis(question_generator, sample_previous_responses):
    """Test response pattern analysis."""
    patterns = question_generator._analyze_response_patterns(sample_previous_responses)
    
    assert isinstance(patterns, list)
    assert len(patterns) > 0
    for pattern in patterns:
        assert "type" in pattern
        assert "strength" in pattern

def test_prashna_techniques_integration(question_generator, sample_birth_data):
    """Test Prashna Kundali techniques integration."""
    question = {
        "type": "career",
        "text": "Sample question",
        "options": ["Option 1", "Option 2"],
        "confidence_weight": 0.8
    }
    
    refined_question = question_generator._apply_prashna_techniques(
        question,
        sample_birth_data
    )
    
    assert refined_question is not None
    assert "text" in refined_question
    assert "options" in refined_question
    assert "confidence_weight" in refined_question

@pytest.mark.parametrize("language", ["mr", "sa", "hi"])
def test_multi_language_support(question_generator, language):
    """Test multi-language support for different languages."""
    question_generator.set_language(language)
    
    question = {
        "type": "career",
        "text": "What is your career path?",
        "options": ["Business", "Service", "Self-employed"],
        "confidence_weight": 0.8
    }
    
    translated = question_generator._translate_question(question)
    
    assert translated is not None
    assert translated["text"] != question["text"]
    assert len(translated["options"]) == len(question["options"])
    assert all(opt != orig for opt, orig in zip(translated["options"], question["options"]))

def test_fallback_question_generation(question_generator):
    """Test fallback question generation."""
    fallback = question_generator._generate_fallback_question()
    
    assert fallback is not None
    assert "type" in fallback
    assert "text" in fallback
    assert "options" in fallback
    assert "confidence_weight" in fallback
    assert "pattern_context" in fallback
    assert fallback["type"] == "general"
    assert len(fallback["options"]) > 0

def test_low_confidence_area_identification(question_generator, sample_confidence_metrics):
    """Test identification of low confidence areas."""
    low_confidence_areas = question_generator._identify_low_confidence_areas(
        sample_confidence_metrics
    )
    
    assert isinstance(low_confidence_areas, list)
    assert all(sample_confidence_metrics[area] < 0.7 for area in low_confidence_areas)

def test_question_type_selection(question_generator):
    """Test question type selection logic."""
    patterns = [
        {"type": "career", "strength": 0.8},
        {"type": "health", "strength": 0.6}
    ]
    low_confidence_areas = ["relationship"]
    
    # Test with low confidence areas
    question_type = question_generator._select_question_type(patterns, low_confidence_areas)
    assert question_type == "relationship"
    
    # Test with patterns only
    question_type = question_generator._select_question_type(patterns, [])
    assert question_type == "career"
    
    # Test with no patterns or low confidence areas
    question_type = question_generator._select_question_type([], [])
    assert question_type == "general"

def test_error_handling(question_generator, sample_birth_data):
    """Test error handling in question generation."""
    # Test with invalid previous responses
    question = question_generator.generate_question(
        sample_birth_data,
        [{"invalid": "data"}],
        {}
    )
    assert question is not None
    assert question["type"] == "general"
    
    # Test with missing confidence metrics
    question = question_generator.generate_question(
        sample_birth_data,
        None,
        None
    )
    assert question is not None
    assert "type" in question
    assert "text" in question
    assert "options" in question

def test_translation_error_handling(question_generator):
    """Test error handling in translation."""
    question_generator.set_language("hi")
    question_generator.translator = MagicMock(side_effect=Exception("Translation error"))
    
    question = {
        "type": "career",
        "text": "Test question",
        "options": ["Option 1", "Option 2"]
    }
    
    # Should return original question on translation error
    result = question_generator._translate_question(question)
    assert result == question

def test_generate_question(question_generator, sample_birth_data, 
                         sample_responses, sample_confidence_metrics):
    """Test question generation with pattern recognition."""
    question = question_generator.generate_question(
        sample_birth_data,
        sample_responses,
        sample_confidence_metrics
    )
    
    assert question is not None
    assert "id" in question
    assert "type" in question
    assert "question" in question
    assert "options" in question
    assert "confidence_weight" in question
    assert "translations" in question

def test_analyze_response_patterns(question_generator, sample_responses):
    """Test response pattern analysis."""
    patterns = question_generator._analyze_response_patterns(sample_responses)
    
    assert "response_consistency" in patterns
    assert "time_precision" in patterns
    assert "event_clusters" in patterns
    assert "confidence_trends" in patterns
    
    assert isinstance(patterns["response_consistency"], float)
    assert isinstance(patterns["time_precision"], dict)
    assert isinstance(patterns["event_clusters"], list)

def test_calculate_priority_areas(question_generator, sample_confidence_metrics):
    """Test priority area calculation based on confidence metrics."""
    priority_areas = question_generator._calculate_priority_areas(sample_confidence_metrics)
    
    assert isinstance(priority_areas, list)
    assert len(priority_areas) > 0
    assert all("area" in area and "priority" in area for area in priority_areas)

def test_language_support(question_generator, sample_birth_data,
                         sample_responses, sample_confidence_metrics):
    """Test multi-language support for questions."""
    question = question_generator.generate_question(
        sample_birth_data,
        sample_responses,
        sample_confidence_metrics
    )
    
    assert "translations" in question
    assert "marathi" in question["translations"]
    assert "sanskrit" in question["translations"]
    assert "hindi" in question["translations"]
    
    for lang in ["marathi", "sanskrit", "hindi"]:
        assert "question" in question["translations"][lang]
        assert "options" in question["translations"][lang]

def test_time_precision_calculation(question_generator):
    """Test time precision calculation for different formats."""
    assert question_generator._calculate_time_precision("14:30:45") == 1.0
    assert question_generator._calculate_time_precision("14:30") == 0.8
    assert question_generator._calculate_time_precision("around 2 hours later") == 0.6
    assert question_generator._calculate_time_precision("in the morning") == 0.4
    assert question_generator._calculate_time_precision("not sure") == 0.2

def test_event_clustering(question_generator):
    """Test event clustering functionality."""
    events = [
        {"type": "career", "time": datetime.now(), "confidence": 0.8},
        {"type": "career", "time": datetime.now(), "confidence": 0.7},
        {"type": "relationship", "time": datetime.now(), "confidence": 0.9}
    ]
    
    clusters = question_generator._cluster_events(events)
    
    assert len(clusters) == 2  # Should have two clusters (career and relationship)
    assert any(cluster["type"] == "career" for cluster in clusters)
    assert any(cluster["type"] == "relationship" for cluster in clusters)

def test_confidence_trends_analysis(question_generator, sample_responses):
    """Test confidence trends analysis."""
    trends = question_generator._analyze_confidence_trends(sample_responses)
    
    assert "overall" in trends
    assert "by_category" in trends
    assert isinstance(trends["overall"], list)
    assert isinstance(trends["by_category"], dict)

def test_generate_event_question(question_generator, sample_birth_data):
    """Test event question generation with Prashna Kundali techniques."""
    patterns = {
        "event_clusters": [],
        "response_consistency": 0.8,
        "time_precision": {"q1": 0.9},
        "confidence_trends": {"overall": [0.7, 0.8]}
    }
    
    question = question_generator._generate_event_question(patterns, sample_birth_data)
    
    assert question["type"] == "event"
    assert "Prashna Kundali" in question["question"]
    assert "confidence_weight" in question

def test_generate_personal_question(question_generator):
    """Test personal trait question generation."""
    patterns = {
        "response_consistency": 0.8,
        "time_precision": {"q1": 0.9},
        "event_clusters": [],
        "confidence_trends": {"overall": [0.7, 0.8]}
    }
    
    question = question_generator._generate_personal_question(patterns)
    
    assert question["type"] == "personal"
    assert "trait" in question["question"].lower()
    assert "confidence_weight" in question

def test_generate_timing_question(question_generator, sample_birth_data):
    """Test timing question generation."""
    patterns = {
        "time_precision": {"q1": 0.9},
        "response_consistency": 0.8,
        "event_clusters": [],
        "confidence_trends": {"overall": [0.7, 0.8]}
    }
    
    question = question_generator._generate_timing_question(patterns, sample_birth_data)
    
    assert question["type"] == "timing"
    assert "time" in question["question"].lower()
    assert "confidence_weight" in question

def test_real_time_adaptation(question_generator, sample_birth_data):
    """Test real-time question adaptation based on responses."""
    # First question
    q1 = question_generator.generate_question(
        sample_birth_data,
        {},
        {"career": 0.5}
    )
    
    # Second question with previous response
    q2 = question_generator.generate_question(
        sample_birth_data,
        {"q1": {"type": "career", "response": "positive", "confidence": 0.8}},
        {"career": 0.7}
    )
    
    assert q1["type"] != q2["type"]
    assert q2["confidence_weight"] > q1["confidence_weight"]

def test_pattern_recognition(question_generator):
    """Test pattern recognition in responses."""
    responses = {
        "q1": {"type": "career", "time": "morning", "confidence": 0.8},
        "q2": {"type": "career", "time": "morning", "confidence": 0.7},
        "q3": {"type": "health", "time": "evening", "confidence": 0.9}
    }
    
    patterns = question_generator._analyze_response_patterns(responses)
    
    assert "response_consistency" in patterns
    assert "time_precision" in patterns
    assert "event_clusters" in patterns
    assert len(patterns["event_clusters"]) > 0

def test_confidence_based_prioritization(question_generator, sample_birth_data):
    """Test confidence-based question prioritization."""
    confidence_metrics = {
        "career": 0.4,  # High priority
        "relationship": 0.75,  # Medium priority
        "health": 0.9,  # Low priority
        "spirituality": 0.95  # No priority
    }
    
    priorities = question_generator._calculate_priority_areas(confidence_metrics)
    
    assert len(priorities) == 3  # Only areas below 0.95
    assert priorities[0]["area"] == "career"  # Highest priority
    assert priorities[0]["priority"] == "high"

def test_prashna_kundali_integration(question_generator, sample_birth_data):
    """Test Prashna Kundali techniques integration."""
    question = question_generator.generate_question(
        sample_birth_data,
        {"q1": {"type": "career", "response": "positive"}},
        {"career": 0.6}
    )
    
    # Apply Prashna techniques
    enhanced = question_generator._apply_prashna_techniques(question, sample_birth_data)
    
    assert "prashna_insights" in enhanced
    assert "significant_houses" in enhanced["prashna_insights"]
    assert "significant_planets" in enhanced["prashna_insights"]
    assert "recommended_timing" in enhanced["prashna_insights"]

def test_personalized_question_flow(question_generator, sample_birth_data):
    """Test personalized question flow based on user profile."""
    user_profile = {
        "interests": ["career", "spirituality"],
        "expertise_level": "advanced"
    }
    
    question = question_generator.generate_question(
        sample_birth_data,
        {},
        {"career": 0.6, "spirituality": 0.7},
        user_profile
    )
    
    assert question["type"] in user_profile["interests"]
    assert "advanced" in question.get("complexity", "")

def test_multi_language_support(question_generator, sample_birth_data):
    """Test multi-language support."""
    # Test Marathi
    marathi_q = question_generator.generate_question(
        sample_birth_data,
        {},
        {"career": 0.6},
        language="marathi"
    )
    assert "translations" in marathi_q
    assert marathi_q["translations"]["text"] != ""
    
    # Test Sanskrit
    sanskrit_q = question_generator.generate_question(
        sample_birth_data,
        {},
        {"career": 0.6},
        language="sanskrit"
    )
    assert "translations" in sanskrit_q
    assert sanskrit_q["translations"]["text"] != ""
    
    # Test Hindi
    hindi_q = question_generator.generate_question(
        sample_birth_data,
        {},
        {"career": 0.6},
        language="hindi"
    )
    assert "translations" in hindi_q
    assert hindi_q["translations"]["text"] != ""

def test_error_handling(question_generator, sample_birth_data):
    """Test error handling and fallback questions."""
    # Test with invalid confidence metrics
    question = question_generator.generate_question(
        sample_birth_data,
        {},
        {"invalid": -1}
    )
    assert question["type"] == "basic"
    assert "options" in question
    
    # Test with invalid birth data
    question = question_generator.generate_question(
        None,
        {},
        {"career": 0.6}
    )
    assert question["type"] == "basic"
    assert "options" in question 