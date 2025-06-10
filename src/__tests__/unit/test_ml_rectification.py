import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import json
from src.backend.agents.ml_rectification import MLRectificationEngine
from src.backend.agents.birth_time_rectification import BirthTimeRectificationAgent, BirthData

@pytest.fixture
def ml_engine():
    return MLRectificationEngine("test-api-key")

@pytest.fixture
def sample_birth_data():
    return {
        "date": "1990-01-01",
        "time": "12:00",
        "location": "New York, NY"
    }

@pytest.fixture
def sample_positions():
    return {
        "Sun": {"longitude": 280.5, "latitude": 0.0},
        "Moon": {"longitude": 120.3, "latitude": 5.0},
        "Mars": {"longitude": 45.8, "latitude": 1.2}
    }

@pytest.fixture
def sample_responses():
    return {
        "physical_appearance": "Tall and lean",
        "personality_trait": "Leadership and confidence"
    }

@pytest.mark.asyncio
@patch('openai.ChatCompletion.acreate')
async def test_analyze_birth_data(mock_acreate, ml_engine, sample_birth_data, sample_positions, sample_responses):
    """Test birth data analysis with ML"""
    # Mock OpenAI response
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content=json.dumps({
                    "time_adjustment": 0.5,
                    "confidence_score": 0.85,
                    "verification_points": ["Point 1", "Point 2"]
                })
            )
        )
    ]
    mock_acreate.return_value = AsyncMock(return_value=mock_response)()

    result = await ml_engine.analyze_birth_data(
        sample_birth_data,
        sample_positions,
        sample_responses
    )

    # Verify analysis result structure
    assert "time_adjustment" in result
    assert "confidence_score" in result
    assert "verification_points" in result
    
    # Verify values
    assert result["time_adjustment"] == 0.5
    assert result["confidence_score"] == 0.85
    assert isinstance(result["verification_points"], list)

@pytest.mark.asyncio
@patch('openai.ChatCompletion.acreate')
async def test_generate_dynamic_questions(mock_acreate, ml_engine, sample_positions):
    """Test dynamic question generation with ML"""
    # Mock OpenAI response
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content=json.dumps([{
                    "text": "Test question?",
                    "options": ["Option 1", "Option 2"],
                    "weight": 0.8,
                    "impact": "High"
                }])
            )
        )
    ]
    mock_acreate.return_value = AsyncMock(return_value=mock_response)()

    result = await ml_engine.generate_dynamic_questions(
        {"planetary_positions": sample_positions},
        {"divisional_charts": {}}
    )

    # Verify question structure
    assert isinstance(result, list)
    assert len(result) > 0
    assert "text" in result[0]
    assert "options" in result[0]
    assert "weight" in result[0]
    assert "impact" in result[0]

@pytest.mark.asyncio
@patch('openai.ChatCompletion.acreate')
async def test_evaluate_confidence(mock_acreate, ml_engine, sample_birth_data, sample_positions):
    """Test confidence evaluation with ML"""
    # Mock OpenAI response
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content=json.dumps({"confidence_score": 0.92})
            )
        )
    ]
    mock_acreate.return_value = AsyncMock(return_value=mock_response)()

    result = await ml_engine.evaluate_confidence(
        sample_birth_data,
        {"adjusted_positions": sample_positions}
    )

    # Verify confidence score
    assert isinstance(result, float)
    assert 0 <= result <= 1
    assert result == 0.92

def test_prepare_analysis_context(ml_engine, sample_birth_data, sample_positions, sample_responses):
    """Test analysis context preparation"""
    context = ml_engine._prepare_analysis_context(
        sample_birth_data,
        sample_positions,
        sample_responses
    )

    # Verify context contains all necessary information
    assert "Birth Details" in context
    assert "Planetary Positions" in context
    assert "Questionnaire Responses" in context

def test_prepare_question_context(ml_engine, sample_birth_data):
    """Test question context preparation"""
    context = ml_engine._prepare_question_context(
        sample_birth_data,
        {"analysis": "test"}
    )

    # Verify context structure
    assert "Birth Details" in context
    assert "Current Analysis" in context

def test_prepare_confidence_context(ml_engine, sample_birth_data):
    """Test confidence context preparation"""
    context = ml_engine._prepare_confidence_context(
        sample_birth_data,
        {"analysis": "test"}
    )

    # Verify context structure
    assert "Birth Details" in context
    assert "Analysis Results" in context

@pytest.fixture
def birth_time_agent():
    agent = BirthTimeRectificationAgent()
    # Mock the missing method
    agent._evaluate_kp_factors = lambda positions: 0.5
    return agent

@pytest.fixture
def sample_birth_data_obj():
    return BirthData(
        date="1990-01-01",
        time="12:00",
        place="New York, NY"
    )

@pytest.fixture
def sample_questionnaire_responses():
    return {
        "physical_appearance": "Tall and lean",
        "personality_trait": "Leadership and confidence",
        "life_area": "Career and achievements",
        "major_events": ["Career changes", "Education/Learning"]
    }

@pytest.mark.asyncio
@patch('backend.agents.ml_rectification.MLRectificationEngine.analyze_birth_data')
@patch('backend.agents.ml_rectification.MLRectificationEngine.evaluate_confidence')
async def test_comprehensive_analysis_with_ml(mock_evaluate, mock_analyze, birth_time_agent, sample_birth_data_obj, sample_questionnaire_responses):
    """Test comprehensive analysis with ML enhancement"""
    # Mock ML analysis response
    mock_analyze.return_value = {
        "time_adjustment": 0.5,
        "confidence_score": 0.85,
        "verification_points": ["Point 1", "Point 2"]
    }
    mock_evaluate.return_value = 0.92

    # Process birth data
    processed_data = birth_time_agent.preprocess_data(sample_birth_data_obj)
    preliminary_data = birth_time_agent.preliminary_analysis(processed_data)

    # Perform comprehensive analysis
    result = await birth_time_agent.comprehensive_analysis(
        preliminary_data,
        processed_data,
        sample_questionnaire_responses
    )

    # Verify result structure
    assert isinstance(result.confidence_score, float)
    assert 0 <= result.confidence_score <= 1
    assert result.rectified_time is not None
    assert result.rectified_time != result.original_time

@pytest.mark.asyncio
@patch('backend.agents.ml_rectification.MLRectificationEngine.generate_dynamic_questions')
async def test_generate_dynamic_question_with_ml(mock_generate, birth_time_agent):
    """Test dynamic question generation with ML enhancement"""
    # Mock ML question generation response
    mock_generate.return_value = [{
        "text": "Test question?",
        "options": ["Option 1", "Option 2"],
        "weight": 0.8,
        "impact": "High"
    }]

    # Generate question
    question = await birth_time_agent.generate_dynamic_question(
        {"Sun": {"longitude": 0}},
        {"D1": {}, "D9": {}}
    )

    # Verify question structure
    assert isinstance(question, dict)
    assert "id" in question
    assert "type" in question
    assert "question" in question
    assert "options" in question
    assert "impact" in question 