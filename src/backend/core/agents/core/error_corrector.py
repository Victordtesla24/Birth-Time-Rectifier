"""Automated error correction module."""

from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime
import logging
import json
from pathlib import Path
import re

logger = logging.getLogger(__name__)

class ErrorCorrector:
    """Automated error correction with confidence scoring."""
    
    def __init__(self):
        """Initialize error corrector."""
        self.correction_rules = self._load_correction_rules()
        self.error_history = []
        self.correction_metrics = {
            "total_errors": 0,
            "corrected_errors": 0,
            "correction_rate": 0.0
        }
    
    def _load_correction_rules(self) -> Dict[str, Any]:
        """Load correction rules from configuration."""
        rules_path = Path(__file__).parent / "correction_rules.json"
        if rules_path.exists():
            with open(rules_path, "r") as f:
                return json.load(f)
        return {
            "validation_rules": {
                "birth_data": {
                    "date_format": "%Y-%m-%d",
                    "time_format": "%H:%M:%S",
                    "coordinate_ranges": {
                        "latitude": [-90, 90],
                        "longitude": [-180, 180]
                    }
                },
                "events": {
                    "required_fields": ["id", "type", "time", "description"],
                    "time_format": "%Y-%m-%d %H:%M:%S",
                    "intensity_range": [0, 1]
                },
                "planetary": {
                    "position_range": [0, 360]
                }
            },
            "correction_strategies": {
                "date_time": ["parse_common_formats", "normalize_format"],
                "coordinates": ["convert_to_decimal", "normalize_range"],
                "events": ["add_default_values", "normalize_time"],
                "planetary": ["normalize_position", "interpolate_missing"]
            }
        }
    
    def correct_errors(
        self,
        data: Dict[str, Any],
        data_type: str
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Correct errors in data with confidence scoring."""
        try:
            if not data or not data_type:
                return data, {
                    "corrected": False,
                    "confidence": 0.0,
                    "changes": []
                }
            
            original_data = data.copy()
            corrected_data = data.copy()
            changes = []
            
            # Apply corrections based on data type
            if data_type == "birth_data":
                corrected_data, changes = self._correct_birth_data(corrected_data)
            elif data_type == "events":
                corrected_data, changes = self._correct_events(corrected_data)
            elif data_type == "planetary":
                corrected_data, changes = self._correct_planetary(corrected_data)
            elif data_type == "coordinates":
                corrected_data, changes = self._correct_coordinates(corrected_data)
            
            # Calculate confidence
            confidence = self._calculate_correction_confidence(
                original_data,
                corrected_data,
                data_type
            )
            
            # Update metrics
            self._update_metrics(bool(changes))
            
            return corrected_data, {
                "corrected": bool(changes),
                "confidence": confidence,
                "changes": changes
            }
            
        except Exception as e:
            logger.error(f"Error in correction process: {str(e)}")
            return data, {
                "corrected": False,
                "confidence": 0.0,
                "changes": []
            }
    
    def _correct_birth_data(
        self,
        data: Dict[str, Any]
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """Correct birth data errors."""
        changes = []
        rules = self.correction_rules["validation_rules"]["birth_data"]
        
        # Correct date format
        if "date" in data:
            corrected_date = self._correct_date_format(
                data["date"],
                rules["date_format"]
            )
            if corrected_date != data["date"]:
                changes.append({
                    "field": "date",
                    "original": data["date"],
                    "corrected": corrected_date
                })
                data["date"] = corrected_date
        
        # Correct time format
        if "time" in data:
            corrected_time = self._correct_time_format(
                data["time"],
                rules["time_format"]
            )
            if corrected_time != data["time"]:
                changes.append({
                    "field": "time",
                    "original": data["time"],
                    "corrected": corrected_time
                })
                data["time"] = corrected_time
        
        # Correct coordinates
        if "latitude" in data:
            corrected_lat = self._correct_coordinate(
                data["latitude"],
                rules["coordinate_ranges"]["latitude"]
            )
            if corrected_lat != data["latitude"]:
                changes.append({
                    "field": "latitude",
                    "original": data["latitude"],
                    "corrected": corrected_lat
                })
                data["latitude"] = corrected_lat
        
        if "longitude" in data:
            corrected_lon = self._correct_coordinate(
                data["longitude"],
                rules["coordinate_ranges"]["longitude"]
            )
            if corrected_lon != data["longitude"]:
                changes.append({
                    "field": "longitude",
                    "original": data["longitude"],
                    "corrected": corrected_lon
                })
                data["longitude"] = corrected_lon
        
        return data, changes
    
    def _correct_events(
        self,
        data: Dict[str, Any]
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """Correct event data errors."""
        changes = []
        rules = self.correction_rules["validation_rules"]["events"]
        
        # Add missing required fields
        for field in rules["required_fields"]:
            if field not in data:
                data[field] = self._get_default_value(field)
                changes.append({
                    "field": field,
                    "original": None,
                    "corrected": data[field]
                })
        
        # Correct time format
        if "time" in data:
            corrected_time = self._correct_time_format(
                data["time"],
                rules["time_format"]
            )
            if corrected_time != data["time"]:
                changes.append({
                    "field": "time",
                    "original": data["time"],
                    "corrected": corrected_time
                })
                data["time"] = corrected_time
        
        # Correct intensity range
        if "intensity" in data:
            corrected_intensity = self._correct_intensity(
                data["intensity"],
                rules["intensity_range"]
            )
            if corrected_intensity != data["intensity"]:
                changes.append({
                    "field": "intensity",
                    "original": data["intensity"],
                    "corrected": corrected_intensity
                })
                data["intensity"] = corrected_intensity
        
        return data, changes
    
    def _correct_planetary(
        self,
        data: Dict[str, Any]
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """Correct planetary position errors."""
        changes = []
        rules = self.correction_rules["validation_rules"]["planetary"]
        
        for planet, position in data.items():
            corrected_position = self._correct_position(
                position,
                rules["position_range"]
            )
            if corrected_position != position:
                changes.append({
                    "field": planet,
                    "original": position,
                    "corrected": corrected_position
                })
                data[planet] = corrected_position
        
        return data, changes
    
    def _correct_coordinates(
        self,
        data: Dict[str, Any]
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """Correct coordinate format errors."""
        changes = []
        rules = self.correction_rules["validation_rules"]["birth_data"]["coordinate_ranges"]
        
        if "latitude" in data:
            corrected_lat = self._parse_coordinate(data["latitude"])
            if corrected_lat != data["latitude"]:
                changes.append({
                    "field": "latitude",
                    "original": data["latitude"],
                    "corrected": corrected_lat
                })
                data["latitude"] = corrected_lat
        
        if "longitude" in data:
            corrected_lon = self._parse_coordinate(data["longitude"])
            if corrected_lon != data["longitude"]:
                changes.append({
                    "field": "longitude",
                    "original": data["longitude"],
                    "corrected": corrected_lon
                })
                data["longitude"] = corrected_lon
        
        return data, changes
    
    def _correct_date_format(self, date_str: str, target_format: str) -> str:
        """Correct date format."""
        try:
            # Try common date formats
            for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"]:
                try:
                    date_obj = datetime.strptime(date_str, fmt)
                    return date_obj.strftime(target_format)
                except ValueError:
                    continue
            
            # If no format matches, try to parse components
            components = re.findall(r"\d+", date_str)
            if len(components) == 3:
                year = int(components[0])
                month = int(components[1])
                day = int(components[2])
                return datetime(year, month, day).strftime(target_format)
            
            return date_str
            
        except Exception:
            return date_str
    
    def _correct_time_format(self, time_str: str, target_format: str) -> str:
        """Correct time format."""
        try:
            # Try common time formats
            for fmt in ["%H:%M:%S", "%H:%M", "%I:%M:%S %p", "%I:%M %p"]:
                try:
                    time_obj = datetime.strptime(time_str, fmt)
                    return time_obj.strftime(target_format)
                except ValueError:
                    continue
            
            # If no format matches, try to parse components
            components = re.findall(r"\d+", time_str)
            if len(components) >= 2:
                hour = int(components[0])
                minute = int(components[1])
                second = int(components[2]) if len(components) > 2 else 0
                
                # Handle hour overflow
                if hour >= 24:
                    hour = hour % 24
                
                return datetime(2000, 1, 1, hour, minute, second).strftime(target_format)
            
            return time_str
            
        except Exception:
            return time_str
    
    def _correct_coordinate(self, coord: float, coord_range: List[float]) -> float:
        """Correct coordinate value."""
        try:
            # Ensure coordinate is within valid range
            min_val, max_val = coord_range
            if isinstance(coord, (int, float)):
                return max(min(coord, max_val), min_val)
            return 0.0
            
        except Exception:
            return 0.0
    
    def _correct_position(self, position: float, position_range: List[float]) -> float:
        """Correct planetary position."""
        try:
            if isinstance(position, (int, float)):
                # Normalize to [0, 360) range
                return position % 360
            return 0.0
            
        except Exception:
            return 0.0
    
    def _correct_intensity(self, intensity: float, intensity_range: List[float]) -> float:
        """Correct intensity value."""
        try:
            min_val, max_val = intensity_range
            if isinstance(intensity, (int, float)):
                return max(min(intensity, max_val), min_val)
            return 0.5  # Default middle value
            
        except Exception:
            return 0.5
    
    def _parse_coordinate(self, coord: Any) -> float:
        """Parse coordinate from various formats."""
        try:
            if isinstance(coord, (int, float)):
                return float(coord)
            
            if isinstance(coord, str):
                # Parse DMS format (e.g., "40°42'46"N")
                match = re.match(
                    r"(\d+)°(\d+)'(\d+)\"([NSEW])",
                    coord
                )
                if match:
                    deg, min, sec, dir = match.groups()
                    value = float(deg) + float(min)/60 + float(sec)/3600
                    if dir in ["S", "W"]:
                        value = -value
                    return value
                
                # Try to extract numeric value
                numeric = re.findall(r"[-+]?\d*\.\d+|\d+", coord)
                if numeric:
                    return float(numeric[0])
            
            return 0.0
            
        except Exception:
            return 0.0
    
    def _get_default_value(self, field: str) -> Any:
        """Get default value for a field."""
        defaults = {
            "id": "",
            "type": "unknown",
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "description": "",
            "intensity": 0.5
        }
        return defaults.get(field)
    
    def _calculate_correction_confidence(
        self,
        original: Dict[str, Any],
        corrected: Dict[str, Any],
        data_type: str
    ) -> float:
        """Calculate confidence score for corrections."""
        if data_type == "birth_data":
            return self._calculate_datetime_confidence(original, corrected)
        elif data_type == "coordinates":
            return self._calculate_coordinates_confidence(original, corrected)
        elif data_type == "events":
            return self._calculate_events_confidence(original, corrected)
        elif data_type == "planetary":
            return self._calculate_planetary_confidence(original, corrected)
        return 0.0
    
    def _calculate_datetime_confidence(
        self,
        original: Dict[str, Any],
        corrected: Dict[str, Any]
    ) -> float:
        """Calculate confidence for datetime corrections."""
        confidence_scores = []
        
        if "date" in original and "date" in corrected:
            if original["date"] == corrected["date"]:
                confidence_scores.append(1.0)
            else:
                try:
                    datetime.strptime(corrected["date"], "%Y-%m-%d")
                    confidence_scores.append(0.8)
                except ValueError:
                    confidence_scores.append(0.3)
        
        if "time" in original and "time" in corrected:
            if original["time"] == corrected["time"]:
                confidence_scores.append(1.0)
            else:
                try:
                    datetime.strptime(corrected["time"], "%H:%M:%S")
                    confidence_scores.append(0.8)
                except ValueError:
                    confidence_scores.append(0.3)
        
        return sum(confidence_scores) / max(len(confidence_scores), 1)
    
    def _calculate_coordinates_confidence(
        self,
        original: Dict[str, Any],
        corrected: Dict[str, Any]
    ) -> float:
        """Calculate confidence for coordinate corrections."""
        confidence_scores = []
        
        for field in ["latitude", "longitude"]:
            if field in original and field in corrected:
                if original[field] == corrected[field]:
                    confidence_scores.append(1.0)
                else:
                    # Check if within valid ranges
                    ranges = self.correction_rules["validation_rules"]["birth_data"]["coordinate_ranges"]
                    min_val, max_val = ranges[field]
                    if min_val <= corrected[field] <= max_val:
                        confidence_scores.append(0.8)
                    else:
                        confidence_scores.append(0.3)
        
        return sum(confidence_scores) / max(len(confidence_scores), 1)
    
    def _calculate_events_confidence(
        self,
        original: Dict[str, Any],
        corrected: Dict[str, Any]
    ) -> float:
        """Calculate confidence for event corrections."""
        confidence_scores = []
        
        # Check required fields
        required_fields = self.correction_rules["validation_rules"]["events"]["required_fields"]
        for field in required_fields:
            if field in corrected:
                if field not in original or original[field] is None:
                    confidence_scores.append(0.5)  # Added missing field
                elif original[field] == corrected[field]:
                    confidence_scores.append(1.0)  # No change needed
                else:
                    confidence_scores.append(0.7)  # Corrected field
        
        # Check time format
        if "time" in corrected:
            try:
                datetime.strptime(corrected["time"], "%Y-%m-%d %H:%M:%S")
                confidence_scores.append(0.9)
            except ValueError:
                confidence_scores.append(0.4)
        
        return sum(confidence_scores) / max(len(confidence_scores), 1)
    
    def _calculate_planetary_confidence(
        self,
        original: Dict[str, Any],
        corrected: Dict[str, Any]
    ) -> float:
        """Calculate confidence for planetary corrections."""
        confidence_scores = []
        
        for planet in corrected:
            if planet in original:
                if original[planet] == corrected[planet]:
                    confidence_scores.append(1.0)
                else:
                    # Check if within valid range [0, 360)
                    if 0 <= corrected[planet] < 360:
                        confidence_scores.append(0.8)
                    else:
                        confidence_scores.append(0.3)
        
        return sum(confidence_scores) / max(len(confidence_scores), 1)
    
    def _update_metrics(self, success: bool) -> None:
        """Update correction metrics."""
        self.correction_metrics["total_errors"] += 1
        if success:
            self.correction_metrics["corrected_errors"] += 1
        
        total = self.correction_metrics["total_errors"]
        corrected = self.correction_metrics["corrected_errors"]
        self.correction_metrics["correction_rate"] = corrected / total if total > 0 else 0.0
    
    def _get_correction_changes(
        self,
        original: Dict[str, Any],
        corrected: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Get list of changes made during correction."""
        changes = []
        
        for field in set(original.keys()) | set(corrected.keys()):
            if field in original and field in corrected:
                if original[field] != corrected[field]:
                    changes.append({
                        "field": field,
                        "original": original[field],
                        "corrected": corrected[field]
                    })
            elif field in corrected:
                changes.append({
                    "field": field,
                    "original": None,
                    "corrected": corrected[field]
                })
        
        return changes
