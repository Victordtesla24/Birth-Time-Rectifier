"""
Rectification Result Model
Contains the data structure for birth time rectification results.
"""

from typing import Dict, Any

class RectificationResult:
    def __init__(self, original_time: str, rectified_time: str, confidence_score: float,
                 planetary_positions: Dict[str, Any], divisional_charts: Dict[str, Any],
                 adjustment_factors: Dict[str, float]):
        """
        Initialize rectification result.
        
        Args:
            original_time (str): Original birth time in HH:MM format
            rectified_time (str): Rectified birth time in HH:MM format
            confidence_score (float): Confidence score between 0 and 1
            planetary_positions (Dict[str, Any]): Calculated planetary positions
            divisional_charts (Dict[str, Any]): Calculated divisional charts
            adjustment_factors (Dict[str, float]): Factors influencing the rectification
        """
        self.original_time = original_time
        self.rectified_time = rectified_time
        self.confidence_score = confidence_score
        self.planetary_positions = planetary_positions
        self.divisional_charts = divisional_charts
        self.adjustment_factors = adjustment_factors
