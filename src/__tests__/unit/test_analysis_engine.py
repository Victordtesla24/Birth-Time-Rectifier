import unittest
from src.modules.AnalysisEngine import AnalysisEngine
import pytest

class TestAnalysisEngine(unittest.TestCase):
    def setUp(self):
        self.engine = AnalysisEngine()
        self.sample_positions = {
            'Sun': {'longitude': 280.5, 'latitude': 0.0},
            'Moon': {'longitude': 120.3, 'latitude': 0.0},
            'Mars': {'longitude': 45.8, 'latitude': 0.0},
            'Mercury': {'longitude': 275.2, 'latitude': 0.0},
            'Jupiter': {'longitude': 190.7, 'latitude': 0.0},
            'Venus': {'longitude': 310.4, 'latitude': 0.0},
            'Saturn': {'longitude': 150.9, 'latitude': 0.0}
        }
        self.sample_sensitive_points = [
            {
                'id': 'appearance',
                'trait_type': 'physical appearance',
                'possible_traits': [
                    {'id': 'tall', 'description': 'Tall and lean'},
                    {'id': 'medium', 'description': 'Medium build'},
                    {'id': 'short', 'description': 'Short and sturdy'}
                ],
                'significance': 0.8
            }
        ]

    def test_generate_physical_trait_questions(self):
        """Test physical trait question generation"""
        questions = self.engine._generatePhysicalTraitQuestions(self.sample_sensitive_points)
        
        # Verify question structure
        self.assertTrue(len(questions) > 0)
        question = questions[0]
        
        # Check question properties
        self.assertEqual(question['type'], 'select')
        self.assertEqual(question['category'], 'physical')
        self.assertTrue(len(question['options']) > 0)
        self.assertTrue(0 <= question['weight'] <= 1)
        
        # Verify options structure
        option = question['options'][0]
        self.assertIn('value', option)
        self.assertIn('label', option)

    def test_generate_planetary_questions(self):
        """Test planetary question generation"""
        questions = self.engine._generatePlanetaryQuestions(self.sample_positions)
        
        # Verify questions exist for each planet
        planet_questions = [q for q in questions if q['category'] == 'life_events']
        self.assertTrue(len(planet_questions) > 0)
        
        # Check question properties
        for question in planet_questions:
            self.assertIn('type', question)
            self.assertIn('text', question)
            self.assertIn('options', question)
            self.assertTrue(0 <= question['weight'] <= 1)
            
            # Verify boolean questions have yes/no options
            if question['type'] == 'boolean':
                options = [opt['value'] for opt in question['options']]
                self.assertIn('yes', options)
                self.assertIn('no', options)
                
                # Check follow-up question structure
                if 'followUp' in question:
                    follow_up = question['followUp']
                    self.assertIn('condition', follow_up)
                    self.assertIn('question', follow_up)
                    self.assertIn('type', follow_up['question'])
                    self.assertIn('text', follow_up['question'])
                    self.assertIn('options', follow_up['question'])

    def test_generate_divisional_chart_questions(self):
        """Test divisional chart question generation"""
        sample_charts = {
            'D9': {'positions': self.sample_positions},
            'D12': {'positions': self.sample_positions}
        }
        
        questions = self.engine._generateDivisionalChartQuestions(sample_charts)
        
        # Verify questions for each divisional chart
        self.assertEqual(len(questions), len(sample_charts))
        
        for question in questions:
            self.assertEqual(question['type'], 'select')
            self.assertEqual(question['category'], 'life_events')
            self.assertTrue(len(question['options']) > 0)
            self.assertTrue(0 <= question['weight'] <= 1)

    def test_generate_dasha_questions(self):
        """Test dasha-based question generation"""
        sample_dasha_analysis = {
            'major_periods': [
                {
                    'planet': 'Jupiter',
                    'start_date': '2010-01-01',
                    'end_date': '2015-12-31',
                    'significance': 0.8
                }
            ]
        }
        
        questions = self.engine._generateDashaQuestions(sample_dasha_analysis)
        
        # Verify questions for each dasha period
        self.assertEqual(len(questions), len(sample_dasha_analysis['major_periods']))
        
        for question in questions:
            self.assertEqual(question['type'], 'multi_select')
            self.assertEqual(question['category'], 'life_events')
            self.assertTrue(len(question['options']) > 0)
            self.assertTrue(0 <= question['weight'] <= 1)
            
            # Verify standard life event options
            option_values = [opt['value'] for opt in question['options']]
            self.assertIn('career', option_values)
            self.assertIn('relationship', option_values)
            self.assertIn('education', option_values)

    def test_check_sun_moon_sign_changes(self):
        """Test Sun/Moon sign change detection"""
        changes = self.engine._checkSunMoonSignChanges(self.sample_positions)
        
        for change in changes:
            self.assertIn(change['planet'], ['Sun', 'Moon'])
            self.assertTrue(len(change['combinations']) > 0)
            
            # Verify combination structure
            combination = change['combinations'][0]
            self.assertIn('id', combination)
            self.assertIn('description', combination)

    def test_check_ascendant_changes(self):
        """Test Ascendant change detection"""
        changes = self.engine._checkAscendantChanges(self.sample_positions)
        
        if changes:
            self.assertIn('psychological', changes)
            self.assertIn('appearance', changes)
            self.assertIn('interests', changes)
            self.assertIn('values', changes)

    def test_dynamic_questionnaire_workflow(self):
        """Test the dynamic questionnaire generation workflow"""
        engine = AnalysisEngine()
        
        # Test with ascendant change
        positions = {
            'Ascendant': {'longitude': 29.5},  # Near sign boundary
            'Sun': {'longitude': 45.0},
            'Moon': {'longitude': 90.0}
        }
        
        ascendant_change = engine._calculateAscendantChange(positions)
        assert ascendant_change is not None
        assert 'current_sign' in ascendant_change
        assert 'potential_sign' in ascendant_change
        
        # Test trait generation
        traits = engine._getAscendantTraits(ascendant_change, 'psychological')
        assert traits is not None and isinstance(traits, str)
        
        # Test divisional chart questions
        chart_question = engine._getDivisionalChartQuestion('D1')
        assert chart_question is not None and isinstance(chart_question, str)
        
        options = engine._getDivisionalChartOptions('D1', {})
        assert options is not None and isinstance(options, list)
        assert len(options) > 0
        
    def test_feedback_loop_integration(self):
        """Test the feedback loop integration"""
        engine = AnalysisEngine()
        
        # Test weight calculations
        planet_weight = engine._getPlanetaryWeight('Sun')
        assert planet_weight >= 0 and planet_weight <= 1
        
        chart_weight = engine._getChartWeight('D1')
        assert chart_weight >= 0 and chart_weight <= 1
        
        # Test sign combinations
        combinations = engine._getSignCombinations(0, 1)
        assert combinations is not None and isinstance(combinations, list)
        assert len(combinations) > 0
        
    def test_analysis_results_tracking(self):
        """Test analysis results tracking"""
        engine = AnalysisEngine()
        
        # Test step tracking
        current_step = engine.getCurrentStep()
        assert isinstance(current_step, int)
        
        # Test results retrieval
        analysis_results = engine.getAnalysisResults()
        assert isinstance(analysis_results, dict)
        
        rectification_results = engine.getRectificationResults()
        assert isinstance(rectification_results, dict)

if __name__ == '__main__':
    unittest.main() 