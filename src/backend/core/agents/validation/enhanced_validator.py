from typing import Dict, Any, List, Optional, Callable
import re
from datetime import datetime
import logging
from pathlib import Path
import json
import numpy as np
from ..ml.enhanced_ml_engine import EnhancedMLEngine

logger = logging.getLogger(__name__)

class ValidationRule:
    """Base class for validation rules."""
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
    
    def validate(self, data: Dict[str, Any]) -> Optional[str]:
        """Validate data against rule."""
        raise NotImplementedError

class RequiredRule(ValidationRule):
    """Rule for required fields."""
    def validate(self, data: Dict[str, Any]) -> Optional[str]:
        if self.field not in data or data[self.field] is None:
            return self.message
        return None

class TypeRule(ValidationRule):
    """Rule for type checking."""
    def __init__(self, field: str, expected_type: type, message: str):
        super().__init__(field, message)
        self.expected_type = expected_type
    
    def validate(self, data: Dict[str, Any]) -> Optional[str]:
        if self.field in data and not isinstance(data[self.field], self.expected_type):
            return self.message
        return None

class RangeRule(ValidationRule):
    """Rule for numerical range validation."""
    def __init__(self, field: str, min_val: float, max_val: float, message: str):
        super().__init__(field, message)
        self.min_val = min_val
        self.max_val = max_val
    
    def validate(self, data: Dict[str, Any]) -> Optional[str]:
        if self.field in data:
            value = data[self.field]
            if not isinstance(value, (int, float)) or value < self.min_val or value > self.max_val:
                return self.message
        return None

class PatternRule(ValidationRule):
    """Rule for pattern matching."""
    def __init__(self, field: str, pattern: str, message: str):
        super().__init__(field, message)
        self.pattern = re.compile(pattern)
    
    def validate(self, data: Dict[str, Any]) -> Optional[str]:
        if self.field in data and not self.pattern.match(str(data[self.field])):
            return self.message
        return None

class CrossFieldRule(ValidationRule):
    """Rule for cross-field validation."""
    def __init__(self, field: str, related_field: str, 
                 validation_func: Callable[[Any, Any], bool], message: str):
        super().__init__(field, message)
        self.related_field = related_field
        self.validation_func = validation_func
    
    def validate(self, data: Dict[str, Any]) -> Optional[str]:
        if self.field in data and self.related_field in data:
            if not self.validation_func(data[self.field], data[self.related_field]):
                return self.message
        return None

class CustomRule(ValidationRule):
    """Rule for custom validation logic."""
    def __init__(self, field: str, validation_func: Callable[[Any], bool], message: str):
        super().__init__(field, message)
        self.validation_func = validation_func
    
    def validate(self, data: Dict[str, Any]) -> Optional[str]:
        if self.field in data and not self.validation_func(data[self.field]):
            return self.message
        return None

