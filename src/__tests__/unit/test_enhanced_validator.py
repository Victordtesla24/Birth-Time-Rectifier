import pytest
from datetime import datetime
from typing import Dict, Any
from ..enhanced_validator import (
    EnhancedValidator,
    RequiredRule,
    TypeRule,
    RangeRule,
    PatternRule,
    CrossFieldRule,
    CustomRule
)

@pytest.fixture
def validator():
    return EnhancedValidator()

@pytest.fixture
def sample_data():
    return {
        "birth_date": "1990-01-01",
        "birth_time": "12:00:00",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "name": "John Doe",
        "age": 30
    }

def test_required_rule():
    """Test required field validation."""
    rule = RequiredRule("name", "Name is required")
    
    # Test valid case
    assert rule.validate({"name": "John"}) is None
    
    # Test missing field
    assert rule.validate({}) == "Name is required"
    
    # Test None value
    assert rule.validate({"name": None}) == "Name is required"

def test_type_rule():
    """Test type validation."""
    rule = TypeRule("age", int, "Age must be an integer")
    
    # Test valid case
    assert rule.validate({"age": 25}) is None
    
    # Test invalid type
    assert rule.validate({"age": "25"}) == "Age must be an integer"
    
    # Test missing field (should pass)
    assert rule.validate({}) is None

def test_range_rule():
    """Test numerical range validation."""
    rule = RangeRule("latitude", -90, 90, "Latitude must be between -90 and 90")
    
    # Test valid case
    assert rule.validate({"latitude": 45.0}) is None
    
    # Test out of range
    assert rule.validate({"latitude": 100}) == "Latitude must be between -90 and 90"
    
    # Test invalid type
    assert "Invalid numerical value" in rule.validate({"latitude": "invalid"})

def test_pattern_rule():
    """Test pattern matching validation."""
    rule = PatternRule(
        "email",
        r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        "Invalid email format"
    )
    
    # Test valid case
    assert rule.validate({"email": "test@example.com"}) is None
    
    # Test invalid format
    assert rule.validate({"email": "invalid-email"}) == "Invalid email format"

def test_cross_field_rule():
    """Test cross-field validation."""
    def validate_time_range(start: str, end: str) -> bool:
        try:
            start_time = datetime.strptime(start, "%H:%M:%S")
            end_time = datetime.strptime(end, "%H:%M:%S")
            return start_time < end_time
        except ValueError:
            return False
    
    rule = CrossFieldRule(
        "start_time",
        "end_time",
        validate_time_range,
        "Start time must be before end time"
    )
    
    # Test valid case
    assert rule.validate({
        "start_time": "10:00:00",
        "end_time": "11:00:00"
    }) is None
    
    # Test invalid case
    assert rule.validate({
        "start_time": "12:00:00",
        "end_time": "11:00:00"
    }) == "Start time must be before end time"

def test_custom_rule():
    """Test custom validation rule."""
    def validate_age(age: int) -> bool:
        return 0 <= age <= 150
    
    rule = CustomRule(
        "age",
        validate_age,
        "Age must be between 0 and 150"
    )
    
    # Test valid case
    assert rule.validate({"age": 25}) is None
    
    # Test invalid case
    assert rule.validate({"age": 200}) == "Age must be between 0 and 150"

def test_enhanced_validator_basic(validator, sample_data):
    """Test basic validation functionality."""
    # Add some rules
    validator.add_rule("birth_date", RequiredRule("birth_date", "Birth date is required"))
    validator.add_rule("latitude", RangeRule("latitude", -90, 90, "Invalid latitude"))
    
    # Test valid data
    errors = validator.validate(sample_data)
    assert not errors
    
    # Test invalid data
    invalid_data = sample_data.copy()
    invalid_data["latitude"] = 100
    errors = validator.validate(invalid_data)
    assert "latitude" in errors
    assert "Invalid latitude" in errors["latitude"]

def test_ml_error_detection(validator, sample_data):
    """Test ML-based error detection."""
    # Add some anomalous data
    anomalous_data = sample_data.copy()
    anomalous_data["latitude"] = 89.99999  # Suspiciously precise
    
    errors = validator.validate(anomalous_data)
    
    # Check performance metrics
    metrics = validator.get_performance_metrics()
    assert "total_validations" in metrics
    assert "total_errors" in metrics
    assert "avg_validation_time" in metrics

def test_cross_field_validation(validator):
    """Test cross-field validation functionality."""
    data = {
        "birth_date": "2025-01-01",  # Future date
        "birth_time": "12:00:00"
    }
    
    errors = validator.validate(data)
    assert "birth_date" in errors
    assert "cannot be in the future" in errors["birth_date"][0]

def test_user_friendly_messages(validator):
    """Test user-friendly error message generation."""
    errors = {
        "birth_date": ["Invalid date format"]
    }
    
    message = validator.get_user_friendly_message("birth_date", errors["birth_date"])
    assert "Please check" in message
    assert "Suggestion" in message

def test_performance_optimization(validator, sample_data):
    """Test validation performance optimization."""
    # Perform multiple validations
    for _ in range(100):
        validator.validate(sample_data)
    
    metrics = validator.get_performance_metrics()
    assert metrics["total_validations"] == 100
    assert metrics["avg_validation_time"] > 0

def test_error_pattern_analysis(validator):
    """Test error pattern analysis and learning."""
    # Generate some errors
    invalid_data = {
        "birth_date": "invalid",
        "latitude": "invalid",
        "longitude": 200
    }
    
    validator.validate(invalid_data)
    
    # Check error patterns
    patterns = validator.error_patterns
    assert len(patterns) > 0
    for field in patterns:
        assert "total_errors" in patterns[field]
        assert "error_types" in patterns[field]

def test_validation_rule_customization(validator):
    """Test validation rule customization."""
    # Add custom rule
    def custom_validation(value: Any) -> bool:
        return isinstance(value, str) and len(value) >= 3
    
    validator.add_rule(
        "name",
        CustomRule("name", custom_validation, "Name must be at least 3 characters")
    )
    
    # Test valid case
    assert not validator.validate({"name": "John"})
    
    # Test invalid case
    errors = validator.validate({"name": "Jo"})
    assert "name" in errors

# Add more test cases as needed 