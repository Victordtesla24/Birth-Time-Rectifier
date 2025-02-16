from typing import Dict, List, Any
from ..calculations.shadbala_calculator import ShadbalaCalculator
from ..calculations.dasha_calculator import DashaCalculator

class TattwaAnalyzer:
    """Analyzer for Tattwa (elemental) balance in a horoscope with advanced Tattwa Shodhana."""
    
    def __init__(self):
        """Initialize the Tattwa analyzer."""
        self.shadbala_calculator = ShadbalaCalculator()
        self.dasha_calculator = DashaCalculator()
        
        # Enhanced Tattwa elements with advanced mappings
        self.tattwa_elements = {
            'fire': ['Sun', 'Mars', 'Ketu'],
            'earth': ['Mercury', 'Venus', 'Rahu'],
            'air': ['Saturn', 'Venus'],
            'water': ['Moon', 'Venus'],
            'ether': ['Jupiter']
        }
        
        # Advanced element qualities with detailed attributes and physical characteristics
        self.element_qualities = {
            'fire': {
                'attributes': ['transformative', 'energetic', 'passionate', 'leadership', 'willpower'],
                'physical': ['tall', 'athletic', 'sharp features', 'bright eyes', 'reddish complexion']
            },
            'earth': {
                'attributes': ['stable', 'practical', 'reliable', 'endurance', 'manifestation'],
                'physical': ['medium height', 'well-built', 'square face', 'steady gaze', 'earthy complexion']
            },
            'air': {
                'attributes': ['intellectual', 'communicative', 'adaptable', 'analytical', 'social'],
                'physical': ['tall and thin', 'oval face', 'quick movements', 'light complexion']
            },
            'water': {
                'attributes': ['emotional', 'intuitive', 'nurturing', 'receptive', 'healing'],
                'physical': ['medium height', 'soft features', 'round face', 'pale complexion']
            },
            'ether': {
                'attributes': ['spiritual', 'expansive', 'philosophical', 'universal', 'transcendent'],
                'physical': ['well-proportioned', 'magnetic presence', 'glowing complexion']
            }
        }
        
        # Advanced Tattwa relationships
        self.tattwa_relationships = {
            'fire': {'friend': ['air', 'ether'], 'enemy': ['water'], 'neutral': ['earth']},
            'earth': {'friend': ['water', 'fire'], 'enemy': ['air'], 'neutral': ['ether']},
            'air': {'friend': ['fire', 'earth'], 'enemy': ['ether'], 'neutral': ['water']},
            'water': {'friend': ['earth', 'ether'], 'enemy': ['fire'], 'neutral': ['air']},
            'ether': {'friend': ['water', 'air'], 'enemy': ['earth'], 'neutral': ['fire']}
        }
        
    def calculate_balance(self, positions: Dict[str, float], birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate elemental balance using advanced Tattwa Shodhana theory with physical correlation."""
        element_scores = {element: 0.0 for element in self.tattwa_elements.keys()}
        
        # Calculate base element scores with enhanced precision
        for planet, longitude in positions.items():
            for element, planets in self.tattwa_elements.items():
                if planet in planets:
                    base_strength = self._calculate_planet_strength(planet, longitude)
                    dasha_influence = self._calculate_dasha_influence(planet, birth_data)
                    element_scores[element] += base_strength * dasha_influence
        
        # Apply advanced Tattwa relationship modifications
        element_scores = self._apply_tattwa_relationships(element_scores)
        
        # Calculate physical appearance correlation
        physical_correlation = self._calculate_physical_correlation(element_scores, birth_data)
        
        return {
            'element_scores': element_scores,
            'physical_correlation': physical_correlation,
            'dasha_verification': self._verify_through_dashas(positions, birth_data)
        }
    
    def _apply_tattwa_relationships(self, scores: Dict[str, float]) -> Dict[str, float]:
        """Apply inter-element relationships based on Tattwa Shodhana."""
        modified_scores = scores.copy()
        
        for element, relationships in self.tattwa_relationships.items():
            base_score = scores[element]
            
            # Enhance by friendly elements
            for friend in relationships['friend']:
                modified_scores[element] += scores[friend] * 0.2
            
            # Reduce by enemy elements
            for enemy in relationships['enemy']:
                modified_scores[element] -= scores[enemy] * 0.15
            
            # Slight influence from neutral elements
            for neutral in relationships['neutral']:
                modified_scores[element] += scores[neutral] * 0.05
        
        return modified_scores
    
    def _calculate_dasha_influence(self, planet: str, birth_data: Dict[str, Any]) -> float:
        """Calculate planetary influence based on current dasha period."""
        dasha_details = self.dasha_calculator.calculate_current_dasha(birth_data)
        return self._evaluate_dasha_strength(planet, dasha_details)
    
    def _calculate_physical_correlation(self, element_scores: Dict[str, float], birth_data: Dict[str, Any]) -> Dict[str, float]:
        """Calculate correlation between elemental balance and physical appearance."""
        physical_traits = birth_data.get('physical_traits', {})
        correlation_scores = {}
        
        for element, qualities in self.element_qualities.items():
            physical_match = self._match_physical_traits(qualities['physical'], physical_traits)
            correlation_scores[element] = physical_match * element_scores[element]
            
        return correlation_scores
    
    def _verify_through_dashas(self, positions: Dict[str, float], birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Verify birth time through dasha analysis."""
        dasha_periods = self.dasha_calculator.calculate_dasha_periods(birth_data)
        return self._analyze_dasha_events(dasha_periods, positions)
    
    def _calculate_planet_strength(self, planet: str, longitude: float) -> float:
        """Calculate planetary strength considering multiple factors."""
        strength = 1.0
        
        # Calculate various strength components
        shadbala = self.shadbala_calculator.calculate_shadbala(planet, longitude)
        dignity = self.shadbala_calculator.calculate_dignity(planet, longitude)
        house_placement = self.shadbala_calculator.calculate_house_placement(planet, longitude)
        aspects = self.shadbala_calculator.calculate_aspects(planet, longitude)
        
        # Combine all factors
        strength = (shadbala + dignity + house_placement + aspects) / 4.0
        
        return strength
        
    def calculate_element_distribution(self, element_balance: Dict[str, float]) -> Dict[str, float]:
        """Calculate detailed element distribution metrics."""
        ideal_balance = 0.2  # Each element should be around 20%
        distribution_scores = {}
        
        for element, score in element_balance.items():
            deviation = abs(score - ideal_balance)
            distribution_scores[element] = 1.0 - (deviation / ideal_balance)
            
        return distribution_scores
    
    def calculate_quality_balance(self, element_balance: Dict[str, float]) -> Dict[str, float]:
        """Calculate balance of elemental qualities."""
        quality_scores = {}
        
        for element, score in element_balance.items():
            qualities = self.element_qualities[element]['attributes']
            for quality in qualities:
                if quality not in quality_scores:
                    quality_scores[quality] = 0.0
                quality_scores[quality] += score / len(qualities)
                
        return quality_scores 