class EnhancedValidator:
    """Enhanced validation framework with ML-based error detection."""
    
    def __init__(self, ml_engine: Optional[EnhancedMLEngine] = None):
        self.rules = {}
        self.cross_field_rules = []
        self.ml_engine = ml_engine
        self.error_patterns = {}
        self.performance_metrics = {
            "validation_time": [],
            "error_detection_time": [],
            "recovery_time": []
        }
        self._load_validation_rules()
    
    def _load_validation_rules(self) -> None:
        """Load validation rules from configuration."""
        rules_path = Path(__file__).parent / "validation_rules.json"
        if rules_path.exists():
            with open(rules_path, "r") as f:
                rules_config = json.load(f)
                self._configure_rules(rules_config)
    
    def _configure_rules(self, config: Dict[str, Any]) -> None:
        """Configure validation rules from configuration."""
        for field, rules in config.items():
            field_rules = []
            
            if rules.get("required", False):
                field_rules.append(RequiredRule(
                    field,
                    rules.get("required_message", f"{field} is required")
                ))
            
            if "type" in rules:
                field_rules.append(TypeRule(
                    field,
                    eval(rules["type"]),
                    rules.get("type_message", f"{field} must be of type {rules['type']}")
                ))
            
            if "range" in rules:
                field_rules.append(RangeRule(
                    field,
                    rules["range"]["min"],
                    rules["range"]["max"],
                    rules.get("range_message", f"{field} must be between {rules['range']['min']} and {rules['range']['max']}")
                ))
            
            if "pattern" in rules:
                field_rules.append(PatternRule(
                    field,
                    rules["pattern"],
                    rules.get("pattern_message", f"{field} must match pattern {rules['pattern']}")
                ))
            
            self.rules[field] = field_rules
    
    def add_rule(self, field: str, rule: ValidationRule) -> None:
        """Add a validation rule."""
        if field not in self.rules:
            self.rules[field] = []
        self.rules[field].append(rule)
    
    def add_cross_field_rule(self, rule: CrossFieldRule) -> None:
        """Add a cross-field validation rule."""
        self.cross_field_rules.append(rule)
    
    def validate(self, data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Validate data against all rules."""
        import time
        start_time = time.time()
        
        errors = {}
        
        # Field-specific validation
        for field, rules in self.rules.items():
            field_errors = []
            for rule in rules:
                error = rule.validate(data)
                if error:
                    field_errors.append(error)
            if field_errors:
                errors[field] = field_errors
        
        # Cross-field validation
        for rule in self.cross_field_rules:
            error = rule.validate(data)
            if error:
                if rule.field not in errors:
                    errors[rule.field] = []
                errors[rule.field].append(error)
        
        # ML-based error detection
        if self.ml_engine:
            ml_errors = self._detect_ml_errors(data)
            for field, error_msgs in ml_errors.items():
                if field not in errors:
                    errors[field] = []
                errors[field].extend(error_msgs)
        
        # Update performance metrics
        validation_time = time.time() - start_time
        self.performance_metrics["validation_time"].append(validation_time)
        
        return errors
    
    def _detect_ml_errors(self, data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Detect errors using ML-based pattern recognition."""
        import time
        start_time = time.time()
        
        errors = {}
        
        try:
            # Analyze data patterns
            patterns = self._analyze_data_patterns(data)
            
            # Check for anomalies
            for field, value in data.items():
                anomalies = self._detect_anomalies(field, value, patterns)
                if anomalies:
                    errors[field] = [
                        self._generate_user_friendly_message(field, anomaly)
                        for anomaly in anomalies
                    ]
            
            # Update error patterns
            self._update_error_patterns(errors)
            
        except Exception as e:
            logger.error(f"Error in ML-based error detection: {str(e)}")
        
        # Update performance metrics
        detection_time = time.time() - start_time
        self.performance_metrics["error_detection_time"].append(detection_time)
        
        return errors
    
    def _analyze_data_patterns(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze patterns in input data."""
        patterns = {}
        
        for field, value in data.items():
            if isinstance(value, (int, float)):
                patterns[field] = {
                    "type": "numeric",
                    "mean": np.mean(self._get_historical_values(field)),
                    "std": np.std(self._get_historical_values(field))
                }
            elif isinstance(value, str):
                patterns[field] = {
                    "type": "text",
                    "length_mean": np.mean([len(v) for v in self._get_historical_values(field)]),
                    "length_std": np.std([len(v) for v in self._get_historical_values(field)])
                }
        
        return patterns
    
    def _get_historical_values(self, field: str) -> List[Any]:
        """Get historical values for a field."""
        # This would typically come from a database
        return [0]  # Placeholder
    
    def _detect_anomalies(self, field: str, value: Any, 
                         patterns: Dict[str, Any]) -> List[str]:
        """Detect anomalies in field value."""
        anomalies = []
        
        if field in patterns:
            pattern = patterns[field]
            
            if pattern["type"] == "numeric":
                if isinstance(value, (int, float)):
                    z_score = abs(value - pattern["mean"]) / max(pattern["std"], 1e-6)
                    if z_score > 3:  # More than 3 standard deviations
                        anomalies.append("statistical_outlier")
            
            elif pattern["type"] == "text":
                if isinstance(value, str):
                    length_z_score = abs(len(value) - pattern["length_mean"]) / max(pattern["length_std"], 1e-6)
                    if length_z_score > 3:
                        anomalies.append("unusual_length")
        
        return anomalies
    
    def _generate_user_friendly_message(self, field: str, anomaly: str) -> str:
        """Generate user-friendly error message."""
        messages = {
            "statistical_outlier": f"The value for {field} seems unusual compared to typical values",
            "unusual_length": f"The length of {field} is unusually long or short",
            "pattern_mismatch": f"The format of {field} doesn't match what we usually see"
        }
        
        return messages.get(anomaly, f"There might be an issue with {field}")
    
    def _update_error_patterns(self, errors: Dict[str, List[str]]) -> None:
        """Update error pattern history."""
        for field, messages in errors.items():
            if field not in self.error_patterns:
                self.error_patterns[field] = []
            self.error_patterns[field].extend(messages)
    
    def get_performance_metrics(self) -> Dict[str, float]:
        """Get validation performance metrics."""
        return {
            "avg_validation_time": np.mean(self.performance_metrics["validation_time"]),
            "avg_error_detection_time": np.mean(self.performance_metrics["error_detection_time"]),
            "avg_recovery_time": np.mean(self.performance_metrics["recovery_time"])
        }
    
    def suggest_corrections(self, field: str, value: Any) -> List[str]:
        """Suggest corrections for invalid values."""
        suggestions = []
        
        if field in self.rules:
            for rule in self.rules[field]:
                if isinstance(rule, PatternRule) and isinstance(value, str):
                    # Suggest corrections for pattern mismatches
                    if not rule.pattern.match(value):
                        suggestions.extend(self._generate_pattern_suggestions(value, rule.pattern))
                elif isinstance(rule, RangeRule) and isinstance(value, (int, float)):
                    # Suggest corrections for out-of-range values
                    if value < rule.min_val:
                        suggestions.append(f"Value should be at least {rule.min_val}")
                    elif value > rule.max_val:
                        suggestions.append(f"Value should be at most {rule.max_val}")
        
        return suggestions
    
    def _generate_pattern_suggestions(self, value: str, pattern: re.Pattern) -> List[str]:
        """Generate suggestions for pattern mismatches."""
        suggestions = []
        
        # Common patterns and their suggestions
        if pattern.pattern == r'^\d{4}-\d{2}-\d{2}$':  # Date pattern
            suggestions.append("Use YYYY-MM-DD format (e.g., 2024-02-15)")
        elif pattern.pattern == r'^\d{2}:\d{2}(:\d{2})?$':  # Time pattern
            suggestions.append("Use HH:MM or HH:MM:SS format (e.g., 14:30 or 14:30:00)")
        elif pattern.pattern == r'^[-+]?\d*\.?\d+$':  # Number pattern
            suggestions.append("Enter a valid number (e.g., 123 or 123.45)")
        
        return suggestions 