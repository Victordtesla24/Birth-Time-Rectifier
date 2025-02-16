from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from ..analysis.tattwa_analyzer import TattwaAnalyzer
from ..analysis.confidence_calculator import ConfidenceCalculator
from ..calculations.planetary_calculator import PlanetaryCalculator
from ..calculations.shadbala_calculator import ShadbalaCalculator
from ..utils.time_utils import TimeUtils
from ...models.birth_data import BirthData
from ...models.rectification_result import RectificationResult

class EnhancedRectificationEngine:
    """Enhanced birth time rectification engine with advanced features."""
    
    def __init__(self):
        """Initialize the enhanced rectification engine."""
        self.tattwa_analyzer = TattwaAnalyzer()
        self.confidence_calculator = ConfidenceCalculator()
        self.planetary_calculator = PlanetaryCalculator()
        self.shadbala_calculator = ShadbalaCalculator()
        self.time_utils = TimeUtils()
        
        # Initialize multi-pass refinement parameters
        self.refinement_passes = 3
        self.precision_threshold = 0.001  # In degrees
        
    def calculate_precise_time(self, birth_data: BirthData, events: List[Dict[str, Any]] = None) -> RectificationResult:
        """Calculate precise birth time using multi-pass refinement."""
        current_time = birth_data.birth_time
        best_result = None
        best_confidence = 0.0
        
        for pass_num in range(self.refinement_passes):
            # Adjust search window based on pass number
            window_size = timedelta(minutes=30) / (pass_num + 1)
            step_size = window_size / 20
            
            # Search within the current window
            test_time = current_time - window_size/2
            while test_time <= current_time + window_size/2:
                # Calculate positions and analyze
                test_data = birth_data.copy()
                test_data.birth_time = test_time
                
                # Calculate planetary positions
                positions = self.planetary_calculator.calculate_positions(test_data)
                
                # Analyze using Tattwa Shodhana
                element_balance = self.tattwa_analyzer.calculate_balance(positions)
                
                # Calculate confidence score
                confidence = self.confidence_calculator.calculate_confidence(
                    test_data, positions, element_balance, events
                )
                
                if confidence['overall_confidence'] > best_confidence:
                    best_confidence = confidence['overall_confidence']
                    best_result = RectificationResult(
                        rectified_time=test_time,
                        confidence_score=confidence['overall_confidence'],
                        planetary_positions=positions,
                        element_balance=element_balance
                    )
                
                test_time += step_size
            
            # Update current_time for next pass
            if best_result:
                current_time = best_result.rectified_time
            
            # Check if precision threshold is met
            if pass_num > 0 and abs(best_result.confidence_score - best_confidence) < self.precision_threshold:
                break
        
        return best_result 