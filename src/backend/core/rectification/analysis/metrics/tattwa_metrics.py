from typing import Dict, Any, List, Tuple
from ....models.birth_data import BirthData
from datetime import datetime

class TattwaMetricsCalculator:
    """Advanced Calculator for Tattwa (elemental) balance metrics implementing Tattwa Shodhana Theory."""
    
    def __init__(self):
        """Initialize the advanced Tattwa metrics calculator."""
        self.element_weights = {
            'fire': 1.2,  # Higher weight for transformative element
            'earth': 1.0,
            'air': 1.1,   # Slightly higher for intellectual element
            'water': 1.0,
            'ether': 1.3  # Highest weight for spiritual element
        }
        
        self.tattwa_relationships = {
            'fire': {'friend': ['air', 'ether'], 'enemy': ['water'], 'neutral': ['earth']},
            'earth': {'friend': ['water', 'fire'], 'enemy': ['air'], 'neutral': ['ether']},
            'air': {'friend': ['fire', 'earth'], 'enemy': ['ether'], 'neutral': ['water']},
            'water': {'friend': ['earth', 'ether'], 'enemy': ['fire'], 'neutral': ['air']},
            'ether': {'friend': ['water', 'air'], 'enemy': ['earth'], 'neutral': ['fire']}
        }
        
        self.advanced_qualities = {
            'fire': {
                'primary': ['transformative', 'energetic', 'passionate'],
                'secondary': ['leadership', 'willpower', 'inspiration'],
                'tertiary': ['creativity', 'enthusiasm', 'courage']
            },
            'earth': {
                'primary': ['stable', 'practical', 'reliable'],
                'secondary': ['endurance', 'manifestation', 'grounding'],
                'tertiary': ['discipline', 'patience', 'structure']
            },
            'air': {
                'primary': ['intellectual', 'communicative', 'adaptable'],
                'secondary': ['analytical', 'social', 'versatile'],
                'tertiary': ['innovation', 'connection', 'freedom']
            },
            'water': {
                'primary': ['emotional', 'intuitive', 'nurturing'],
                'secondary': ['receptive', 'healing', 'flowing'],
                'tertiary': ['empathy', 'sensitivity', 'depth']
            },
            'ether': {
                'primary': ['spiritual', 'expansive', 'philosophical'],
                'secondary': ['universal', 'transcendent', 'wisdom'],
                'tertiary': ['consciousness', 'unity', 'infinity']
            }
        }
        
    def evaluate_tattwa_balance(self, element_balance: Dict[str, float], birth_data: BirthData) -> Dict[str, Any]:
        """Evaluate comprehensive Tattwa balance with advanced metrics."""
        base_distribution = self._calculate_element_distribution(element_balance)
        quality_scores = self.calculate_advanced_quality_balance(element_balance)
        harmony_score = self.calculate_elemental_harmony(element_balance)
        cyclic_influence = self._calculate_cyclic_influences(element_balance, birth_data)
        
        return {
            'base_distribution': base_distribution,
            'quality_scores': quality_scores,
            'harmony_score': harmony_score,
            'cyclic_influence': cyclic_influence,
            'overall_score': self._calculate_overall_score(
                base_distribution,
                harmony_score,
                cyclic_influence
            )
        }
        
    def _calculate_element_distribution(self, element_balance: Dict[str, float]) -> float:
        """Calculate weighted element distribution metrics."""
        ideal_balance = 0.2  # Each element should be around 20%
        total_weighted_deviation = 0.0
        
        for element, score in element_balance.items():
            weight = self.element_weights[element]
            deviation = abs(score - ideal_balance) * weight
            total_weighted_deviation += deviation
            
        return 1.0 - (total_weighted_deviation / sum(self.element_weights.values()))
        
    def calculate_advanced_quality_balance(self, element_balance: Dict[str, float]) -> Dict[str, Dict[str, float]]:
        """Calculate detailed quality balance metrics with hierarchical qualities."""
        quality_scores = {
            'primary': {},
            'secondary': {},
            'tertiary': {}
        }
        
        for element, score in element_balance.items():
            element_qualities = self.advanced_qualities[element]
            for level, qualities in element_qualities.items():
                level_weight = 1.0 if level == 'primary' else 0.8 if level == 'secondary' else 0.6
                for quality in qualities:
                    if quality not in quality_scores[level]:
                        quality_scores[level][quality] = 0.0
                    quality_scores[level][quality] += score * level_weight
                    
        return quality_scores
        
    def calculate_elemental_harmony(self, element_balance: Dict[str, float]) -> float:
        """Calculate advanced elemental harmony score considering relationships."""
        harmony_score = 0.0
        
        for element, score in element_balance.items():
            relationships = self.tattwa_relationships[element]
            
            # Calculate harmony with friendly elements
            for friend in relationships['friend']:
                friend_score = element_balance[friend]
                harmony_score += (score * friend_score * 1.2)  # 20% bonus for friendly relationships
                
            # Calculate disharmony with enemy elements
            for enemy in relationships['enemy']:
                enemy_score = element_balance[enemy]
                harmony_score -= (score * enemy_score * 0.8)  # 20% reduction for enemy relationships
                
            # Add neutral contributions
            for neutral in relationships['neutral']:
                neutral_score = element_balance[neutral]
                harmony_score += (score * neutral_score)
                
        return max(0.0, min(1.0, harmony_score / len(element_balance)))
        
    def _calculate_cyclic_influences(self, element_balance: Dict[str, float], birth_data: BirthData) -> float:
        """Calculate cyclic influences based on time and date."""
        hour = birth_data.birth_time.hour
        month = birth_data.birth_time.month
        
        # Daily cycle influences (based on hora)
        daily_element = self._get_hora_element(hour)
        daily_influence = element_balance.get(daily_element, 0) * 1.2
        
        # Monthly cycle influences (based on solar month)
        monthly_element = self._get_monthly_element(month)
        monthly_influence = element_balance.get(monthly_element, 0) * 1.1
        
        return (daily_influence + monthly_influence) / 2.3  # Normalize to 0-1 range
        
    def _get_hora_element(self, hour: int) -> str:
        """Get the dominant element for a given hora (hour)."""
        hora_elements = {
            0: 'fire', 1: 'earth', 2: 'air', 3: 'water', 4: 'ether',
            5: 'fire', 6: 'earth', 7: 'air', 8: 'water', 9: 'ether',
            10: 'fire', 11: 'earth', 12: 'air', 13: 'water', 14: 'ether',
            15: 'fire', 16: 'earth', 17: 'air', 18: 'water', 19: 'ether',
            20: 'fire', 21: 'earth', 22: 'air', 23: 'water'
        }
        return hora_elements[hour]
        
    def _get_monthly_element(self, month: int) -> str:
        """Get the dominant element for a given solar month."""
        month_elements = {
            1: 'earth',   # Capricorn
            2: 'air',     # Aquarius
            3: 'water',   # Pisces
            4: 'fire',    # Aries
            5: 'earth',   # Taurus
            6: 'air',     # Gemini
            7: 'water',   # Cancer
            8: 'fire',    # Leo
            9: 'earth',   # Virgo
            10: 'air',    # Libra
            11: 'water',  # Scorpio
            12: 'fire'    # Sagittarius
        }
        return month_elements[month]
        
    def _calculate_overall_score(self, distribution: float, harmony: float, cyclic: float) -> float:
        """Calculate the overall Tattwa balance score."""
        weights = {
            'distribution': 0.4,
            'harmony': 0.4,
            'cyclic': 0.2
        }
        
        return (
            distribution * weights['distribution'] +
            harmony * weights['harmony'] +
            cyclic * weights['cyclic']
        ) 