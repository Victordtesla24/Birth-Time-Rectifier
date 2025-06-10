"""
Analysis Coordinator Module
Coordinates all analysis components for birth time rectification.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import numpy as np

from ..models.birth_data import BirthData
from ..models.rectification_result import RectificationResult
from ..astronomy.julian_day import JulianDayCalculator
from ..astronomy.planetary_positions import PlanetaryPositionsCalculator
from ..charts.divisional_charts import DivisionalChartsCalculator
from .kp_analysis import KPAnalyzer
from .fitness_evaluation import FitnessEvaluator

class AnalysisCoordinator:
    def __init__(self):
        """Initialize analysis coordinator."""
        self.jd_calculator = JulianDayCalculator()
        self.positions_calculator = PlanetaryPositionsCalculator()
        self.charts_calculator = DivisionalChartsCalculator()
        self.kp_analyzer = KPAnalyzer()
        self.fitness_evaluator = FitnessEvaluator()

    def perform_preliminary_analysis(self, birth_data: BirthData) -> Dict[str, Any]:
        """
        Perform preliminary analysis of birth data.
        
        Args:
            birth_data (BirthData): Birth data to analyze
            
        Returns:
            Dict[str, Any]: Preliminary analysis results
            
        Raises:
            ValueError: If analysis fails
        """
        try:
            # Calculate Julian day
            jd = self.jd_calculator.calculate_julian_day(birth_data)
            
            # Calculate planetary positions
            positions = self.positions_calculator.calculate_all_positions(jd)
            
            # Calculate divisional charts
            charts = self.charts_calculator.calculate_all_charts(positions)
            
            # Perform KP analysis
            kp = self.kp_analyzer.perform_kp_analysis(positions)
            
            return {
                "julian_day": jd,
                "planetary_positions": positions,
                "divisional_charts": charts,
                "kp_analysis": kp
            }
            
        except Exception as e:
            raise ValueError(f"Error in preliminary analysis: {str(e)}")

    def calculate_time_adjustment(self, preliminary_data: Dict[str, Any],
                                questionnaire_responses: Dict[str, Any]) -> float:
        """
        Calculate precise time adjustment based on analysis.
        
        Args:
            preliminary_data (Dict[str, Any]): Preliminary analysis results
            questionnaire_responses (Dict[str, Any]): User responses
            
        Returns:
            float: Time adjustment in hours
        """
        try:
            # Initialize adjustment parameters
            min_adjustment = -10  # minutes
            max_adjustment = 10   # minutes
            step_size = 0.5      # 30-second intervals
            
            # Calculate time points to test
            time_points = np.linspace(min_adjustment, max_adjustment, 
                                    int((max_adjustment - min_adjustment) / step_size) + 1)
            scores = []
            
            for time_point in time_points:
                # Convert minutes to fraction of day for Julian date
                test_jd = preliminary_data["julian_day"] + (time_point / 1440.0)  # 1440 minutes in a day
                
                # Calculate positions for test time
                test_positions = self.positions_calculator.calculate_all_positions(test_jd)
                
                # Calculate fitness score
                fitness = self.fitness_evaluator.evaluate_chart_fitness(
                    test_positions,
                    questionnaire_responses
                )
                scores.append((time_point, fitness))
            
            # Find the time point with highest fitness
            best_adjustment, best_fitness = max(scores, key=lambda x: x[1])
            
            # If confidence is not high enough, perform fine-tuning
            if best_fitness < 0.95:
                # Narrow the search range around the best adjustment
                min_adjustment = best_adjustment - 1  # ±1 minute
                max_adjustment = best_adjustment + 1
                step_size = 0.1  # 6-second intervals
                
                # Recalculate with higher precision
                time_points = np.linspace(min_adjustment, max_adjustment, 
                                        int((max_adjustment - min_adjustment) / step_size) + 1)
                scores = []
                
                for time_point in time_points:
                    test_jd = preliminary_data["julian_day"] + (time_point / 1440.0)
                    test_positions = self.positions_calculator.calculate_all_positions(test_jd)
                    fitness = self.fitness_evaluator.evaluate_chart_fitness(
                        test_positions,
                        questionnaire_responses
                    )
                    scores.append((time_point, fitness))
                
                best_adjustment, best_fitness = max(scores, key=lambda x: x[1])
            
            return best_adjustment / 60.0  # Convert minutes to hours
            
        except Exception as e:
            raise ValueError(f"Error calculating time adjustment: {str(e)}")

    def apply_time_adjustment(self, original_time: str, adjustment: float) -> str:
        """
        Apply time adjustment to original time.
        
        Args:
            original_time (str): Original time in HH:MM format
            adjustment (float): Time adjustment in hours
            
        Returns:
            str: Adjusted time in HH:MM format
        """
        try:
            dt = datetime.strptime(original_time, "%H:%M")
            
            # Convert adjustment from hours to minutes
            minutes_adjustment = int(adjustment * 60)
            
            # Add adjustment
            adjusted_dt = dt + timedelta(minutes=minutes_adjustment)
            
            return adjusted_dt.strftime("%H:%M")
            
        except Exception as e:
            raise ValueError(f"Error applying time adjustment: {str(e)}")

    def perform_comprehensive_analysis(self, birth_data: BirthData,
                                    questionnaire_responses: Dict[str, Any]) -> RectificationResult:
        """
        Perform comprehensive birth time rectification analysis.
        
        Args:
            birth_data (BirthData): Birth data to analyze
            questionnaire_responses (Dict[str, Any]): User responses
            
        Returns:
            RectificationResult: Complete rectification results
            
        Raises:
            ValueError: If analysis fails
        """
        try:
            # Perform preliminary analysis
            preliminary_results = self.perform_preliminary_analysis(birth_data)
            
            # Calculate time adjustment
            adjustment = self.calculate_time_adjustment(
                preliminary_results,
                questionnaire_responses
            )
            
            # Apply adjustment and recalculate positions
            adjusted_time = self.apply_time_adjustment(birth_data.time, adjustment)
            adjusted_birth_data = BirthData(
                date=birth_data.date,
                time=adjusted_time,
                place=birth_data.place
            )
            
            # Calculate final positions and charts
            final_jd = self.jd_calculator.calculate_julian_day(adjusted_birth_data)
            final_positions = self.positions_calculator.calculate_all_positions(final_jd)
            final_charts = self.charts_calculator.calculate_all_charts(final_positions)
            
            # Calculate confidence score
            confidence = self.fitness_evaluator.evaluate_chart_fitness(
                final_positions,
                questionnaire_responses
            )
            
            # Create result
            return RectificationResult(
                original_time=birth_data.time,
                rectified_time=adjusted_time,
                confidence_score=confidence,
                planetary_positions=final_positions,
                divisional_charts=final_charts,
                adjustment_factors=self.WEIGHTS
            )
            
        except Exception as e:
            raise ValueError(f"Error in comprehensive analysis: {str(e)}")

    # Weight factors for different components
    WEIGHTS = {
        "planetary_positions": 0.3,
        "divisional_charts": 0.2,
        "event_correlation": 0.3,
        "kp_analysis": 0.1,
        "sensitive_points": 0.1
    }
