from typing import Dict, Any, List
import numpy as np

class AnalysisEngine:
    def __init__(self):
        self.currentStep = 0
        self.analysisResults = {}
        self.rectificationResults = {}

    def _generatePhysicalTraitQuestions(self, sensitive_points: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate questions about physical traits"""
        return [{
            'id': f"physical_{point['id']}",
            'type': 'select',
            'category': 'physical',
            'text': f"Select your {point['trait_type']}:",
            'options': [{
                'value': trait['id'],
                'label': trait['description']
            } for trait in point['possible_traits']],
            'weight': point['significance']
        } for point in sensitive_points]

    def _generatePlanetaryQuestions(self, positions: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate questions based on planetary positions"""
        questions = []
        
        # Check for zodiac sign changes
        sunMoonChanges = self._checkSunMoonSignChanges(positions)
        if len(sunMoonChanges) > 0:
            for change in sunMoonChanges:
                questions.append({
                    'id': f"sign_change_{change['planet']}",
                    'type': 'select',
                    'category': 'personality',
                    'text': 'Select the description that best matches your nature:',
                    'options': [{'value': combo['id'], 'label': combo['description']} 
                              for combo in change['combinations']],
                    'weight': 1.0
                })

        # Check Ascendant changes
        ascendantChanges = self._checkAscendantChanges(positions)
        if ascendantChanges:
            questions.append({
                'id': 'ascendant_traits',
                'type': 'multi_select',
                'category': 'personality',
                'text': 'Select all traits that match your personality:',
                'options': [
                    {'value': 'psychological', 'label': ascendantChanges['psychological']},
                    {'value': 'appearance', 'label': ascendantChanges['appearance']},
                    {'value': 'interests', 'label': ascendantChanges['interests']},
                    {'value': 'values', 'label': ascendantChanges['values']}
                ],
                'weight': 1.0
            })

        # Generate event-based questions
        for planet, position in positions.items():
            questions.append({
                'id': f"planetary_{planet}",
                'type': 'boolean',
                'category': 'life_events',
                'text': self._getPlanetaryQuestionText(planet, position),
                'options': [
                    {'value': 'yes', 'label': 'Yes'},
                    {'value': 'no', 'label': 'No'}
                ],
                'followUp': {
                    'condition': 'yes',
                    'question': {
                        'type': 'select',
                        'text': 'When did this occur?',
                        'options': self._generateTimeframeOptions()
                    }
                },
                'weight': self._getPlanetaryWeight(planet)
            })

        return questions

    def _generateDivisionalChartQuestions(self, charts: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate questions based on divisional charts"""
        return [{
            'id': f"divisional_{chart}",
            'type': 'select',
            'category': 'life_events',
            'text': self._getDivisionalChartQuestion(chart),
            'options': self._getDivisionalChartOptions(chart, data),
            'weight': self._getChartWeight(chart)
        } for chart, data in charts.items()]

    def _generateDashaQuestions(self, dasha_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate questions based on dasha periods"""
        return [{
            'id': f"dasha_{period['planet']}",
            'type': 'multi_select',
            'category': 'life_events',
            'text': f"During {period['planet']}'s period ({period['start_date']} to {period['end_date']}), which events occurred?",
            'options': [
                {'value': 'career', 'label': 'Career Changes'},
                {'value': 'relationship', 'label': 'Relationship Events'},
                {'value': 'education', 'label': 'Educational Milestones'},
                {'value': 'health', 'label': 'Health Issues'},
                {'value': 'residence', 'label': 'Residence Changes'},
                {'value': 'spiritual', 'label': 'Spiritual Events'}
            ],
            'weight': period['significance']
        } for period in dasha_analysis['major_periods']]

    def _checkSunMoonSignChanges(self, positions: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check for Sun/Moon sign changes"""
        changes = []
        for planet in ['Sun', 'Moon']:
            signChange = self._calculateSignChange(positions[planet])
            if signChange:
                changes.append({
                    'planet': planet,
                    'combinations': self._getSignCombinations(signChange['from'], signChange['to'])
                })
        return changes

    def _checkAscendantChanges(self, positions: Dict[str, Any]) -> Dict[str, str]:
        """Check for Ascendant changes"""
        ascendantChange = self._calculateAscendantChange(positions)
        if not ascendantChange:
            return {}
        
        return {
            'psychological': self._getAscendantTraits(ascendantChange, 'psychological'),
            'appearance': self._getAscendantTraits(ascendantChange, 'appearance'),
            'interests': self._getAscendantTraits(ascendantChange, 'interests'),
            'values': self._getAscendantTraits(ascendantChange, 'values')
        }

    def _getPlanetaryQuestionText(self, planet: str, position: Dict[str, Any]) -> str:
        """Get question text for a planet"""
        templates = {
            'Sun': 'Did you experience significant recognition or authority changes?',
            'Moon': 'Were there notable emotional or domestic changes?',
            'Mars': 'Did you face any significant challenges or conflicts?',
            'Mercury': 'Were there important communications or educational developments?',
            'Jupiter': 'Did you experience expansion in knowledge or opportunities?',
            'Venus': 'Were there significant relationships or artistic developments?',
            'Saturn': 'Did you face major responsibilities or restrictions?',
            'Rahu': 'Were there unexpected changes or new directions?',
            'Ketu': 'Did you experience spiritual or transformative events?'
        }
        return templates.get(planet, 'Did you experience significant changes?')

    def _generateTimeframeOptions(self) -> List[Dict[str, str]]:
        """Generate timeframe options"""
        return [
            {'value': 'childhood', 'label': 'During childhood (0-12 years)'},
            {'value': 'teenage', 'label': 'During teenage years (13-19)'},
            {'value': 'early_adult', 'label': 'Early adulthood (20-28)'},
            {'value': 'adult', 'label': 'Adulthood (29-45)'},
            {'value': 'middle_age', 'label': 'Middle age (46-60)'},
            {'value': 'senior', 'label': 'Senior years (60+)'}
        ]

    def _getPlanetaryWeight(self, planet: str) -> float:
        """Get weight for a planet"""
        weights = {
            'Sun': 0.9,
            'Moon': 0.9,
            'Mars': 0.7,
            'Mercury': 0.6,
            'Jupiter': 0.8,
            'Venus': 0.7,
            'Saturn': 0.8,
            'Rahu': 0.6,
            'Ketu': 0.6
        }
        return weights.get(planet, 0.5)

    def getCurrentStep(self) -> int:
        """Get current step"""
        return self.currentStep

    def getAnalysisResults(self) -> Dict[str, Any]:
        """Get analysis results"""
        return self.analysisResults

    def getRectificationResults(self) -> Dict[str, Any]:
        """Get rectification results"""
        return self.rectificationResults

    def _calculateSignChange(self, position: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate sign change for a planet"""
        longitude = position['longitude']
        sign = int(longitude / 30)
        remainder = longitude % 30
        
        if remainder < 2:  # Within 2 degrees of sign boundary
            return {
                'from': sign,
                'to': (sign + 1) % 12
            }
        elif remainder > 28:  # Within 2 degrees of next sign
            return {
                'from': sign,
                'to': (sign + 1) % 12
            }
        return {}

    def _calculateAscendantChange(self, positions: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate ascendant change"""
        # Check if ascendant is near a sign boundary
        if 'Ascendant' in positions:
            longitude = positions['Ascendant']['longitude']
            sign = int(longitude / 30)
            remainder = longitude % 30
            
            if remainder < 2 or remainder > 28:
                return {
                    'current_sign': sign,
                    'potential_sign': (sign + 1) % 12
                }
        return {}

    def _getSignCombinations(self, from_sign: int, to_sign: int) -> List[Dict[str, str]]:
        """Get possible trait combinations for sign changes"""
        sign_traits = {
            0: {'nature': 'fiery', 'traits': 'dynamic and assertive'},
            1: {'nature': 'earthy', 'traits': 'practical and stable'},
            2: {'nature': 'airy', 'traits': 'intellectual and social'},
            3: {'nature': 'watery', 'traits': 'emotional and intuitive'},
            4: {'nature': 'fiery', 'traits': 'creative and confident'},
            5: {'nature': 'earthy', 'traits': 'analytical and detail-oriented'},
            6: {'nature': 'airy', 'traits': 'harmonious and diplomatic'},
            7: {'nature': 'watery', 'traits': 'intense and transformative'},
            8: {'nature': 'fiery', 'traits': 'philosophical and adventurous'},
            9: {'nature': 'earthy', 'traits': 'ambitious and disciplined'},
            10: {'nature': 'airy', 'traits': 'innovative and humanitarian'},
            11: {'nature': 'watery', 'traits': 'compassionate and artistic'}
        }
        
        return [
            {
                'id': f"combination_{from_sign}_{to_sign}",
                'description': f"Primarily {sign_traits[from_sign]['traits']}, with some {sign_traits[to_sign]['traits']} qualities"
            },
            {
                'id': f"combination_{to_sign}_{from_sign}",
                'description': f"Primarily {sign_traits[to_sign]['traits']}, with some {sign_traits[from_sign]['traits']} qualities"
            }
        ]

    def _getAscendantTraits(self, ascendant_change: Dict[str, Any], trait_type: str) -> str:
        """Get ascendant traits based on sign changes"""
        trait_descriptions = {
            'psychological': {
                0: 'Independent and pioneering',
                1: 'Patient and reliable',
                2: 'Versatile and curious',
                3: 'Nurturing and protective',
                4: 'Confident and expressive',
                5: 'Analytical and perfectionist',
                6: 'Diplomatic and cooperative',
                7: 'Intense and resourceful',
                8: 'Optimistic and adventurous',
                9: 'Ambitious and responsible',
                10: 'Original and humanitarian',
                11: 'Compassionate and adaptable'
            },
            'appearance': {
                0: 'Athletic build with strong features',
                1: 'Solid build with steady gaze',
                2: 'Tall with quick movements',
                3: 'Round features with gentle expression',
                4: 'Dramatic presence with proud bearing',
                5: 'Neat appearance with precise movements',
                6: 'Graceful with balanced features',
                7: 'Magnetic presence with penetrating gaze',
                8: 'Tall with jovial expression',
                9: 'Distinguished with reserved manner',
                10: 'Unique style with friendly expression',
                11: 'Gentle appearance with dreamy expression'
            },
            'interests': {
                0: 'Sports and leadership',
                1: 'Nature and crafts',
                2: 'Communication and learning',
                3: 'Family and emotional well-being',
                4: 'Arts and entertainment',
                5: 'Health and organization',
                6: 'Relationships and aesthetics',
                7: 'Research and mysteries',
                8: 'Philosophy and travel',
                9: 'Career and structure',
                10: 'Technology and groups',
                11: 'Spirituality and creativity'
            },
            'values': {
                0: 'Independence and courage',
                1: 'Security and loyalty',
                2: 'Knowledge and adaptability',
                3: 'Family and emotional security',
                4: 'Creativity and recognition',
                5: 'Efficiency and improvement',
                6: 'Harmony and fairness',
                7: 'Truth and transformation',
                8: 'Freedom and wisdom',
                9: 'Achievement and tradition',
                10: 'Progress and equality',
                11: 'Unity and compassion'
            }
        }
        
        current_sign = ascendant_change['current_sign']
        potential_sign = ascendant_change['potential_sign']
        
        if trait_type in trait_descriptions:
            return f"{trait_descriptions[trait_type][current_sign]} or {trait_descriptions[trait_type][potential_sign]}"
        return "Traits not available"

    def _getDivisionalChartQuestion(self, chart: str) -> str:
        """Get question text for divisional chart"""
        chart_questions = {
            'D1': 'What best describes your overall personality and life direction?',
            'D9': 'What best describes your spiritual inclinations and dharma?',
            'D10': 'What best describes your career and professional life?'
        }
        return chart_questions.get(chart, 'What best describes your experiences in this area?')

    def _getDivisionalChartOptions(self, chart: str, data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Get options for divisional chart questions"""
        default_options = [
            {'value': 'positive', 'label': 'Mostly positive experiences'},
            {'value': 'mixed', 'label': 'Mixed experiences'},
            {'value': 'challenging', 'label': 'Mostly challenging experiences'},
            {'value': 'transformative', 'label': 'Transformative experiences'}
        ]
        
        chart_options = {
            'D1': [
                {'value': 'leadership', 'label': 'Natural leader and independent'},
                {'value': 'support', 'label': 'Supportive and nurturing'},
                {'value': 'creative', 'label': 'Creative and expressive'},
                {'value': 'analytical', 'label': 'Analytical and methodical'}
            ],
            'D9': [
                {'value': 'dharmic', 'label': 'Strong sense of purpose and dharma'},
                {'value': 'seeking', 'label': 'Spiritual seeker'},
                {'value': 'practical', 'label': 'Practical spirituality'},
                {'value': 'devotional', 'label': 'Devotional nature'}
            ],
            'D10': [
                {'value': 'entrepreneur', 'label': 'Entrepreneurial spirit'},
                {'value': 'professional', 'label': 'Professional excellence'},
                {'value': 'service', 'label': 'Service-oriented career'},
                {'value': 'creative', 'label': 'Creative profession'}
            ]
        }
        return chart_options.get(chart, default_options)

    def _getChartWeight(self, chart: str) -> float:
        """Get weight for a divisional chart"""
        weights = {
            'D1': 1.0,  # Rashi (Main chart)
            'D9': 0.9,  # Navamsa (Marriage, dharma)
            'D10': 0.8, # Dasamsa (Career)
            'D7': 0.7,  # Saptamsa (Children)
            'D2': 0.6,  # Hora (Wealth)
            'D3': 0.5   # Drekkana (Siblings)
        }
        return weights.get(chart, 0.1) 