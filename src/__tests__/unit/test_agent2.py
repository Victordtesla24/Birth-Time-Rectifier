import pytest
from pre_analysis_input_agent2_1 import (
    pre_chart_input_function,
    calculate_aspects,
    calculate_planetary_strengths,
    calculate_house_influences,
    analyze_divisional_charts,
    analyze_dasha_periods,
    enhance_kp_analysis,
    enhance_tattwa_analysis
)

class TestAgent2:
    @pytest.fixture
    def agent1_data(self):
        return {
            "birth_details": {
                "date": "2025-02-10",
                "time": "12:00",
                "place": "Melbourne, Australia",
                "latitude": -37.8136,
                "longitude": 144.9631,
                "timezone": "Australia/Melbourne"
            },
            "planetary_positions": {
                "Sun": {
                    "longitude": 45.5,
                    "latitude": 0,
                    "speed": 0.98,
                    "house": 1
                },
                "Moon": {
                    "longitude": 123.4,
                    "latitude": -2.1,
                    "speed": 12.5,
                    "house": 4
                }
            },
            "divisional_charts": {
                "D1": {"strength": 0.85, "positions": {}},
                "D9": {"strength": 0.92, "positions": {}}
            },
            "dasha_periods": {
                "current_dasha": {
                    "planet": "Jupiter",
                    "start_date": "2023-01-15",
                    "end_date": "2039-01-15"
                }
            },
            "kp_analysis": {
                "significators": {
                    "career": ["Saturn", "Sun"]
                },
                "sublord_strengths": {
                    "Saturn": 0.85,
                    "Sun": 0.92
                }
            },
            "tattwa_analysis": {
                "elements": {
                    "fire": 0.35,
                    "earth": 0.25
                },
                "dominant_element": "fire",
                "element_balance": 0.82
            }
        }

    def test_input_validation(self, agent1_data):
        # Test with valid input
        result = pre_chart_input_function(agent1_data)
        assert result is not None
        assert 'planetary_data' in result

        # Test missing birth details
        invalid_data = agent1_data.copy()
        del invalid_data['birth_details']
        with pytest.raises(ValueError, match='Missing required birth detail'):
            pre_chart_input_function(invalid_data)

        # Test invalid coordinates
        invalid_data = agent1_data.copy()
        invalid_data['birth_details']['latitude'] = 100
        with pytest.raises(ValueError, match='Invalid coordinates'):
            pre_chart_input_function(invalid_data)

        # Test missing planetary positions
        invalid_data = agent1_data.copy()
        del invalid_data['planetary_positions']
        with pytest.raises(ValueError, match='Missing planetary positions'):
            pre_chart_input_function(invalid_data)

    def test_aspect_calculation(self):
        planets = {
            "Sun": {"longitude": 45.5},
            "Moon": {"longitude": 165.5},  # 120° from Sun (trine)
            "Mars": {"longitude": 45.0}    # 0.5° from Sun (conjunction)
        }
        
        aspects = calculate_aspects(planets)
        
        # Verify aspects are detected
        assert any(a['type'] == 'trine' and 
                  a['planet1'] == 'Sun' and 
                  a['planet2'] == 'Moon' for a in aspects)
        
        assert any(a['type'] == 'conjunction' and 
                  a['planet1'] == 'Sun' and 
                  a['planet2'] == 'Mars' for a in aspects)
        
        # Verify orb calculation
        sun_mars_aspect = next(a for a in aspects 
                             if a['planet1'] == 'Sun' and 
                             a['planet2'] == 'Mars')
        assert abs(sun_mars_aspect['orb'] - 0.5) < 0.0001

    def test_planetary_strengths(self):
        planets = {
            "Sun": {"house": 1, "speed": 1.1},    # Angular house, fast
            "Moon": {"house": 3, "speed": 0.5},   # Cadent house, slow
            "Jupiter": {"house": 10, "speed": 2.0} # Angular house, very fast
        }
        
        strengths = calculate_planetary_strengths(planets)
        
        # Verify all planets have strengths
        assert all(planet in strengths for planet in planets)
        
        # Verify strength ranges
        assert all(0 <= strength <= 1 for strength in strengths.values())
        
        # Verify relative strengths
        assert strengths["Sun"] > strengths["Moon"]  # Angular > Cadent
        assert strengths["Jupiter"] > strengths["Moon"]  # Fast > Slow

    def test_house_influences(self):
        planets = {
            "Sun": {"house": 1, "speed": 1.0},
            "Moon": {"house": 1, "speed": -0.5},
            "Mars": {"house": 4, "speed": 0.8}
        }
        
        influences = calculate_house_influences(planets)
        
        # Verify house 1 influences
        assert 1 in influences
        assert len(influences[1]) == 2  # Sun and Moon
        
        # Verify planet strengths
        sun_influence = next(p for p in influences[1] if p['planet'] == 'Sun')
        assert sun_influence['strength'] == 'strong'  # Direct motion
        
        moon_influence = next(p for p in influences[1] if p['planet'] == 'Moon')
        assert moon_influence['strength'] == 'moderate'  # Retrograde

    def test_divisional_analysis(self):
        charts = {
            "D1": {
                "strength": 0.85,
                "positions": {
                    "Sun": {"longitude": 45.5, "house": 1},
                    "Jupiter": {"longitude": 120.0, "house": 5}
                }
            },
            "D9": {
                "strength": 0.92,
                "positions": {
                    "Sun": {"longitude": 180.0, "house": 7},
                    "Jupiter": {"longitude": 240.0, "house": 9}
                }
            }
        }
        
        analysis = analyze_divisional_charts(charts)
        
        # Verify analysis structure
        for chart_type in charts:
            assert chart_type in analysis
            assert 'strength' in analysis[chart_type]
            assert 'dominant_planets' in analysis[chart_type]
            assert 'house_patterns' in analysis[chart_type]
        
        # Verify house patterns
        d1_patterns = analysis['D1']['house_patterns']
        assert 'angular_houses' in d1_patterns
        assert 'trine_houses' in d1_patterns
        assert 'kendra_houses' in d1_patterns

    def test_dasha_analysis(self):
        dasha = {
            "current_dasha": {
                "planet": "Jupiter",
                "start_date": "2023-01-15",
                "end_date": "2039-01-15"
            },
            "current_bhukti": {
                "planet": "Venus",
                "start_date": "2025-05-20",
                "end_date": "2027-09-20"
            }
        }
        
        analysis = analyze_dasha_periods(dasha)
        
        # Verify analysis structure
        assert 'current_period' in analysis
        assert 'sub_period' in analysis
        
        # Verify period details
        current = analysis['current_period']
        assert current['planet'] == 'Jupiter'
        assert current['remaining_years'] > 0
        assert 'significance' in current
        
        # Verify sub-period details
        sub = analysis['sub_period']
        assert sub['planet'] == 'Venus'
        assert sub['remaining_months'] > 0
        assert 'significance' in sub

    def test_enhanced_kp_analysis(self):
        kp = {
            "significators": {
                "career": ["Saturn", "Sun"],
                "relationship": ["Venus", "Jupiter"]
            },
            "sublord_strengths": {
                "Saturn": 0.85,
                "Jupiter": 0.92
            }
        }
        
        enhanced = enhance_kp_analysis(kp)
        
        # Verify enhanced structure
        assert 'significators' in enhanced
        assert 'sublord_strengths' in enhanced
        assert 'house_significators' in enhanced
        assert 'cusp_sublords' in enhanced
        
        # Verify house significators
        assert '1' in enhanced['house_significators']
        assert '10' in enhanced['house_significators']
        
        # Verify cusp sublords
        assert all(house in enhanced['cusp_sublords'] 
                  for house in ['1', '4', '7', '10'])

    def test_enhanced_tattwa_analysis(self):
        tattwa = {
            "elements": {
                "fire": 0.35,
                "earth": 0.25,
                "air": 0.20,
                "water": 0.20
            },
            "dominant_element": "fire",
            "element_balance": 0.82
        }
        
        enhanced = enhance_tattwa_analysis(tattwa)
        
        # Verify enhanced structure
        assert 'elements' in enhanced
        assert 'dominant_element' in enhanced
        assert 'element_balance' in enhanced
        assert 'recommendations' in enhanced
        assert 'compatibility' in enhanced
        
        # Verify recommendations
        assert 'lifestyle' in enhanced['recommendations']
        assert 'career' in enhanced['recommendations']
        assert 'relationships' in enhanced['recommendations']
        
        # Verify compatibility
        assert 'favorable_elements' in enhanced['compatibility']
        assert 'challenging_elements' in enhanced['compatibility']
        assert 'balancing_elements' in enhanced['compatibility']

    def test_complete_workflow(self, agent1_data):
        # Test complete workflow from Agent 1 data to final analysis
        result = pre_chart_input_function(agent1_data)
        
        # Verify all components are present
        assert 'birth_details' in result
        assert 'planetary_data' in result
        assert 'divisional_analysis' in result
        assert 'dasha_analysis' in result
        assert 'kp_analysis' in result
        assert 'tattwa_analysis' in result
        
        # Verify planetary data
        planetary_data = result['planetary_data']
        assert 'positions' in planetary_data
        assert 'aspects' in planetary_data
        assert 'strengths' in planetary_data
        assert 'house_influences' in planetary_data
        
        # Verify enhanced analysis components
        assert 'recommendations' in result['tattwa_analysis']
        assert 'house_significators' in result['kp_analysis']
        assert 'significance' in result['dasha_analysis']['current_period']
