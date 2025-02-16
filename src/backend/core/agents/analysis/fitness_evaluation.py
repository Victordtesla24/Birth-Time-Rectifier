"""
Fitness Evaluation Module
Handles chart fitness evaluation for birth time rectification.
"""

from typing import Dict, Any
from .kp_analysis import KPAnalyzer

class FitnessEvaluator:
    # Weight factors for different components
    WEIGHTS = {
        'event_correlation': 0.25,
        'house_strength': 0.15,
        'aspect_strength': 0.15,
        'kp_strength': 0.10,
        'yogas_strength': 0.15,
        'trait_correlation': 0.10,
        'divisional_harmony': 0.10
    }

    @classmethod
    def evaluate_chart_fitness(cls, positions: Dict[str, Any], 
                             questionnaire_responses: Dict[str, Any]) -> float:
        """
        Evaluate overall chart fitness.
        
        Args:
            positions (Dict[str, Any]): Planetary positions
            questionnaire_responses (Dict[str, Any]): User responses
            
        Returns:
            float: Fitness score (0-1)
        """
        try:
            # Calculate various fitness components
            event_correlation = cls._evaluate_event_correlation(positions, questionnaire_responses)
            house_strength = cls._evaluate_house_strength(positions)
            aspect_strength = cls._evaluate_aspect_strength(positions)
            kp_strength = cls._evaluate_kp_factors(positions)
            yogas_strength = cls._evaluate_yogas_strength(positions)
            trait_correlation = cls._evaluate_trait_correlation(positions, questionnaire_responses)
            divisional_harmony = cls._evaluate_divisional_harmony(positions)
            
            # Calculate weighted fitness score
            fitness = (
                cls.WEIGHTS['event_correlation'] * event_correlation +
                cls.WEIGHTS['house_strength'] * house_strength +
                cls.WEIGHTS['aspect_strength'] * aspect_strength +
                cls.WEIGHTS['kp_strength'] * kp_strength +
                cls.WEIGHTS['yogas_strength'] * yogas_strength +
                cls.WEIGHTS['trait_correlation'] * trait_correlation +
                cls.WEIGHTS['divisional_harmony'] * divisional_harmony
            )
            
            return fitness
            
        except Exception as e:
            return 0.5  # Return neutral value on error

    @classmethod
    def _evaluate_event_correlation(cls, positions: Dict[str, Any],
                                questionnaire_responses: Dict[str, Any]) -> float:
        """Evaluate correlation between events and planetary positions."""
        try:
            total_correlation = 0.0
            count = 0
            
            # Check life area correlation
            if 'life_area' in questionnaire_responses:
                area = questionnaire_responses['life_area']
                area_correlation = cls._calculate_life_area_correlation(area, positions)
                total_correlation += area_correlation
                count += 1
            
            # Check major events correlation
            if 'major_events' in questionnaire_responses:
                events = questionnaire_responses['major_events']
                for event in events:
                    event_correlation = cls._calculate_event_type_correlation(event, positions)
                    total_correlation += event_correlation
                    count += 1
            
            return total_correlation / max(count, 1)
            
        except Exception as e:
            return 0.5

    @classmethod
    def _evaluate_house_strength(cls, positions: Dict[str, Any]) -> float:
        """Evaluate strength of houses based on planetary positions."""
        try:
            # Define benefic and malefic planets
            benefics = ['Jupiter', 'Venus', 'Moon']
            malefics = ['Saturn', 'Mars', 'Rahu', 'Ketu']
            
            total_strength = 0.0
            count = 0
            
            for planet, pos in positions.items():
                # Get house position (1-12)
                house = int(pos['longitude'] / 30) + 1
                
                # Calculate base strength
                strength = 1.0 if house in [1, 4, 7, 10] else 0.5  # Angular houses are stronger
                
                # Modify strength based on planet type
                if planet in benefics:
                    strength *= 1.5
                elif planet in malefics:
                    strength *= 0.5
                
                total_strength += strength
                count += 1
            
            return total_strength / max(count, 1)
            
        except Exception as e:
            return 0.5

    @classmethod
    def _evaluate_aspect_strength(cls, positions: Dict[str, Any]) -> float:
        """Evaluate strength of planetary aspects."""
        try:
            # Define aspect angles and their weights
            aspects = {
                0: 1.0,    # Conjunction
                60: 0.5,   # Sextile
                90: -0.5,  # Square
                120: 0.8,  # Trine
                180: -0.8  # Opposition
            }
            
            total_strength = 0.0
            count = 0
            
            # Check aspects between all planet pairs
            planets = list(positions.keys())
            for i in range(len(planets)):
                for j in range(i + 1, len(planets)):
                    p1 = planets[i]
                    p2 = planets[j]
                    
                    # Calculate angular distance
                    angle = abs(positions[p1]['longitude'] - positions[p2]['longitude'])
                    if angle > 180:
                        angle = 360 - angle
                    
                    # Check for aspects
                    for aspect_angle, weight in aspects.items():
                        orb = 6 if aspect_angle == 0 else 8  # Tighter orb for conjunctions
                        if abs(angle - aspect_angle) <= orb:
                            total_strength += weight
                            count += 1
                            break
            
            return (total_strength / max(count, 1) + 1) / 2  # Normalize to 0-1
            
        except Exception as e:
            return 0.5

    @classmethod
    def _evaluate_kp_factors(cls, positions: Dict[str, Any]) -> float:
        """Evaluate KP factors based on planetary positions."""
        try:
            # Use KPAnalyzer for detailed analysis
            kp_results = KPAnalyzer.perform_kp_analysis(positions)
            
            # Calculate average strength
            total_strength = sum(
                result['strength'] 
                for result in kp_results.values() 
                if 'strength' in result
            )
            count = len(kp_results)
            
            return total_strength / max(count, 1)
            
        except Exception as e:
            return 0.5

    @classmethod
    def _evaluate_yogas_strength(cls, positions: Dict[str, Any]) -> float:
        """Evaluate strength of yoga formations."""
        try:
            # Define basic yoga formations
            raja_yoga_count = cls._count_raja_yogas(positions)
            dhana_yoga_count = cls._count_dhana_yogas(positions)
            
            # Calculate total yoga strength
            total_strength = (raja_yoga_count * 0.3 + dhana_yoga_count * 0.2)
            
            # Normalize to 0-1
            return min(total_strength, 1.0)
            
        except Exception as e:
            return 0.5

    @classmethod
    def _evaluate_trait_correlation(cls, positions: Dict[str, Any],
                                questionnaire_responses: Dict[str, Any]) -> float:
        """Evaluate correlation between planetary positions and reported traits."""
        try:
            total_correlation = 0.0
            count = 0
            
            # Check physical traits
            if 'physical_appearance' in questionnaire_responses:
                physical_correlation = cls._calculate_physical_correlation(
                    questionnaire_responses['physical_appearance'],
                    positions
                )
                total_correlation += physical_correlation
                count += 1
            
            # Check personality traits
            if 'personality_trait' in questionnaire_responses:
                personality_correlation = cls._calculate_personality_correlation(
                    questionnaire_responses['personality_trait'],
                    positions
                )
                total_correlation += personality_correlation
                count += 1
            
            return total_correlation / max(count, 1)
            
        except Exception as e:
            return 0.5

    @classmethod
    def _evaluate_divisional_harmony(cls, positions: Dict[str, Any]) -> float:
        """Evaluate harmony between different divisional charts."""
        try:
            # Calculate positions in key divisional charts
            d1_positions = positions  # Rashi (birth chart)
            d9_positions = cls._calculate_navamsa_positions(positions)  # Navamsa
            
            # Calculate harmony between charts
            harmony = cls._calculate_chart_harmony(d1_positions, d9_positions)
            
            return harmony
            
        except Exception as e:
            return 0.5

    @staticmethod
    def _calculate_chart_harmony(chart1: Dict[str, Any], chart2: Dict[str, Any]) -> float:
        """Calculate harmony between two charts."""
        try:
            total_harmony = 0.0
            count = 0
            
            # Compare planetary positions between charts
            for planet in chart1.keys():
                if planet in chart2:
                    # Calculate angular difference
                    diff = abs(chart1[planet]['longitude'] - chart2[planet]['longitude'])
                    if diff > 180:
                        diff = 360 - diff
                    
                    # Higher harmony for closer positions
                    harmony = 1 - (diff / 180)
                    total_harmony += harmony
                    count += 1
            
            return total_harmony / max(count, 1)
            
        except Exception as e:
            return 0.5
