import unittest
from datetime import datetime
import pytz
from src.backend.agents.birth_time_rectification import BirthTimeRectifier, BirthData, RectificationResult

class TestBirthTimeRectifier(unittest.TestCase):
    def setUp(self):
        self.rectifier = BirthTimeRectifier()
        self.sample_birth_data = BirthData(
            date="1990-01-01",
            time="12:00",
            place="New York, USA"
        )
        self.sample_questionnaire_responses = {
            "events": [
                {
                    "type": "career",
                    "date": "2010-05-15",
                    "description": "Job promotion"
                }
            ]
        }

    def test_preprocess_data(self):
        """Test data preprocessing phase"""
        processed_data = self.rectifier.preprocess_data(self.sample_birth_data)
        
        # Verify geocoding
        self.assertIsNotNone(processed_data.latitude)
        self.assertIsNotNone(processed_data.longitude)
        self.assertTrue(-90 <= processed_data.latitude <= 90)
        self.assertTrue(-180 <= processed_data.longitude <= 180)
        
        # Verify timezone
        self.assertIsNotNone(processed_data.timezone)

    def test_preliminary_analysis(self):
        """Test preliminary analysis phase"""
        processed_data = self.rectifier.preprocess_data(self.sample_birth_data)
        analysis = self.rectifier.preliminary_analysis(processed_data)
        
        # Verify required components
        self.assertIn("julian_day", analysis)
        self.assertIn("planetary_positions", analysis)
        self.assertIn("divisional_charts", analysis)
        self.assertIn("kp_analysis", analysis)
        self.assertIn("sensitive_points", analysis)
        
        # Verify planetary positions
        planets = analysis["planetary_positions"]
        for planet in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]:
            self.assertIn(planet, planets)

    def test_comprehensive_analysis(self):
        """Test comprehensive analysis phase"""
        processed_data = self.rectifier.preprocess_data(self.sample_birth_data)
        preliminary_data = self.rectifier.preliminary_analysis(processed_data)
        
        result = self.rectifier.comprehensive_analysis(
            preliminary_data,
            processed_data,
            self.sample_questionnaire_responses
        )
        
        # Verify result type
        self.assertIsInstance(result, RectificationResult)
        
        # Verify confidence score
        self.assertTrue(0 <= result.confidence_score <= 1)
        
        # Verify time adjustment
        self.assertIsNotNone(result.original_time)
        self.assertIsNotNone(result.rectified_time)
        
        # Verify required analysis components
        self.assertIsNotNone(result.planetary_positions)
        self.assertIsNotNone(result.divisional_charts)
        self.assertIsNotNone(result.adjustment_factors)

    def test_evaluate_chart_fitness(self):
        """Test chart fitness evaluation"""
        processed_data = self.rectifier.preprocess_data(self.sample_birth_data)
        preliminary_data = self.rectifier.preliminary_analysis(processed_data)
        
        fitness = self.rectifier._evaluate_chart_fitness(
            preliminary_data["julian_day"],
            preliminary_data,
            self.sample_questionnaire_responses
        )
        
        # Verify fitness score
        self.assertTrue(0 <= fitness <= 1)

    def test_tattwa_shodhana(self):
        """Test Tattwa Shodhana analysis"""
        processed_data = self.rectifier.preprocess_data(self.sample_birth_data)
        preliminary_data = self.rectifier.preliminary_analysis(processed_data)
        
        score = self.rectifier._evaluate_tattwa_shodhana(
            preliminary_data["planetary_positions"]
        )
        
        # Verify Tattwa Shodhana score
        self.assertTrue(0 <= score <= 1)

    def test_dasha_correlation(self):
        """Test Dasha correlation analysis"""
        processed_data = self.rectifier.preprocess_data(self.sample_birth_data)
        preliminary_data = self.rectifier.preliminary_analysis(processed_data)
        
        score = self.rectifier._evaluate_dasha_correlation(
            preliminary_data["planetary_positions"],
            self.sample_questionnaire_responses
        )
        
        # Verify Dasha correlation score
        self.assertTrue(0 <= score <= 1)

    def test_ashtakavarga(self):
        """Test Ashtakavarga analysis"""
        processed_data = self.rectifier.preprocess_data(self.sample_birth_data)
        preliminary_data = self.rectifier.preliminary_analysis(processed_data)
        
        score = self.rectifier._evaluate_ashtakavarga(
            preliminary_data["planetary_positions"]
        )
        
        # Verify Ashtakavarga score
        self.assertTrue(0 <= score <= 1)

    def test_data_preprocessing_workflow(self):
        """Test the complete data preprocessing workflow"""
        rectifier = BirthTimeRectifier()
        birth_data = BirthData(
            date="2000-01-01",
            time="12:00",
            place="New York, USA"
        )
        
        processed_data = rectifier.preprocess_data(birth_data)
        assert processed_data.latitude is not None
        assert processed_data.longitude is not None
        assert processed_data.timezone is not None
        
    def test_preliminary_chart_generation_workflow(self):
        """Test the preliminary chart generation workflow"""
        rectifier = BirthTimeRectifier()
        birth_data = BirthData(
            date="2000-01-01",
            time="12:00",
            place="New York, USA"
        )
        
        processed_data = rectifier.preprocess_data(birth_data)
        prelim_analysis = rectifier.preliminary_analysis(processed_data)
        
        assert 'planetary_positions' in prelim_analysis
        assert 'divisional_charts' in prelim_analysis
        assert 'sensitive_points' in prelim_analysis
        
    def test_comprehensive_analysis_workflow(self):
        """Test the comprehensive analysis workflow"""
        rectifier = BirthTimeRectifier()
        birth_data = BirthData(
            date="2000-01-01",
            time="12:00",
            place="New York, USA"
        )
        
        processed_data = rectifier.preprocess_data(birth_data)
        prelim_analysis = rectifier.preliminary_analysis(processed_data)
        
        questionnaire_responses = {
            'events': [
                {
                    'type': 'career',
                    'date': '2020-01-01',
                    'description': 'Career change'
                }
            ]
        }
        
        result = rectifier.comprehensive_analysis(
            prelim_analysis,
            birth_data,
            questionnaire_responses
        )
        
        assert result.original_time == birth_data.time
        assert result.rectified_time is not None
        assert result.confidence_score >= 0 and result.confidence_score <= 1
        assert result.planetary_positions is not None
        assert result.divisional_charts is not None
        assert result.adjustment_factors is not None
        
    def test_event_correlation_workflow(self):
        """Test the event correlation workflow"""
        rectifier = BirthTimeRectifier()
        birth_data = BirthData(
            date="2000-01-01",
            time="12:00",
            place="New York, USA"
        )
        
        processed_data = rectifier.preprocess_data(birth_data)
        prelim_analysis = rectifier.preliminary_analysis(processed_data)
        
        correlation = rectifier._evaluate_event_correlation(
            prelim_analysis['planetary_positions'],
            {
                'events': [
                    {
                        'type': 'career',
                        'date': '2020-01-01',
                        'description': 'Career change'
                    }
                ]
            }
        )
        
        assert correlation >= 0 and correlation <= 1

if __name__ == '__main__':
    unittest.main() 