from typing import Dict, Any
from ....models.birth_data import BirthData

class PhysicalCorrelationCalculator:
    """Calculator for physical appearance correlation with planetary positions."""
    
    def __init__(self):
        """Initialize the physical correlation calculator."""
        self.physical_significations = {
            'Sun': {
                'traits': ['strong build', 'medium height', 'round head', 'golden/reddish complexion'],
                'weight': 0.3
            },
            'Moon': {
                'traits': ['fair complexion', 'round face', 'attractive eyes', 'medium height'],
                'weight': 0.25
            },
            'Mars': {
                'traits': ['muscular build', 'reddish complexion', 'sharp features', 'medium height'],
                'weight': 0.2
            },
            'Mercury': {
                'traits': ['slim build', 'sharp features', 'alert eyes', 'medium height'],
                'weight': 0.15
            },
            'Jupiter': {
                'traits': ['well-built', 'tall', 'large eyes', 'fair complexion'],
                'weight': 0.3
            },
            'Venus': {
                'traits': ['well-proportioned', 'attractive features', 'charming eyes', 'medium height'],
                'weight': 0.25
            },
            'Saturn': {
                'traits': ['thin build', 'tall', 'dark complexion', 'long face'],
                'weight': 0.2
            }
        }
        
        self.element_physical_traits = {
            'fire': ['sharp features', 'bright eyes', 'reddish complexion', 'athletic build'],
            'earth': ['well-built', 'square face', 'steady gaze', 'earthy complexion'],
            'air': ['tall and thin', 'oval face', 'quick movements', 'light complexion'],
            'water': ['soft features', 'round face', 'pale complexion', 'medium height'],
            'ether': ['well-proportioned', 'magnetic presence', 'glowing complexion']
        }
    
    def calculate_metrics(self, positions: Dict[str, float], birth_data: BirthData) -> Dict[str, Any]:
        """Calculate physical appearance correlation metrics."""
        physical_traits = birth_data.get('physical_traits', {})
        
        metrics = {
            'element_correlation': self._calculate_element_correlation(physical_traits),
            'planetary_signification': self._calculate_planetary_correlation(positions, physical_traits),
            'dasha_influence': self._calculate_dasha_influence(birth_data, physical_traits)
        }
        
        # Calculate tattwa correlation for enhanced confidence calculation
        metrics['tattwa_correlation'] = self._calculate_tattwa_correlation(metrics)
        
        return metrics
    
    def _calculate_element_correlation(self, physical_traits: Dict[str, Any]) -> float:
        """Calculate correlation with elemental physical traits."""
        correlation_score = 0.0
        total_matches = 0
        
        for element, traits in self.element_physical_traits.items():
            element_score = 0
            for trait in traits:
                if trait.lower() in [t.lower() for t in physical_traits.get('description', [])]:
                    element_score += 1
            correlation_score += element_score / len(traits)
            total_matches += 1
            
        return correlation_score / total_matches if total_matches > 0 else 0.0
    
    def _calculate_planetary_correlation(self, positions: Dict[str, float], physical_traits: Dict[str, Any]) -> float:
        """Calculate correlation with planetary significations."""
        correlation_score = 0.0
        total_weight = 0.0
        
        for planet, details in self.physical_significations.items():
            if planet in positions:
                match_score = 0
                for trait in details['traits']:
                    if trait.lower() in [t.lower() for t in physical_traits.get('description', [])]:
                        match_score += 1
                correlation_score += (match_score / len(details['traits'])) * details['weight']
                total_weight += details['weight']
                
        return correlation_score / total_weight if total_weight > 0 else 0.0
    
    def _calculate_dasha_influence(self, birth_data: BirthData, physical_traits: Dict[str, Any]) -> float:
        """Calculate correlation with current dasha lord's significations."""
        # Implementation depends on dasha calculation module
        # For now, return a placeholder value
        return 0.75
    
    def _calculate_tattwa_correlation(self, metrics: Dict[str, Any]) -> Dict[str, float]:
        """Calculate overall tattwa correlation for confidence calculation."""
        return {
            'element': metrics['element_correlation'],
            'planetary': metrics['planetary_signification'],
            'dasha': metrics['dasha_influence']
        } 