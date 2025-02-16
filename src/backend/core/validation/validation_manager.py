from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from datetime import datetime
from pydantic import BaseModel, ValidationError
from ..ml.model_manager import MLModelManager
from ..utils.error_handler import ErrorHandler
from ..models.validation_result import ValidationResult

class ValidationManager:
    def __init__(self):
        self.ml_manager = MLModelManager()
        self.error_handler = ErrorHandler()
        self.validation_rules = {}
        self.error_patterns = {}
        self.validation_history = []
        
    def validate_data(
        self,
        data: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> ValidationResult:
        """Validate data using ML-based detection and rule-based validation."""
        try:
            # Initialize validation result
            validation_result = ValidationResult(
                is_valid=True,
                errors=[],
                warnings=[],
                confidence=1.0
            )
            
            # 1. ML-based error detection
            ml_errors = self._detect_errors_ml(data)
            validation_result.errors.extend(ml_errors)
            
            # 2. Rule-based validation
            rule_errors = self._validate_rules(data)
            validation_result.errors.extend(rule_errors)
            
            # 3. Cross-field validation
            cross_field_errors = self._validate_cross_fields(data)
            validation_result.errors.extend(cross_field_errors)
            
            # 4. Context-specific validation
            if context:
                context_errors = self._validate_context(data, context)
                validation_result.errors.extend(context_errors)
            
            # 5. Calculate overall confidence
            validation_result.confidence = self._calculate_validation_confidence(
                data,
                validation_result.errors
            )
            
            # Update validation status
            validation_result.is_valid = len(validation_result.errors) == 0
            
            # Log validation result
            self._log_validation_result(validation_result, data)
            
            return validation_result
            
        except Exception as e:
            self.error_handler.handle_error(
                "Validation error",
                str(e),
                severity="high"
            )
            return self._get_fallback_validation()
    
    def add_validation_rule(
        self,
        field: str,
        rule: Dict[str, Any]
    ):
        """Add a new validation rule."""
        if field not in self.validation_rules:
            self.validation_rules[field] = []
        self.validation_rules[field].append(rule)
    
    def update_error_patterns(
        self,
        new_patterns: Dict[str, Any]
    ):
        """Update ML error detection patterns."""
        self.error_patterns.update(new_patterns)
        self.ml_manager.update_model(
            'error_detection',
            {'patterns': new_patterns}
        )
    
    def _detect_errors_ml(
        self,
        data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Detect errors using ML models."""
        errors = []
        
        try:
            # Get predictions from ML model
            prediction = self.ml_manager.predict(
                data,
                'error_detection'
            )
            
            if prediction.confidence > 0.7:
                # Process predicted errors
                for error in prediction.prediction:
                    errors.append({
                        'type': 'ml_detected',
                        'field': error['field'],
                        'message': error['message'],
                        'confidence': error['confidence']
                    })
                    
        except Exception as e:
            self.error_handler.handle_error(
                "ML error detection failed",
                str(e),
                severity="medium"
            )
            
        return errors
    
    def _validate_rules(
        self,
        data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Validate data against defined rules."""
        errors = []
        
        for field, rules in self.validation_rules.items():
            if field in data:
                field_value = data[field]
                
                for rule in rules:
                    if not self._check_rule(field_value, rule):
                        errors.append({
                            'type': 'rule_violation',
                            'field': field,
                            'message': rule['message'],
                            'rule': rule['name']
                        })
                        
        return errors
    
    def _validate_cross_fields(
        self,
        data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Validate relationships between fields."""
        errors = []
        
        # Define cross-field validation rules
        cross_field_rules = [
            {
                'fields': ['birth_time', 'birth_date'],
                'validator': self._validate_birth_datetime
            },
            {
                'fields': ['latitude', 'longitude'],
                'validator': self._validate_coordinates
            }
        ]
        
        for rule in cross_field_rules:
            if all(field in data for field in rule['fields']):
                field_values = [data[field] for field in rule['fields']]
                validation_result = rule['validator'](*field_values)
                
                if not validation_result[0]:
                    errors.append({
                        'type': 'cross_field_violation',
                        'fields': rule['fields'],
                        'message': validation_result[1]
                    })
                    
        return errors
    
    def _validate_context(
        self,
        data: Dict[str, Any],
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Validate data against context-specific rules."""
        errors = []
        
        # Example: Validate birth time against historical events
        if 'birth_time' in data and 'historical_events' in context:
            time_errors = self._validate_time_against_events(
                data['birth_time'],
                context['historical_events']
            )
            errors.extend(time_errors)
            
        return errors
    
    def _check_rule(
        self,
        value: Any,
        rule: Dict[str, Any]
    ) -> bool:
        """Check if a value satisfies a validation rule."""
        rule_type = rule['type']
        
        if rule_type == 'range':
            return rule['min'] <= value <= rule['max']
        elif rule_type == 'pattern':
            return rule['pattern'].match(str(value)) is not None
        elif rule_type == 'custom':
            return rule['validator'](value)
        
        return True
    
    def _validate_birth_datetime(
        self,
        birth_time: str,
        birth_date: str
    ) -> Tuple[bool, str]:
        """Validate birth time and date combination."""
        try:
            datetime.strptime(f"{birth_date} {birth_time}", "%Y-%m-%d %H:%M:%S")
            return True, ""
        except ValueError:
            return False, "Invalid birth date/time combination"
    
    def _validate_coordinates(
        self,
        latitude: float,
        longitude: float
    ) -> Tuple[bool, str]:
        """Validate geographical coordinates."""
        if not (-90 <= latitude <= 90):
            return False, "Invalid latitude"
        if not (-180 <= longitude <= 180):
            return False, "Invalid longitude"
        return True, ""
    
    def _validate_time_against_events(
        self,
        birth_time: str,
        historical_events: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Validate birth time against historical events."""
        errors = []
        birth_dt = datetime.strptime(birth_time, "%H:%M:%S")
        
        for event in historical_events:
            event_dt = datetime.strptime(event['time'], "%H:%M:%S")
            if abs((birth_dt - event_dt).total_seconds()) < 300:  # 5 minutes
                errors.append({
                    'type': 'historical_conflict',
                    'message': f"Birth time conflicts with historical event: {event['description']}",
                    'event': event
                })
                
        return errors
    
    def _calculate_validation_confidence(
        self,
        data: Dict[str, Any],
        errors: List[Dict[str, Any]]
    ) -> float:
        """Calculate overall validation confidence score."""
        if not errors:
            return 1.0
            
        # Calculate base confidence
        base_confidence = 1.0 - (len(errors) * 0.1)
        
        # Adjust for error severity
        severity_penalty = sum(
            0.2 if error.get('type') == 'ml_detected' else 0.1
            for error in errors
        )
        
        # Adjust for data completeness
        completeness = len(data) / len(self.validation_rules)
        
        final_confidence = (base_confidence - severity_penalty) * completeness
        return max(0.0, min(1.0, final_confidence))
    
    def _log_validation_result(
        self,
        result: ValidationResult,
        data: Dict[str, Any]
    ):
        """Log validation result for analysis."""
        self.validation_history.append({
            'timestamp': datetime.now(),
            'result': result,
            'data_snapshot': data
        })
    
    def _get_fallback_validation(self) -> ValidationResult:
        """Return fallback validation result when validation fails."""
        return ValidationResult(
            is_valid=False,
            errors=[{
                'type': 'system_error',
                'message': "Validation system error occurred"
            }],
            warnings=[],
            confidence=0.0
        ) 