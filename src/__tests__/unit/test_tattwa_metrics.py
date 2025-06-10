import unittest
from datetime import datetime
from typing import Dict, Any

from backend.core.rectification.analysis.metrics.tattwa_metrics import TattwaMetricsCalculator
from backend.core.rectification.analysis.confidence_calculator import ConfidenceCalculator
from backend.models.birth_data import BirthData

class TestTattwaMetrics(unittest.TestCase):
    """Test suite for enhanced Tattwa metrics calculations."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.tattwa_calculator = TattwaMetricsCalculator()
        self.confidence_calculator = ConfidenceCalculator()
        
        # Sample birth data
        self.birth_data = BirthData(
            birth_time=datetime(1990, 1, 1, 12, 0),
            latitude=0.0,
            longitude=0.0
        )
        
        # Sample element balance
        self.element_balance = {
            'fire': 0.25,
            'earth': 0.20,
            'air': 0.15,
            'water': 0.20,
            'ether': 0.20
        }
        
        # Sample planetary positions
        self.positions = {
            'Sun': 270.0,
            'Moon': 180.0,
            'Mars': 90.0,
            'Mercury': 45.0,
            'Jupiter': 315.0,
            'Venus': 135.0,
            'Saturn': 225.0
        }
        
    def test_element_distribution(self):
        """Test weighted element distribution calculation."""
        distribution = self.tattwa_calculator._calculate_element_distribution(self.element_balance)
        
        # Verify distribution is within expected range
        self.assertGreaterEqual(distribution, 0.0)
        self.assertLessEqual(distribution, 1.0)
        
        # Test with imbalanced elements
        imbalanced = {
            'fire': 0.5,
            'earth': 0.1,
            'air': 0.1,
            'water': 0.2,
            'ether': 0.1
        }
        imbalanced_score = self.tattwa_calculator._calculate_element_distribution(imbalanced)
        self.assertLess(imbalanced_score, distribution)
        
    def test_advanced_quality_balance(self):
        """Test hierarchical quality balance calculation."""
        quality_scores = self.tattwa_calculator.calculate_advanced_quality_balance(self.element_balance)
        
        # Verify structure
        self.assertIn('primary', quality_scores)
        self.assertIn('secondary', quality_scores)
        self.assertIn('tertiary', quality_scores)
        
        # Verify primary qualities
        primary = quality_scores['primary']
        self.assertIn('transformative', primary)
        self.assertIn('energetic', primary)
        self.assertIn('passionate', primary)
        
        # Verify score ranges
        for level in quality_scores.values():
            for score in level.values():
                self.assertGreaterEqual(score, 0.0)
                self.assertLessEqual(score, 1.0)
                
    def test_elemental_harmony(self):
        """Test advanced elemental harmony calculation."""
        harmony = self.tattwa_calculator.calculate_elemental_harmony(self.element_balance)
        
        # Verify harmony score range
        self.assertGreaterEqual(harmony, 0.0)
        self.assertLessEqual(harmony, 1.0)
        
        # Test with complementary elements
        complementary = {
            'fire': 0.3,
            'air': 0.3,    # Fire-Air friendship
            'earth': 0.1,
            'water': 0.1,
            'ether': 0.2
        }
        complementary_harmony = self.tattwa_calculator.calculate_elemental_harmony(complementary)
        self.assertGreater(complementary_harmony, harmony)
        
    def test_cyclic_influences(self):
        """Test cyclic influence calculations."""
        cyclic = self.tattwa_calculator._calculate_cyclic_influences(
            self.element_balance,
            self.birth_data
        )
        
        # Verify cyclic score range
        self.assertGreaterEqual(cyclic, 0.0)
        self.assertLessEqual(cyclic, 1.0)
        
        # Test different times
        morning_data = BirthData(
            birth_time=datetime(1990, 1, 1, 6, 0),
            latitude=0.0,
            longitude=0.0
        )
        morning_cyclic = self.tattwa_calculator._calculate_cyclic_influences(
            self.element_balance,
            morning_data
        )
        self.assertNotEqual(cyclic, morning_cyclic)
        
    def test_comprehensive_tattwa_evaluation(self):
        """Test comprehensive Tattwa evaluation."""
        results = self.tattwa_calculator.evaluate_tattwa_balance(
            self.element_balance,
            self.birth_data
        )
        
        # Verify result structure
        self.assertIn('base_distribution', results)
        self.assertIn('quality_scores', results)
        self.assertIn('harmony_score', results)
        self.assertIn('cyclic_influence', results)
        self.assertIn('overall_score', results)
        
        # Verify score ranges
        self.assertGreaterEqual(results['overall_score'], 0.0)
        self.assertLessEqual(results['overall_score'], 1.0)
        
    def test_confidence_integration(self):
        """Test integration with confidence calculator."""
        confidence_metrics = self.confidence_calculator.calculate_confidence(
            self.birth_data,
            self.positions,
            self.element_balance
        )
        
        # Verify confidence metrics structure
        self.assertIn('tattwa_balance', confidence_metrics)
        tattwa_metrics = confidence_metrics['tattwa_balance']
        
        # Verify component weights
        self.assertEqual(
            tattwa_metrics['weight'],
            self.confidence_calculator.confidence_weights['tattwa_balance']['base_weight']
        )
        
        # Verify component scores
        components = tattwa_metrics['components']
        self.assertIn('distribution', components)
        self.assertIn('quality', components)
        self.assertIn('harmony', components)
        self.assertIn('cyclic', components)
        
        # Verify score ranges
        self.assertGreaterEqual(tattwa_metrics['score'], 0.0)
        self.assertLessEqual(tattwa_metrics['score'], 1.0)
        
    def test_quality_aggregation(self):
        """Test quality score aggregation."""
        quality_scores = {
            'primary': {'transformative': 0.8, 'energetic': 0.7},
            'secondary': {'leadership': 0.6, 'willpower': 0.5},
            'tertiary': {'creativity': 0.4, 'enthusiasm': 0.3}
        }
        
        aggregated = self.confidence_calculator._aggregate_quality_scores(quality_scores)
        
        # Verify aggregation is weighted correctly
        self.assertGreaterEqual(aggregated, 0.0)
        self.assertLessEqual(aggregated, 1.0)
        
        # Test with empty scores
        empty_scores = {
            'primary': {},
            'secondary': {},
            'tertiary': {}
        }
        empty_aggregated = self.confidence_calculator._aggregate_quality_scores(empty_scores)
        self.assertEqual(empty_aggregated, 0.0)
        
if __name__ == '__main__':
    unittest.main() 