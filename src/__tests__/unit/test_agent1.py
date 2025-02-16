import pytest
from datetime import datetime
from user_info_collector_preprocessor_agent1_1 import (
    input_collection_function,
    calculate_planetary_positions,
    calculate_divisional_charts,
    calculate_dasha_periods,
    analyze_kp_sublords,
    analyze_tattwa_elements
)

class TestAgent1:
    @pytest.fixture
    def valid_input(self):
        return {
            'birth_date': '2025-02-10',
            'birth_time': '12:00',
            'birth_place': 'Melbourne, Australia'
        }

    def test_input_validation(self, valid_input):
        # Test with valid input
        result = input_collection_function(**valid_input)
        assert result['birth_details']['date'] == '2025-02-10'
        assert result['birth_details']['time'] == '12:00'
        assert result['birth_details']['place'] == 'Melbourne, Australia'

        # Test missing fields
        with pytest.raises(ValueError, match='All fields .* are required'):
            input_collection_function('', '12:00', 'Melbourne, Australia')

        # Test invalid date format
        with pytest.raises(ValueError, match='Birth date format not recognized'):
            input_collection_function('10-02-2025', '12:00', 'Melbourne, Australia')

        # Test invalid time format
        with pytest.raises(ValueError, match='Birth time format not recognized'):
            input_collection_function('2025-02-10', '12:00 XX', 'Melbourne, Australia')

        # Test invalid place format
        with pytest.raises(ValueError, match='Birth place must include'):
            input_collection_function('2025-02-10', '12:00', 'InvalidPlace')

    def test_geocoding(self, valid_input):
        result = input_collection_function(**valid_input)
        
        # Verify Melbourne coordinates
        assert abs(result['birth_details']['latitude'] - (-37.8136)) < 0.0001
        assert abs(result['birth_details']['longitude'] - 144.9631) < 0.0001
        assert result['birth_details']['timezone'] == 'Australia/Melbourne'

        # Test unsupported country
        with pytest.raises(ValueError, match='Country not supported'):
            input_collection_function(
                '2025-02-10',
                '12:00',
                'Paris, France'  # Unsupported country
            )

        # Test default city fallback
        result = input_collection_function(
            '2025-02-10',
            '12:00',
            'UnknownCity, Australia'
        )
        # Should fall back to Sydney
        assert abs(result['birth_details']['latitude'] - (-33.8688)) < 0.0001

    def test_timezone_conversion(self, valid_input):
        result = input_collection_function(**valid_input)
        
        # Verify timezone conversion
        local_dt = result['birth_details']['local_datetime']
        utc_dt = result['birth_details']['utc_datetime']
        
        # Parse datetimes
        local = datetime.fromisoformat(local_dt)
        utc = datetime.fromisoformat(utc_dt.replace('Z', '+00:00'))
        
        # Verify 11-hour difference for Melbourne
        time_diff = local.hour - utc.hour
        assert time_diff == 11 or time_diff == -13  # Account for day boundary

    def test_planetary_calculations(self):
        utc_dt = datetime.fromisoformat('2025-02-10T01:00:00+00:00')
        latitude = -37.8136
        longitude = 144.9631
        
        planets = calculate_planetary_positions(utc_dt, latitude, longitude)
        
        # Verify required planets
        required_planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
        for planet in required_planets:
            assert planet in planets
            assert 'longitude' in planets[planet]
            assert 'latitude' in planets[planet]
            assert 'speed' in planets[planet]
            assert 'house' in planets[planet]
            
            # Verify value ranges
            assert 0 <= planets[planet]['longitude'] < 360
            assert -90 <= planets[planet]['latitude'] <= 90
            assert 1 <= planets[planet]['house'] <= 12

    def test_divisional_charts(self):
        planets = {
            'Sun': {'longitude': 45.5, 'house': 1},
            'Moon': {'longitude': 123.4, 'house': 4}
        }
        
        charts = calculate_divisional_charts(planets)
        
        # Verify required divisional charts
        required_charts = ['D1', 'D9', 'D10', 'D12']
        for chart in required_charts:
            assert chart in charts
            assert 'strength' in charts[chart]
            assert 'positions' in charts[chart]
            
            # Verify strength range
            assert 0 <= charts[chart]['strength'] <= 1
            
            # Verify planet positions
            for planet in planets:
                assert planet in charts[chart]['positions']
                assert 'longitude' in charts[chart]['positions'][planet]
                assert 'house' in charts[chart]['positions'][planet]

    def test_dasha_periods(self):
        birth_time = datetime.fromisoformat('2025-02-10T12:00:00+11:00')
        planets = {
            'Jupiter': {'longitude': 189.3, 'house': 7}
        }
        
        dasha = calculate_dasha_periods(birth_time, planets)
        
        # Verify dasha structure
        assert 'current_dasha' in dasha
        assert 'current_bhukti' in dasha
        
        # Verify dasha details
        assert 'planet' in dasha['current_dasha']
        assert 'start_date' in dasha['current_dasha']
        assert 'end_date' in dasha['current_dasha']
        
        # Verify bhukti details
        assert 'planet' in dasha['current_bhukti']
        assert 'start_date' in dasha['current_bhukti']
        assert 'end_date' in dasha['current_bhukti']
        
        # Verify date formats
        datetime.strptime(dasha['current_dasha']['start_date'], '%Y-%m-%d')
        datetime.strptime(dasha['current_dasha']['end_date'], '%Y-%m-%d')

    def test_kp_analysis(self):
        planets = {
            'Sun': {'longitude': 45.5, 'house': 1},
            'Saturn': {'longitude': 298.1, 'house': 10}
        }
        
        kp = analyze_kp_sublords(planets)
        
        # Verify KP structure
        assert 'significators' in kp
        assert 'sublord_strengths' in kp
        
        # Verify significators
        assert 'career' in kp['significators']
        assert isinstance(kp['significators']['career'], list)
        
        # Verify sublord strengths
        for planet, strength in kp['sublord_strengths'].items():
            assert 0 <= strength <= 1

    def test_tattwa_analysis(self):
        planets = {
            'Sun': {'longitude': 45.5, 'house': 1},  # Fire sign (Aries)
            'Moon': {'longitude': 123.4, 'house': 4}  # Water sign (Cancer)
        }
        
        tattwa = analyze_tattwa_elements(planets)
        
        # Verify Tattwa structure
        assert 'elements' in tattwa
        assert 'dominant_element' in tattwa
        assert 'element_balance' in tattwa
        
        # Verify elements
        elements = ['fire', 'earth', 'air', 'water']
        for element in elements:
            assert element in tattwa['elements']
            assert 0 <= tattwa['elements'][element] <= 1
        
        # Verify element balance
        assert 0 <= tattwa['element_balance'] <= 1
        
        # Verify total elements sum to 1
        total = sum(tattwa['elements'].values())
        assert abs(total - 1.0) < 0.0001

    def test_complete_workflow(self, valid_input):
        # Test complete workflow from input to final output
        result = input_collection_function(**valid_input)
        
        # Verify all components are present
        assert 'birth_details' in result
        assert 'planetary_positions' in result
        assert 'divisional_charts' in result
        assert 'dasha_periods' in result
        assert 'kp_analysis' in result
        assert 'tattwa_analysis' in result
        
        # Verify birth details
        birth_details = result['birth_details']
        assert all(key in birth_details for key in [
            'date', 'time', 'place', 'latitude', 'longitude',
            'timezone', 'local_datetime', 'utc_datetime'
        ])
        
        # Verify planetary positions
        planets = result['planetary_positions']
        assert len(planets) >= 9  # At least 9 major planets
        
        # Verify divisional charts
        charts = result['divisional_charts']
        assert len(charts) >= 4  # At least D1, D9, D10, D12
        
        # Verify dasha periods
        dasha = result['dasha_periods']
        assert 'current_dasha' in dasha
        assert 'current_bhukti' in dasha
        
        # Verify KP analysis
        kp = result['kp_analysis']
        assert 'significators' in kp
        assert 'sublord_strengths' in kp
        
        # Verify Tattwa analysis
        tattwa = result['tattwa_analysis']
        assert 'elements' in tattwa
        assert 'dominant_element' in tattwa
        assert 'element_balance' in tattwa
