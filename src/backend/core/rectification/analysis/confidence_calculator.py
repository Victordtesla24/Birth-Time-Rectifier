from typing import Dict, Any, List
from ...models.birth_data import BirthData
from .metrics import (
    TattwaMetricsCalculator,
    EventMetricsCalculator,
    PlanetaryMetricsCalculator,
    ChartHarmonyCalculator,
    PhysicalCorrelationCalculator,
    DashaVerificationCalculator
)

class ConfidenceCalculator:
    """Advanced calculator for birth time rectification confidence metrics with enhanced granularity."""
    
    def __init__(self):
        """Initialize the advanced confidence calculator."""
        self.tattwa_metrics = TattwaMetricsCalculator()
        self.event_metrics = EventMetricsCalculator()
        self.planetary_metrics = PlanetaryMetricsCalculator()
        self.harmony_metrics = ChartHarmonyCalculator()
        self.physical_metrics = PhysicalCorrelationCalculator()
        self.dasha_metrics = DashaVerificationCalculator()
        
        # Enhanced confidence weights with granular components
        self.confidence_weights = {
            'tattwa_balance': {
                'base_weight': 0.25,
                'components': {
                    'distribution': 0.25,
                    'quality': 0.20,
                    'harmony': 0.20,
                    'cyclic': 0.15,
                    'physical_correlation': 0.20
                }
            },
            'event_correlations': {
                'base_weight': 0.25,
                'components': {
                    'timing': 0.30,
                    'strength': 0.25,
                    'aspect': 0.25,
                    'dasha_alignment': 0.20
                }
            },
            'planetary_strength': {
                'base_weight': 0.20,
                'components': {
                    'shadbala': 0.30,
                    'dignity': 0.25,
                    'aspects': 0.25,
                    'dasha_strength': 0.20
                }
            },
            'chart_harmony': {
                'base_weight': 0.15,
                'components': {
                    'house_strength': 0.30,
                    'aspect_harmony': 0.25,
                    'planet_placement': 0.25,
                    'dasha_harmony': 0.20
                }
            },
            'physical_appearance': {
                'base_weight': 0.15,
                'components': {
                    'element_correlation': 0.35,
                    'planetary_signification': 0.35,
                    'dasha_influence': 0.30
                }
            }
        }
        
    def calculate_confidence(
        self,
        birth_data: BirthData,
        positions: Dict[str, float],
        element_balance: Dict[str, float],
        events: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Calculate confidence with enhanced granularity and physical correlation."""
        
        # Calculate base metrics with enhanced precision
        tattwa_results = self.tattwa_metrics.calculate_metrics(positions, element_balance, birth_data)
        event_results = self.event_metrics.calculate_metrics(positions, events, birth_data) if events else {}
        planetary_results = self.planetary_metrics.calculate_metrics(positions, birth_data)
        harmony_results = self.harmony_metrics.calculate_metrics(positions, birth_data)
        physical_results = self.physical_metrics.calculate_metrics(positions, birth_data)
        dasha_results = self.dasha_metrics.calculate_metrics(positions, birth_data, events)
        
        # Calculate weighted scores with enhanced components
        confidence_metrics = {
            'tattwa_balance': {
                'score': self._calculate_weighted_tattwa_score(tattwa_results),
                'components': tattwa_results,
                'physical_correlation': physical_results.get('tattwa_correlation', {})
            },
            'event_correlations': {
                'score': self._calculate_weighted_event_score(event_results),
                'components': event_results,
                'dasha_verification': dasha_results.get('event_verification', {})
            },
            'planetary_strength': {
                'score': self._calculate_weighted_planetary_score(planetary_results),
                'components': planetary_results,
                'dasha_strength': dasha_results.get('planetary_strength', {})
            },
            'chart_harmony': {
                'score': self._calculate_weighted_harmony_score(harmony_results),
                'components': harmony_results,
                'dasha_harmony': dasha_results.get('chart_harmony', {})
            },
            'physical_appearance': {
                'score': self._calculate_weighted_physical_score(physical_results),
                'components': physical_results
            }
        }
        
        # Calculate overall confidence with enhanced precision
        confidence_metrics['overall_confidence'] = self._calculate_overall_confidence(confidence_metrics)
        confidence_metrics['confidence_level'] = self._determine_confidence_level(confidence_metrics['overall_confidence'])
        
        return confidence_metrics
        
    def _calculate_weighted_tattwa_score(self, tattwa_results: Dict[str, Any]) -> float:
        """Calculate weighted Tattwa score from component results."""
        weights = self.confidence_weights['tattwa_balance']['components']
        return (
            tattwa_results['base_distribution'] * weights['distribution'] +
            self._aggregate_quality_scores(tattwa_results['quality_scores']) * weights['quality'] +
            tattwa_results['harmony_score'] * weights['harmony'] +
            tattwa_results['cyclic_influence'] * weights['cyclic']
        )
        
    def _aggregate_quality_scores(self, quality_scores: Dict[str, Dict[str, float]]) -> float:
        """Aggregate hierarchical quality scores into a single value."""
        level_weights = {'primary': 0.5, 'secondary': 0.3, 'tertiary': 0.2}
        total_score = 0.0
        
        for level, scores in quality_scores.items():
            level_score = sum(scores.values()) / len(scores) if scores else 0
            total_score += level_score * level_weights[level]
            
        return total_score
        
    def _calculate_weighted_event_score(self, event_results: Dict[str, Any]) -> float:
        """Calculate weighted event correlation score."""
        weights = self.confidence_weights['event_correlations']['components']
        return (
            event_results['timing_accuracy'] * weights['timing'] +
            event_results['correlation_strength'] * weights['strength'] +
            event_results['aspect_relevance'] * weights['aspect']
        )
        
    def _calculate_weighted_planetary_score(self, planetary_results: Dict[str, Any]) -> float:
        """Calculate weighted planetary strength score."""
        weights = self.confidence_weights['planetary_strength']['components']
        return (
            planetary_results['shadbala_score'] * weights['shadbala'] +
            planetary_results['dignity_score'] * weights['dignity'] +
            planetary_results['aspect_score'] * weights['aspects']
        )
        
    def _calculate_weighted_harmony_score(self, harmony_results: Dict[str, Any]) -> float:
        """Calculate weighted chart harmony score."""
        weights = self.confidence_weights['chart_harmony']['components']
        return (
            harmony_results['house_strength'] * weights['house_strength'] +
            harmony_results['aspect_harmony'] * weights['aspect_harmony'] +
            harmony_results['yoga_strength'] * weights['yogas']
        )
        
    def _calculate_weighted_physical_score(self, physical_results: Dict[str, Any]) -> float:
        """Calculate weighted score for physical appearance correlation."""
        weights = self.confidence_weights['physical_appearance']['components']
        score = 0.0
        
        for component, weight in weights.items():
            if component in physical_results:
                score += physical_results[component] * weight
                
        return score
        
    def _calculate_overall_confidence(self, metrics: Dict[str, Any]) -> float:
        """Calculate overall confidence score from all components."""
        total_score = 0.0
        total_weight = 0.0
        
        for category, data in metrics.items():
            if category != 'overall_confidence':
                total_score += data['score'] * data['weight']
                total_weight += data['weight']
                
        return total_score / total_weight if total_weight > 0 else 0.0
        
    def _determine_confidence_level(self, overall_confidence: float) -> str:
        """Determine confidence level with enhanced granularity."""
        if overall_confidence >= 0.95:
            return "Very High"
        elif overall_confidence >= 0.85:
            return "High"
        elif overall_confidence >= 0.75:
            return "Moderate High"
        elif overall_confidence >= 0.65:
            return "Moderate"
        elif overall_confidence >= 0.55:
            return "Moderate Low"
        elif overall_confidence >= 0.45:
            return "Low"
        else:
            return "Very Low" 