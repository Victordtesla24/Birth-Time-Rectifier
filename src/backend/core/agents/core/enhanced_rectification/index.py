from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import numpy as np
from ..models.birth_data import BirthData
from ..models.rectification_result import RectificationResult
from ..astronomy.planetary_positions import PlanetaryPositionsCalculator
from ..analysis.kp_analysis import KPAnalyzer
from ..analysis.fitness_evaluation import FitnessEvaluator
from ..astronomy.house_calculator import HouseCalculator
from ..charts.divisional_charts import DivisionalChartsCalculator
from ..astronomy.julian_day import JulianDayCalculator


class EnhancedRectificationEngine:
    """Enhanced birth time rectification engine with advanced features."""
    
    def __init__(self):
        """Initialize the enhanced rectification engine."""
        self.positions_calculator = PlanetaryPositionsCalculator()
        self.kp_analyzer = KPAnalyzer()
        self.fitness_evaluator = FitnessEvaluator()
        self.house_calculator = HouseCalculator()
        self.divisional_calculator = DivisionalChartsCalculator()
        self.jd_calculator = JulianDayCalculator()
        
        # Initialize Tattwa Shodhana parameters
        self.tattwa_elements = {
            'fire': ['Sun', 'Mars', 'Ketu'],
            'earth': ['Mercury', 'Venus', 'Rahu'],
            'air': ['Saturn', 'Venus'],
            'water': ['Moon', 'Venus'],
            'ether': ['Jupiter']
        }
        
        self.element_qualities = {
            'fire': ['transformative', 'energetic', 'passionate'],
            'earth': ['stable', 'practical', 'reliable'],
            'air': ['intellectual', 'communicative', 'adaptable'],
            'water': ['emotional', 'intuitive', 'nurturing'],
            'ether': ['spiritual', 'expansive', 'philosophical']
        }
        
        # Initialize multi-pass refinement parameters
        self.refinement_passes = 3
        self.precision_threshold = 0.001  # In degrees
        
    def calculate_tattwa_balance(self, positions: Dict[str, float]) -> Dict[str, float]:
        """Calculate elemental balance using Tattwa Shodhana theory."""
        element_scores = {element: 0.0 for element in self.tattwa_elements.keys()}
        
        for planet, longitude in positions.items():
            # Get element contributions for each planet
            for element, planets in self.tattwa_elements.items():
                if planet in planets:
                    # Calculate element strength based on:
                    # 1. Planet's natural significations
                    # 2. House placement
                    # 3. Aspect relationships
                    # 4. Dignity status
                    base_strength = self._calculate_planet_strength(planet, longitude)
                    element_scores[element] += base_strength
                    
        # Normalize scores
        total = sum(element_scores.values())
        if total > 0:
            element_scores = {k: v/total for k, v in element_scores.items()}
            
        return element_scores
    
    def _calculate_planet_strength(self, planet: str, longitude: float) -> float:
        """Calculate planetary strength considering multiple factors."""
        strength = 1.0
        
        # 1. Shadbala calculations
        strength *= self._calculate_shadbala(planet, longitude)
        
        # 2. Dignity evaluation
        strength *= self._evaluate_dignity(planet, longitude)
        
        # 3. House placement effects
        strength *= self._evaluate_house_placement(planet, longitude)
        
        # 4. Aspect relationships
        strength *= self._evaluate_aspects(planet, longitude)
        
        return strength
    
    def _calculate_shadbala(self, planet: str, longitude: float) -> float:
        """Calculate Shadbala (six-fold strength) of a planet."""
        # Implement detailed Shadbala calculations
        sthana_bala = self._calculate_positional_strength(planet, longitude)
        kala_bala = self._calculate_temporal_strength(planet, longitude)
        dig_bala = self._calculate_directional_strength(planet, longitude)
        chesta_bala = self._calculate_motional_strength(planet, longitude)
        naisargika_bala = self._calculate_natural_strength(planet)
        drik_bala = self._calculate_aspectual_strength(planet, longitude)
        
        total_strength = (sthana_bala + kala_bala + dig_bala + 
                         chesta_bala + naisargika_bala + drik_bala) / 6.0
        
        return total_strength
    
    def _evaluate_dignity(self, planet: str, longitude: float) -> float:
        """Evaluate planetary dignity status."""
        # Implement dignity evaluation logic
        dignity_value = 1.0
        # Add detailed dignity calculations
        return dignity_value
    
    def _evaluate_house_placement(self, planet: str, longitude: float) -> float:
        """Evaluate effects of house placement."""
        # Implement house placement evaluation
        house_value = 1.0
        # Add detailed house effect calculations
        return house_value
    
    def _evaluate_aspects(self, planet: str, longitude: float) -> float:
        """Evaluate aspect relationships."""
        # Implement aspect evaluation
        aspect_value = 1.0
        # Add detailed aspect calculations
        return aspect_value
    
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
                positions = self.positions_calculator.calculate_positions(test_data)
                
                # Analyze using Tattwa Shodhana
                element_balance = self.calculate_tattwa_balance(positions)
                
                # Calculate confidence score
                confidence = self._calculate_confidence(
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
    
    def _calculate_confidence(
        self, 
        birth_data: BirthData,
        positions: Dict[str, float],
        element_balance: Dict[str, float],
        events: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Calculate detailed confidence metrics with enhanced granularity."""
        confidence_metrics = {}
        
        # 1. Tattwa Shodhana balance (30%)
        tattwa_score = self._evaluate_tattwa_balance(element_balance)
        confidence_metrics['tattwa_balance'] = {
            'score': tattwa_score,
            'weight': 0.3,
            'components': {
                'element_distribution': self._calculate_element_distribution(element_balance),
                'quality_balance': self._calculate_quality_balance(element_balance),
                'elemental_harmony': self._calculate_elemental_harmony(element_balance)
            }
        }
        
        # 2. Event correlations (30%)
        if events:
            event_score = self._evaluate_event_correlations(positions, events)
            confidence_metrics['event_correlations'] = {
                'score': event_score,
                'weight': 0.3,
                'components': {
                    'dasha_correlation': self._calculate_dasha_verification(birth_data, events),
                    'transit_correlation': self._calculate_transit_correlation(birth_data, events),
                    'divisional_correlation': self._calculate_divisional_correlation(positions, events)
                }
            }
        
        # 3. Planetary strength (20%)
        strength_score = self._evaluate_planetary_strengths(positions)
        confidence_metrics['planetary_strength'] = {
            'score': strength_score,
            'weight': 0.2,
            'components': {
                'shadbala': self._calculate_shadbala_components(positions),
                'dignity': self._calculate_dignity_components(positions),
                'house_placement': self._calculate_house_placement_components(positions)
            }
        }
        
        # 4. Chart harmony (20%)
        harmony_score = self._evaluate_chart_harmony(positions)
        confidence_metrics['chart_harmony'] = {
            'score': harmony_score,
            'weight': 0.2,
            'components': {
                'aspect_harmony': self._calculate_aspect_harmony(positions),
                'house_balance': self._calculate_house_balance(positions),
                'yogas': self._calculate_yoga_strength(positions)
            }
        }
        
        # Calculate overall confidence with detailed breakdown
        total_weight = sum(metric['weight'] for metric in confidence_metrics.values())
        weighted_sum = sum(metric['score'] * metric['weight'] for metric in confidence_metrics.values())
        overall_confidence = weighted_sum / total_weight if total_weight > 0 else 0.0
        
        # Add overall confidence and detailed metrics
        return {
            'overall_confidence': overall_confidence,
            'detailed_metrics': confidence_metrics,
            'confidence_trends': self._calculate_confidence_trends(confidence_metrics),
            'improvement_suggestions': self._generate_improvement_suggestions(confidence_metrics)
        }
    
    def _calculate_element_distribution(self, element_balance: Dict[str, float]) -> Dict[str, float]:
        """Calculate detailed element distribution metrics."""
        ideal_balance = 0.2  # Each element should be around 20%
        distribution_scores = {}
        
        for element, score in element_balance.items():
            deviation = abs(score - ideal_balance)
            distribution_scores[element] = 1.0 - (deviation / ideal_balance)
        
        return distribution_scores
    
    def _calculate_quality_balance(self, element_balance: Dict[str, float]) -> Dict[str, float]:
        """Calculate balance between different qualities."""
        qualities = {
            'cardinal': ['fire', 'air'],
            'fixed': ['earth', 'water'],
            'mutable': ['ether']
        }
        
        quality_scores = {}
        for quality, elements in qualities.items():
            quality_score = sum(element_balance[element] for element in elements if element in element_balance)
            quality_scores[quality] = quality_score
        
        return quality_scores
    
    def _calculate_confidence_trends(self, confidence_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate trends and patterns in confidence metrics."""
        trends = {}
        
        # Analyze relative strengths
        component_strengths = {
            component: metrics['score']
            for component, metrics in confidence_metrics.items()
        }
        
        # Identify strongest and weakest areas
        max_component = max(component_strengths.items(), key=lambda x: x[1])
        min_component = min(component_strengths.items(), key=lambda x: x[1])
        
        trends['strongest_area'] = {
            'component': max_component[0],
            'score': max_component[1]
        }
        
        trends['weakest_area'] = {
            'component': min_component[0],
            'score': min_component[1]
        }
        
        # Calculate balance metrics
        avg_score = sum(component_strengths.values()) / len(component_strengths)
        score_variance = sum((score - avg_score) ** 2 for score in component_strengths.values()) / len(component_strengths)
        
        trends['balance_metrics'] = {
            'average_score': avg_score,
            'score_variance': score_variance,
            'score_range': max_component[1] - min_component[1]
        }
        
        return trends
    
    def _generate_improvement_suggestions(self, confidence_metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate suggestions for improving confidence scores."""
        suggestions = []
        
        # Check each component for potential improvements
        for component, metrics in confidence_metrics.items():
            if metrics['score'] < 0.7:  # Threshold for suggesting improvements
                suggestion = {
                    'component': component,
                    'current_score': metrics['score'],
                    'target_score': min(metrics['score'] + 0.2, 1.0),
                    'priority': 'high' if metrics['score'] < 0.5 else 'medium'
                }
                
                # Add specific improvement steps based on component
                if component == 'tattwa_balance':
                    suggestion['steps'] = self._get_tattwa_improvement_steps(metrics)
                elif component == 'event_correlations':
                    suggestion['steps'] = self._get_event_improvement_steps(metrics)
                elif component == 'planetary_strength':
                    suggestion['steps'] = self._get_strength_improvement_steps(metrics)
                elif component == 'chart_harmony':
                    suggestion['steps'] = self._get_harmony_improvement_steps(metrics)
                
                suggestions.append(suggestion)
        
        return sorted(suggestions, key=lambda x: 0 if x['priority'] == 'high' else 1)
    
    def _get_tattwa_improvement_steps(self, metrics: Dict[str, Any]) -> List[str]:
        """Get improvement steps for Tattwa balance."""
        steps = []
        components = metrics['components']
        
        if components['element_distribution'].get('fire', 1.0) < 0.6:
            steps.append("Consider adjusting time to strengthen fire element influence")
        if components['quality_balance'].get('cardinal', 1.0) < 0.6:
            steps.append("Look for stronger cardinal quality placement")
        if components['elemental_harmony'] < 0.6:
            steps.append("Check for better elemental harmony between planets")
        
        return steps
    
    def _get_event_improvement_steps(self, metrics: Dict[str, Any]) -> List[str]:
        """Get improvement steps for event correlations."""
        steps = []
        components = metrics['components']
        
        if components['dasha_correlation']['overall_confidence'] < 0.6:
            steps.append("Verify dasha period calculations and event timing")
        if components['transit_correlation'] < 0.6:
            steps.append("Check transit positions during major events")
        if components['divisional_correlation'] < 0.6:
            steps.append("Analyze divisional charts for better event correlation")
        
        return steps
    
    def _get_strength_improvement_steps(self, metrics: Dict[str, Any]) -> List[str]:
        """Get improvement steps for planetary strength."""
        steps = []
        components = metrics['components']
        
        if components['shadbala']['total'] < 0.6:
            steps.append("Look for better planetary strength positions")
        if components['dignity']['total'] < 0.6:
            steps.append("Check for dignity-enhancing positions")
        if components['house_placement']['total'] < 0.6:
            steps.append("Consider alternative house placements")
        
        return steps
    
    def _get_harmony_improvement_steps(self, metrics: Dict[str, Any]) -> List[str]:
        """Get improvement steps for chart harmony."""
        steps = []
        components = metrics['components']
        
        if components['aspect_harmony'] < 0.6:
            steps.append("Look for better aspect patterns")
        if components['house_balance'] < 0.6:
            steps.append("Check house balance and distributions")
        if components['yogas'] < 0.6:
            steps.append("Analyze potential yoga formations")
        
        return steps
    
    def _evaluate_tattwa_balance(self, element_balance: Dict[str, float]) -> float:
        """Evaluate the quality of elemental balance."""
        # Implement Tattwa balance evaluation
        ideal_balance = 0.2  # Each element should be around 20%
        deviations = [abs(score - ideal_balance) for score in element_balance.values()]
        return 1.0 - sum(deviations) / len(deviations)
    
    def _evaluate_event_correlations(
        self,
        positions: Dict[str, float],
        events: List[Dict[str, Any]]
    ) -> float:
        """Evaluate correlation between planetary positions and life events."""
        # Implement event correlation analysis
        correlation_score = 0.0
        # Add detailed correlation calculations
        return correlation_score
    
    def _evaluate_planetary_strengths(self, positions: Dict[str, float]) -> float:
        """Evaluate overall planetary strength configuration."""
        # Implement planetary strength evaluation
        strength_score = 0.0
        # Add detailed strength calculations
        return strength_score
    
    def _evaluate_chart_harmony(self, positions: Dict[str, float]) -> float:
        """Evaluate overall chart harmony and balance."""
        # Implement chart harmony evaluation
        harmony_score = 0.0
        # Add detailed harmony calculations
        return harmony_score
    
    def _calculate_positional_strength(self, planet: str, longitude: float) -> float:
        """Calculate positional strength of a planet."""
        # Implement positional strength calculation
        positional_strength = 1.0
        # Add detailed positional strength calculations
        return positional_strength
    
    def _calculate_temporal_strength(self, planet: str, longitude: float) -> float:
        """Calculate temporal strength of a planet."""
        # Implement temporal strength calculation
        temporal_strength = 1.0
        # Add detailed temporal strength calculations
        return temporal_strength
    
    def _calculate_directional_strength(self, planet: str, longitude: float) -> float:
        """Calculate directional strength of a planet."""
        # Implement directional strength calculation
        directional_strength = 1.0
        # Add detailed directional strength calculations
        return directional_strength
    
    def _calculate_motional_strength(self, planet: str, longitude: float) -> float:
        """Calculate motional strength of a planet."""
        # Implement motional strength calculation
        motional_strength = 1.0
        # Add detailed motional strength calculations
        return motional_strength
    
    def _calculate_natural_strength(self, planet: str) -> float:
        """Calculate natural strength of a planet."""
        # Implement natural strength calculation
        natural_strength = 1.0
        # Add detailed natural strength calculations
        return natural_strength
    
    def _calculate_aspectual_strength(self, planet: str, longitude: float) -> float:
        """Calculate aspectual strength of a planet."""
        # Implement aspectual strength calculation
        aspectual_strength = 1.0
        # Add detailed aspectual strength calculations
        return aspectual_strength
    
    def _calculate_dignity(self, planet: str, longitude: float) -> float:
        """Calculate the dignity of a planet at a given longitude."""
        sign = int(longitude / 30)
        degree = longitude % 30
        
        # Planetary dignities mapping
        dignities = {
            "Sun": {"exaltation": 10, "moolatrikona": [0, 1], "own": [4], "debilitation": 180},
            "Moon": {"exaltation": 33, "moolatrikona": [3, 4], "own": [3], "debilitation": 213},
            "Mars": {"exaltation": 298, "moolatrikona": [0, 1], "own": [0, 7], "debilitation": 118},
            "Mercury": {"exaltation": 165, "moolatrikona": [5, 6], "own": [2, 5], "debilitation": 345},
            "Jupiter": {"exaltation": 95, "moolatrikona": [8, 9], "own": [8, 11], "debilitation": 275},
            "Venus": {"exaltation": 357, "moolatrikona": [6, 7], "own": [1, 6], "debilitation": 177},
            "Saturn": {"exaltation": 200, "moolatrikona": [10, 11], "own": [10, 11], "debilitation": 20},
            "Rahu": {"exaltation": 200, "own": [10], "debilitation": 20},
            "Ketu": {"exaltation": 20, "own": [4], "debilitation": 200}
        }
        
        if planet not in dignities:
            return 0.5
        
        planet_dignity = dignities[planet]
        planet_long = longitude
        
        # Calculate dignity score
        score = 0.5  # Default neutral score
        
        # Check exaltation
        if abs(planet_long - planet_dignity["exaltation"]) < 30:
            degree_diff = abs(planet_long - planet_dignity["exaltation"])
            score = 1.0 - (degree_diff / 60)  # Higher score near exact exaltation
        
        # Check debilitation
        elif abs(planet_long - planet_dignity["debilitation"]) < 30:
            degree_diff = abs(planet_long - planet_dignity["debilitation"])
            score = 0.3 + (degree_diff / 60)  # Lower score near exact debilitation
        
        # Check own sign
        elif sign in planet_dignity.get("own", []):
            score = 0.8
        
        # Check moolatrikona
        elif "moolatrikona" in planet_dignity and sign in planet_dignity["moolatrikona"]:
            score = 0.9
        
        return max(0.0, min(1.0, score))
    
    def _calculate_house_placement(self, planet: str, longitude: float, 
                                 houses: Dict[str, Any]) -> float:
        """Calculate the strength of a planet's house placement."""
        # Define natural house strengths for each planet
        natural_houses = {
            "Sun": [1, 5, 9, 10, 11],
            "Moon": [2, 3, 4, 7],
            "Mars": [1, 3, 6, 10],
            "Mercury": [1, 3, 6, 10],
            "Jupiter": [2, 5, 9, 11],
            "Venus": [2, 4, 7, 12],
            "Saturn": [3, 6, 10, 11],
            "Rahu": [3, 6, 11],
            "Ketu": [3, 6, 9]
        }
        
        if planet not in natural_houses:
            return 0.5
            
        # Find which house the planet is in
        planet_house = 1
        for house_num in range(1, 13):
            house_start = houses.get(f"H{house_num}", {}).get("longitude", 0)
            next_house = house_num + 1 if house_num < 12 else 1
            house_end = houses.get(f"H{next_house}", {}).get("longitude", 0)
            
            if house_end < house_start:  # Handles zodiac wrap-around
                if longitude >= house_start or longitude < house_end:
                    planet_house = house_num
                    break
            elif house_start <= longitude < house_end:
                planet_house = house_num
                break
        
        # Calculate base score
        base_score = 0.5
        
        # Boost score if planet is in its natural house
        if planet_house in natural_houses[planet]:
            base_score += 0.3
        
        # Additional factors
        if planet_house in [1, 4, 7, 10]:  # Angular houses
            base_score += 0.1
        elif planet_house in [2, 5, 8, 11]:  # Succedent houses
            base_score += 0.05
        
        return max(0.0, min(1.0, base_score))
    
    def _calculate_event_correlation(self, birth_positions: Dict[str, Any], 
                                   event_positions: Dict[str, Any],
                                   event_type: str) -> float:
        """Calculate correlation between birth and event positions."""
        correlation_score = 0.0
        
        # Define weights for different aspects
        aspect_weights = {
            "conjunction": 1.0,
            "opposition": 0.8,
            "trine": 0.7,
            "square": 0.6
        }
        
        # Check aspects between birth and event positions
        for birth_planet, birth_data in birth_positions.items():
            if isinstance(birth_data, dict) and "longitude" in birth_data:
                birth_long = birth_data["longitude"]
                
                for event_planet, event_data in event_positions.items():
                    if isinstance(event_data, dict) and "longitude" in event_data:
                        event_long = event_data["longitude"]
                        
                        # Calculate aspect
                        aspect_type = self._calculate_aspect_type(birth_long, event_long)
                        if aspect_type in aspect_weights:
                            correlation_score += aspect_weights[aspect_type]
        
        # Normalize score
        return min(correlation_score / 10.0, 1.0)
    
    def _calculate_aspect_type(self, long1: float, long2: float) -> str:
        """Calculate the type of aspect between two longitudes."""
        diff = abs(long1 - long2) % 360
        
        if diff < 10:  # Conjunction
            return "conjunction"
        elif abs(diff - 180) < 10:  # Opposition
            return "opposition"
        elif abs(diff - 120) < 10:  # Trine
            return "trine"
        elif abs(diff - 90) < 10:  # Square
            return "square"
        
        return "none"
    
    def _determine_event_weight(self, event_type: str) -> float:
        """Determine the weight of an event based on its type."""
        weights = {
            "birth": 1.0,
            "marriage": 0.9,
            "career": 0.8,
            "accident": 0.8,
            "relocation": 0.7,
            "education": 0.6,
            "general": 0.5
        }
        
        return weights.get(event_type.lower(), 0.5)
    
    def _calculate_planetary_strength(
        self,
        planet: str,
        position: float,
        birth_data: Optional[BirthData] = None
    ) -> float:
        """Calculate comprehensive planetary strength."""
        try:
            strengths = {}
            
            # 1. Shadbala (six-fold strength)
            shadbala = self._calculate_shadbala(planet, position, birth_data)
            strengths['shadbala'] = shadbala
            
            # 2. Dignity status
            dignity = self._calculate_dignity_status(planet, position)
            strengths['dignity'] = dignity
            
            # 3. House placement
            house_strength = self._calculate_house_placement_strength(planet, position, [])
            strengths['house'] = house_strength
            
            # 4. Aspect relationships
            aspect_strength = self._calculate_aspect_strength(planet, position, [], {})
            strengths['aspects'] = aspect_strength
            
            # 5. Natural strength
            natural_strength = self._calculate_natural_strength(planet)
            strengths['natural'] = natural_strength
            
            # 6. Temporal strength
            temporal_strength = self._calculate_temporal_strength(planet, position, birth_data)
            strengths['temporal'] = temporal_strength
            
            # Calculate weighted average
            weights = {
                'shadbala': 0.25,
                'dignity': 0.20,
                'house': 0.15,
                'aspects': 0.15,
                'natural': 0.15,
                'temporal': 0.10
            }
            
            total_strength = sum(
                strength * weights[key]
                for key, strength in strengths.items()
            )
            
            return total_strength
            
        except Exception as e:
            print(f"Error calculating planetary strength: {str(e)}")
            return 0.0
    
    def _calculate_shadbala(
        self,
        planet: str,
        position: float,
        birth_data: Optional[BirthData]
    ) -> float:
        """Calculate Shadbala (six-fold strength)."""
        try:
            # 1. Sthana Bala (Positional strength)
            sthana_bala = self._calculate_sthana_bala(planet, position)
            
            # 2. Dig Bala (Directional strength)
            dig_bala = self._calculate_dig_bala(planet, position)
            
            # 3. Kala Bala (Temporal strength)
            kala_bala = self._calculate_kala_bala(planet, position, birth_data)
            
            # 4. Chesta Bala (Motional strength)
            chesta_bala = self._calculate_chesta_bala(planet, position, birth_data)
            
            # 5. Naisargika Bala (Natural strength)
            naisargika_bala = self._calculate_naisargika_bala(planet)
            
            # 6. Drik Bala (Aspectual strength)
            drik_bala = self._calculate_drik_bala(planet, position)
            
            # Calculate total Shadbala
            total_bala = (
                sthana_bala * 0.2 +
                dig_bala * 0.2 +
                kala_bala * 0.15 +
                chesta_bala * 0.15 +
                naisargika_bala * 0.15 +
                drik_bala * 0.15
            )
            
            return total_bala
            
        except Exception as e:
            print(f"Error calculating Shadbala: {str(e)}")
            return 0.0
    
    def _calculate_sthana_bala(self, planet: str, position: float) -> float:
        """Calculate Sthana Bala (positional strength)."""
        try:
            # Get zodiac sign of planet
            sign = int(position / 30)
            
            # Define exaltation and debilitation points
            exaltation_points = {
                'Sun': 10,      # Aries
                'Moon': 33,     # Taurus
                'Mars': 298,    # Capricorn
                'Mercury': 165, # Virgo
                'Jupiter': 95,  # Cancer
                'Venus': 357,   # Pisces
                'Saturn': 200   # Libra
            }
            
            debilitation_points = {
                'Sun': 190,     # Libra
                'Moon': 213,    # Scorpio
                'Mars': 118,    # Cancer
                'Mercury': 345, # Pisces
                'Jupiter': 275, # Capricorn
                'Venus': 177,   # Virgo
                'Saturn': 20    # Aries
            }
            
            # Calculate distance from exaltation/debilitation points
            if planet in exaltation_points:
                exalt_dist = abs(position - exaltation_points[planet])
                debil_dist = abs(position - debilitation_points[planet])
                
                # Normalize distances to 0-1 range
                exalt_strength = 1 - (min(exalt_dist, 180) / 180)
                debil_weakness = min(debil_dist, 180) / 180
                
                # Combine for final strength
                strength = (exalt_strength + debil_weakness) / 2
                return strength
                
            return 0.5  # Default for nodes or unknown planets
            
        except Exception as e:
            print(f"Error calculating Sthana Bala: {str(e)}")
            return 0.0
    
    def _calculate_dig_bala(self, planet: str, position: float) -> float:
        """Calculate Dig Bala (directional strength)."""
        try:
            # Get house position (1-12)
            house = int((position / 30) % 12) + 1
            
            # Define natural house strengths for planets
            house_strengths = {
                'Sun': {10: 1.0, 7: 0.75, 4: 0.5, 1: 0.25},
                'Moon': {4: 1.0, 1: 0.75, 10: 0.5, 7: 0.25},
                'Mars': {1: 1.0, 10: 0.75, 7: 0.5, 4: 0.25},
                'Mercury': {7: 1.0, 4: 0.75, 1: 0.5, 10: 0.25},
                'Jupiter': {1: 1.0, 10: 0.75, 7: 0.5, 4: 0.25},
                'Venus': {4: 1.0, 1: 0.75, 10: 0.5, 7: 0.25},
                'Saturn': {7: 1.0, 4: 0.75, 1: 0.5, 10: 0.25}
            }
            
            if planet in house_strengths:
                # Get strength for current house
                for key_house, strength in house_strengths[planet].items():
                    if house == key_house:
                        return strength
                return 0.5  # Default if not in key houses
                
            return 0.5  # Default for nodes or unknown planets
            
        except Exception as e:
            print(f"Error calculating Dig Bala: {str(e)}")
            return 0.0
    
    def _calculate_kala_bala(
        self,
        planet: str,
        position: float,
        birth_data: Optional[BirthData]
    ) -> float:
        """Calculate Kala Bala (temporal strength)."""
        try:
            if not birth_data:
                return 0.5
            
            # Get time of day (0-24 hours)
            hour = birth_data.date.hour + birth_data.date.minute / 60
            
            # Define day/night rulers
            day_planets = ['Sun', 'Mars', 'Jupiter']
            night_planets = ['Moon', 'Venus', 'Saturn']
            dual_planets = ['Mercury']
            
            # Check if daytime (roughly 6 AM to 6 PM)
            is_day = 6 <= hour <= 18
            
            # Calculate base strength
            if planet in day_planets:
                strength = 1.0 if is_day else 0.5
            elif planet in night_planets:
                strength = 0.5 if is_day else 1.0
            elif planet in dual_planets:
                strength = 0.75  # Mercury works well in both
            else:
                strength = 0.5  # Default for nodes or unknown planets
            
            return strength
            
        except Exception as e:
            print(f"Error calculating Kala Bala: {str(e)}")
            return 0.0
    
    def _calculate_chesta_bala(
        self,
        planet: str,
        position: float,
        birth_data: Optional[BirthData]
    ) -> float:
        """Calculate Chesta Bala (motional strength)."""
        try:
            if not birth_data:
                return 0.5
            
            # Calculate planet's speed
            speed = self._calculate_planet_speed(planet, birth_data.date)
            
            # Define average speeds for planets
            avg_speeds = {
                'Sun': 0.9833,
                'Moon': 13.176,
                'Mars': 0.524,
                'Mercury': 1.383,
                'Jupiter': 0.083,
                'Venus': 1.2,
                'Saturn': 0.033
            }
            
            if planet in avg_speeds:
                # Compare current speed to average speed
                relative_speed = abs(speed) / avg_speeds[planet]
                
                # Normalize to 0-1 range
                strength = min(relative_speed, 1.0)
                
                return strength
                
            return 0.5  # Default for nodes or unknown planets
            
        except Exception as e:
            print(f"Error calculating Chesta Bala: {str(e)}")
            return 0.0
    
    def _calculate_naisargika_bala(self, planet: str) -> float:
        """Calculate Naisargika Bala (natural strength)."""
        try:
            # Define natural strengths
            natural_strengths = {
                'Sun': 0.6,
                'Moon': 0.6,
                'Mars': 0.7,
                'Mercury': 0.8,
                'Jupiter': 1.0,
                'Venus': 0.9,
                'Saturn': 0.5
            }
            
            return natural_strengths.get(planet, 0.5)
            
        except Exception as e:
            print(f"Error calculating Naisargika Bala: {str(e)}")
            return 0.0
    
    def _calculate_drik_bala(self, planet: str, position: float) -> float:
        """Calculate Drik Bala (aspectual strength)."""
        try:
            # Define aspect angles and their strengths
            aspects = {
                0: 1.0,    # Conjunction
                60: 0.5,   # Sextile
                90: 0.25,  # Square
                120: 0.75, # Trine
                180: 0.5   # Opposition
            }
            
            # Calculate aspects from other planets
            total_strength = 0
            count = 0
            
            for other_planet, other_pos in self.positions_calculator.calculate_all_positions().items():
                if other_planet != planet:
                    # Calculate angular distance
                    angle = abs(position - other_pos) % 360
                    
                    # Find closest aspect
                    closest_aspect = min(aspects.keys(), key=lambda x: abs(x - angle))
                    
                    # If within orb (say 8 degrees)
                    if abs(closest_aspect - angle) <= 8:
                        total_strength += aspects[closest_aspect]
                        count += 1
            
            return total_strength / max(count, 1)
            
        except Exception as e:
            print(f"Error calculating Drik Bala: {str(e)}")
            return 0.0
    
    def _calculate_dignity_status(self, planet: str, position: float) -> float:
        """Calculate the dignity status of a planet."""
        # Implement dignity status calculation logic
        dignity_value = 1.0
        # Add detailed dignity calculations
        return dignity_value
    
    def _calculate_planet_speed(self, planet: str, date: datetime) -> float:
        """Calculate the speed of a planet."""
        # Implement planet speed calculation logic
        speed = 1.0
        # Add detailed speed calculations
        return speed
    
    def _calculate_house_placement_strength(self, planet: str, position: float, houses: List[int]) -> float:
        """Calculate house placement strength for a planet."""
        # Implement house placement strength calculation logic
        house_strength = 1.0
        # Add detailed house placement calculations
        return house_strength
    
    def _calculate_aspect_strength(self, planet: str, position: float, aspects: List[str], all_positions: Dict[str, float]) -> float:
        """Calculate aspect strength for a planet."""
        aspect_strengths = []
        
        # Define aspect angles and their strengths
        aspects_data = {
            0: {'orb': 8, 'strength': 1.0},
            60: {'orb': 8, 'strength': 0.5},
            90: {'orb': 7, 'strength': 0.25},
            120: {'orb': 8, 'strength': 0.75},
            180: {'orb': 8, 'strength': 0.5}
        }
        
        for aspect_type in aspects:
            if aspect_type in aspects_data:
                aspect_info = aspects_data[aspect_type]
                
                for other_planet, other_pos in all_positions.items():
                    if other_planet != planet:
                        # Calculate angular distance
                        angle = abs(position - other_pos) % 360
                        
                        # Check if aspect is within orb
                        for base_angle in self._get_aspect_angles(aspect_type):
                            if abs(angle - base_angle) <= aspect_info['orb']:
                                # Calculate strength based on exactness
                                exactness = 1 - (abs(angle - base_angle) / aspect_info['orb'])
                                strength = aspect_info['strength'] * exactness
                                aspect_strengths.append(strength)
                                break
        
        return max(aspect_strengths) if aspect_strengths else 0.0
    
    def _get_aspect_angles(self, aspect_type: str) -> List[float]:
        """Get base angles for aspect type."""
        aspect_angles = {
            'conjunction': [0, 360],
            'opposition': [180],
            'trine': [120, 240],
            'square': [90, 270],
            'sextile': [60, 300]
        }
        return aspect_angles.get(aspect_type, [])
    
    def _calculate_house_placement_strength(self, planet: str, position: float, houses: List[int]) -> float:
        """Calculate house placement strength for a planet."""
        # Implement house placement strength calculation logic
        house_strength = 1.0
        # Add detailed house placement calculations
        return house_strength
    
    def _calculate_dignity_components(self, positions: Dict[str, float]) -> float:
        """Calculate dignity components score."""
        # Implement dignity components calculation logic
        dignity_score = 1.0
        # Add detailed dignity calculations
        return dignity_score
    
    def _calculate_house_placement_components(self, positions: Dict[str, float]) -> float:
        """Calculate house placement components score."""
        # Implement house placement components calculation logic
        house_score = 1.0
        # Add detailed house placement calculations
        return house_score
    
    def _calculate_aspect_harmony(self, positions: Dict[str, float]) -> float:
        """Calculate aspect harmony score."""
        # Implement aspect harmony calculation logic
        harmony_score = 1.0
        # Add detailed aspect harmony calculations
        return harmony_score
    
    def _calculate_yoga_strength(self, positions: Dict[str, float]) -> float:
        """Calculate yoga strength score."""
        # Implement yoga strength calculation logic
        yoga_score = 1.0
        # Add detailed yoga calculations
        return yoga_score
    
    def _calculate_shadbala_components(self, positions: Dict[str, float]) -> float:
        """Calculate Shadbala components score."""
        # Implement Shadbala components calculation logic
        shadbala_score = 1.0
        # Add detailed Shadbala calculations
        return shadbala_score
    
    def _calculate_dignity_components(self, positions: Dict[str, float]) -> float:
        """Calculate dignity components score."""
        # Implement dignity components calculation logic
        dignity_score = 1.0
        # Add detailed dignity calculations
        return dignity_score
    
    def _calculate_house_placement_components(self, positions: Dict[str, float]) -> float:
        """Calculate house placement components score."""
        # Implement house placement components calculation logic
        house_score = 1.0
        # Add detailed house placement calculations
        return house_score
    
    def _calculate_elemental_harmony(self, normalized_elements: Dict[str, Dict[str, Any]]) -> float:
        """Calculate elemental harmony score."""
        harmony_scores = []
        
        # Element pairs that enhance each other
        harmonious_pairs = [
            ("fire", "air"),
            ("earth", "water"),
            ("ether", "fire"),
            ("ether", "air")
        ]
        
        # Calculate harmony between pairs
        for e1, e2 in harmonious_pairs:
            if e1 in normalized_elements and e2 in normalized_elements:
                score1 = normalized_elements[e1]["score"]
                score2 = normalized_elements[e2]["score"]
                harmony = 1 - abs(score1 - score2)
                harmony_scores.append(harmony)
        
        return np.mean(harmony_scores) if harmony_scores else 0.0
    
    def _calculate_trait_correlation(
        self,
        planets: List[str],
        trait_value: float,
        birth_data: BirthData
    ) -> float:
        """Calculate correlation between planetary positions and physical traits."""
        if not planets or trait_value == 0:
            return 0.0
        
        planet_strengths = []
        for planet in planets:
            strength = self._calculate_planet_strength(planet, birth_data)
            planet_strengths.append(strength)
        
        # Normalize trait value to 0-1 range
        normalized_trait = min(max(trait_value, 0), 1)
        
        # Calculate correlation
        correlation = np.corrcoef([normalized_trait], planet_strengths)[0, 1]
        
        return max(0.0, correlation)
    
    def _calculate_dasha_period(self, birth_data: BirthData, event_date: datetime) -> Dict[str, Any]:
        """Calculate the dasha lord and remaining duration at a given date."""
        dasha_years = {
            "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10,
            "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19,
            "Mercury": 17
        }
        
        total_years = sum(dasha_years.values())
        days_diff = (event_date - birth_data.date).days
        years_elapsed = days_diff / 365.25
        
        # Calculate current dasha
        current_position = (years_elapsed % total_years)
        accumulated_years = 0
        
        for planet, years in dasha_years.items():
            accumulated_years += years
            if current_position <= accumulated_years:
                return {
                    "lord": planet,
                    "remaining": accumulated_years - current_position
                }
        
        return {"lord": "Sun", "remaining": 0}  # Default fallback
    
    def _calculate_antardasha_period(self, birth_data: BirthData, event_date: datetime) -> Dict[str, Any]:
        """Calculate the antardasha lord at a given date."""
        dasha_period = self._calculate_dasha_period(birth_data, event_date)
        main_lord = dasha_period["lord"]
        
        # Calculate antardasha based on dasha lord
        dasha_sequence = [
            "Ketu", "Venus", "Sun", "Moon", "Mars",
            "Rahu", "Jupiter", "Saturn", "Mercury"
        ]
        
        start_idx = dasha_sequence.index(main_lord)
        days_diff = (event_date - birth_data.date).days
        antardasha_position = (days_diff % 365.25) / 365.25
        
        sub_lord_idx = (start_idx + int(antardasha_position * 9)) % 9
        
        return {
            "lord": dasha_sequence[sub_lord_idx],
            "main_lord": main_lord
        }
    
    def _calculate_dasha_event_correlation(self, dasha_lord: str, event_type: str) -> float:
        """Calculate correlation between dasha lord and event type."""
        # Event-lord correlations based on classical texts
        correlations = {
            "marriage": {
                "Venus": 1.0, "Jupiter": 0.8, "Moon": 0.7,
                "Mercury": 0.6, "Sun": 0.5, "Mars": 0.4,
                "Saturn": 0.3, "Rahu": 0.3, "Ketu": 0.2
            },
            "career": {
                "Sun": 1.0, "Jupiter": 0.9, "Saturn": 0.8,
                "Mars": 0.7, "Mercury": 0.7, "Venus": 0.5,
                "Moon": 0.4, "Rahu": 0.4, "Ketu": 0.3
            },
            "education": {
                "Jupiter": 1.0, "Mercury": 0.9, "Venus": 0.7,
                "Sun": 0.6, "Moon": 0.5, "Saturn": 0.5,
                "Mars": 0.4, "Rahu": 0.3, "Ketu": 0.2
            },
            "relocation": {
                "Rahu": 1.0, "Moon": 0.8, "Mercury": 0.7,
                "Mars": 0.6, "Jupiter": 0.5, "Venus": 0.5,
                "Saturn": 0.4, "Sun": 0.3, "Ketu": 0.3
            }
        }
        
        return correlations.get(event_type, {}).get(dasha_lord, 0.5) 