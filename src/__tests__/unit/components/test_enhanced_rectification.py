import unittest
from datetime import datetime, time
from ..agents.core.enhanced_rectification import EnhancedRectificationEngine
from ..agents.models.birth_data import BirthData


class TestEnhancedRectificationEngine(unittest.TestCase):
    def setUp(self):
        """Set up test environment."""
        self.engine = EnhancedRectificationEngine()
        self.sample_birth_data = BirthData(
            date=datetime(1990, 1, 1).date(),
            time=time(12, 0),
            latitude=40.7128,
            longitude=-74.0060
        )
        self.sample_events = [
            {
                "id": "event1",
                "type": "marriage",
                "time": datetime(2020, 6, 15, 14, 30),
                "description": "Marriage ceremony"
            },
            {
                "id": "event2",
                "type": "career",
                "time": datetime(2015, 3, 10, 9, 0),
                "description": "Job promotion"
            }
        ]
        
        # Sample planetary positions for testing
        self.sample_positions = {
            "positions": {
                "Sun": {"longitude": 280.5},
                "Moon": {"longitude": 120.3},
                "Mars": {"longitude": 45.8},
                "Mercury": {"longitude": 300.2},
                "Jupiter": {"longitude": 150.7},
                "Venus": {"longitude": 200.4},
                "Saturn": {"longitude": 90.6},
                "Rahu": {"longitude": 170.9},
                "Ketu": {"longitude": 350.9}
            },
            "houses": {
                "H1": {"longitude": 0},
                "H2": {"longitude": 30},
                "H3": {"longitude": 60},
                "H4": {"longitude": 90},
                "H5": {"longitude": 120},
                "H6": {"longitude": 150},
                "H7": {"longitude": 180},
                "H8": {"longitude": 210},
                "H9": {"longitude": 240},
                "H10": {"longitude": 270},
                "H11": {"longitude": 300},
                "H12": {"longitude": 330}
            }
        }
    
    def test_calculate_precise_time_multi_pass(self):
        """Test multi-pass birth time calculation."""
        result = self.engine.calculate_precise_time(
            self.sample_birth_data,
            self.sample_events
        )
        
        # Check result structure
        self.assertIsInstance(result, dict)
        self.assertIn("original_time", result)
        self.assertIn("rectified_time", result)
        self.assertIn("confidence", result)
        self.assertIn("adjustment_minutes", result)
        self.assertIn("detailed_metrics", result)
        
        # Verify multi-pass refinement improved confidence
        self.assertGreater(result["confidence"], 0.5)
        
        # Verify time adjustment is within limits
        self.assertGreaterEqual(result["adjustment_minutes"], -30.0)
        self.assertLessEqual(result["adjustment_minutes"], 30.0)
        
        # Verify detailed metrics structure
        detailed_metrics = result["detailed_metrics"]
        self.assertIn("tattwa_analysis", detailed_metrics)
        self.assertIn("element_balance", detailed_metrics["tattwa_analysis"])
        self.assertIn("quality_balance", detailed_metrics["tattwa_analysis"])
        self.assertIn("elemental_harmony", detailed_metrics["tattwa_analysis"])
    
    def test_advanced_tattwa_shodhana(self):
        """Test enhanced tattwa shodhana analysis."""
        result = self.engine._advanced_tattwa_shodhana(self.sample_positions)
        
        # Check basic structure
        self.assertIn("elements", result)
        self.assertIn("qualities", result)
        self.assertIn("element_balance", result)
        self.assertIn("quality_balance", result)
        self.assertIn("elemental_harmony", result)
        self.assertIn("balance_score", result)
        
        # Check element details
        for element in ["fire", "earth", "air", "water"]:
            self.assertIn(element, result["elements"])
            element_data = result["elements"][element]
            self.assertIn("score", element_data)
            self.assertIn("characteristics", element_data)
            self.assertIn("contributing_planets", element_data)
            
            # Verify score range
            self.assertGreaterEqual(element_data["score"], 0.0)
            self.assertLessEqual(element_data["score"], 1.0)
            
            # Verify characteristics
            self.assertIsInstance(element_data["characteristics"], list)
            self.assertGreater(len(element_data["characteristics"]), 0)
            
            # Verify contributing planets
            self.assertIsInstance(element_data["contributing_planets"], list)
            for planet_data in element_data["contributing_planets"]:
                self.assertIn("planet", planet_data)
                self.assertIn("strength", planet_data)
        
        # Check quality details
        for quality in ["fixed", "movable", "dual"]:
            self.assertIn(quality, result["qualities"])
            quality_data = result["qualities"][quality]
            self.assertIn("score", quality_data)
            self.assertIn("characteristics", quality_data)
            self.assertIn("contributing_planets", quality_data)
            
            # Verify score range
            self.assertGreaterEqual(quality_data["score"], 0.0)
            self.assertLessEqual(quality_data["score"], 1.0)
    
    def test_calculate_advanced_balance_score(self):
        """Test advanced balance score calculation."""
        # Test perfect balance
        perfect_values = [1.0, 1.0, 1.0, 1.0]
        perfect_score = self.engine._calculate_advanced_balance_score(perfect_values)
        self.assertGreaterEqual(perfect_score, 0.9)
        
        # Test moderate imbalance
        moderate_values = [1.0, 0.8, 0.6, 0.4]
        moderate_score = self.engine._calculate_advanced_balance_score(moderate_values)
        self.assertGreater(moderate_score, 0.4)
        self.assertLess(moderate_score, 0.8)
        
        # Test severe imbalance
        imbalanced_values = [1.0, 0.2, 0.1, 0.1]
        imbalanced_score = self.engine._calculate_advanced_balance_score(imbalanced_values)
        self.assertLess(imbalanced_score, 0.4)
        
        # Test empty list
        empty_score = self.engine._calculate_advanced_balance_score([])
        self.assertEqual(empty_score, 0.0)
    
    def test_calculate_elemental_harmony(self):
        """Test elemental harmony calculation."""
        # Create sample normalized elements
        normalized_elements = {
            "fire": {"score": 0.8},
            "air": {"score": 0.7},
            "water": {"score": 0.6},
            "earth": {"score": 0.5}
        }
        
        harmony_score = self.engine._calculate_elemental_harmony(normalized_elements)
        
        # Verify score range
        self.assertGreaterEqual(harmony_score, 0.0)
        self.assertLessEqual(harmony_score, 1.0)
        
        # Test with imbalanced elements
        imbalanced_elements = {
            "fire": {"score": 1.0},
            "air": {"score": 0.2},
            "water": {"score": 0.1},
            "earth": {"score": 0.1}
        }
        
        imbalanced_harmony = self.engine._calculate_elemental_harmony(imbalanced_elements)
        self.assertLess(imbalanced_harmony, harmony_score)
    
    def test_calculate_precise_time(self):
        """Test the main birth time calculation method."""
        result = self.engine.calculate_precise_time(
            self.sample_birth_data,
            self.sample_events
        )
        
        # Check result structure
        self.assertIsInstance(result, dict)
        self.assertIn("original_time", result)
        self.assertIn("rectified_time", result)
        self.assertIn("confidence", result)
        self.assertIn("adjustment_minutes", result)
        self.assertIn("detailed_metrics", result)
        
        # Check confidence score is within valid range
        self.assertGreaterEqual(result["confidence"], 0.0)
        self.assertLessEqual(result["confidence"], 1.0)
        
        # Check time adjustment is within limits
        self.assertGreaterEqual(result["adjustment_minutes"], -30.0)
        self.assertLessEqual(result["adjustment_minutes"], 30.0)
    
    def test_calculate_dignity(self):
        """Test planetary dignity calculation."""
        # Test Sun in exaltation (Aries 10°)
        dignity = self.engine._calculate_dignity("Sun", 10)
        self.assertGreaterEqual(dignity, 0.9)
        
        # Test Moon in debilitation (Scorpio 3°)
        dignity = self.engine._calculate_dignity("Moon", 213)
        self.assertLessEqual(dignity, 0.4)
        
        # Test Jupiter in own sign (Sagittarius)
        dignity = self.engine._calculate_dignity("Jupiter", 255)
        self.assertGreaterEqual(dignity, 0.7)
    
    def test_calculate_house_placement(self):
        """Test house placement calculation."""
        sample_houses = {
            "H1": {"longitude": 0},
            "H2": {"longitude": 30},
            "H3": {"longitude": 60},
            "H4": {"longitude": 90},
            "H5": {"longitude": 120},
            "H6": {"longitude": 150},
            "H7": {"longitude": 180},
            "H8": {"longitude": 210},
            "H9": {"longitude": 240},
            "H10": {"longitude": 270},
            "H11": {"longitude": 300},
            "H12": {"longitude": 330}
        }
        
        # Test Sun in 1st house (angular house)
        strength = self.engine._calculate_house_placement("Sun", 15, sample_houses)
        self.assertGreaterEqual(strength, 0.6)
        
        # Test Moon in 4th house (angular house and natural house)
        strength = self.engine._calculate_house_placement("Moon", 95, sample_houses)
        self.assertGreaterEqual(strength, 0.7)
    
    def test_calculate_event_correlation(self):
        """Test event correlation calculation."""
        birth_positions = {
            "Sun": {"longitude": 0},
            "Moon": {"longitude": 90},
            "Mars": {"longitude": 180}
        }
        
        event_positions = {
            "Sun": {"longitude": 0},  # Conjunction
            "Moon": {"longitude": 270},  # Square
            "Mars": {"longitude": 300}  # Trine
        }
        
        correlation = self.engine._calculate_event_correlation(
            birth_positions,
            event_positions,
            "marriage"
        )
        
        self.assertGreaterEqual(correlation, 0.0)
        self.assertLessEqual(correlation, 1.0)
    
    def test_calculate_aspect_strength(self):
        """Test aspect strength calculation."""
        positions = {
            "Sun": {"longitude": 0},
            "Moon": {"longitude": 60},  # Sextile
            "Mars": {"longitude": 90},  # Square
            "Jupiter": {"longitude": 120},  # Trine
            "Saturn": {"longitude": 180}  # Opposition
        }
        
        strength = self.engine._calculate_aspect_strength("Sun", 0, positions)
        
        self.assertGreaterEqual(strength, 0.0)
        self.assertLessEqual(strength, 1.0)


if __name__ == "__main__":
    unittest.main() 