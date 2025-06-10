"""
Chart Generator Module
Handles generation of birth chart and divisional charts.
"""

from typing import Dict, Any, List
from datetime import datetime
import math

from ..astronomy.planetary_positions import PlanetaryPositionsCalculator
from ..astronomy.house_calculator import HouseCalculator
from .divisional_charts import DivisionalChartsCalculator

class ChartGenerator:
    def __init__(self):
        """Initialize chart generator with required calculators."""
        self.planetary_calculator = PlanetaryPositionsCalculator()
        self.house_calculator = HouseCalculator()
        self.divisional_calculator = DivisionalChartsCalculator()

    def generate_birth_chart(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate birth chart with all planetary positions and house cusps.
        
        Args:
            birth_data (Dict[str, Any]): Birth details including date, time, and location
            
        Returns:
            Dict[str, Any]: Complete birth chart data
        """
        try:
            # Extract birth details
            date = birth_data['date']
            time = birth_data['time']
            latitude = birth_data.get('latitude', 0)
            longitude = birth_data.get('longitude', 0)
            
            # Convert to datetime
            birth_datetime = datetime.strptime(f"{date} {time}", "%d/%m/%Y %H:%M")
            
            # Calculate Julian Day
            jd = self._calculate_julian_day(birth_datetime)
            
            # Calculate ayanamsa
            ayanamsa = self.planetary_calculator.calculate_ayanamsa(jd)
            
            # Calculate planetary positions
            positions = self.planetary_calculator.calculate_all_positions(jd)
            
            # Calculate house cusps
            houses = self.house_calculator.calculate_house_cusps(
                jd, latitude, longitude, ayanamsa
            )
            
            # Generate all divisional charts
            divisional_charts = self.divisional_calculator.calculate_all_charts(positions)
            
            # Prepare complete chart data
            chart_data = {
                'birth_details': {
                    'date': date,
                    'time': time,
                    'latitude': latitude,
                    'longitude': longitude
                },
                'ayanamsa': ayanamsa,
                'rashi_chart': {
                    'planets': positions,
                    'houses': houses
                },
                'divisional_charts': divisional_charts,
                'meta': {
                    'julian_day': jd,
                    'calculation_timestamp': datetime.now().isoformat()
                }
            }
            
            return chart_data
            
        except Exception as e:
            raise ValueError(f"Error generating birth chart: {str(e)}")

    def _calculate_julian_day(self, dt: datetime) -> float:
        """
        Calculate Julian Day number from datetime.
        
        Args:
            dt (datetime): Date and time
            
        Returns:
            float: Julian Day number
        """
        year = dt.year
        month = dt.month
        day = dt.day + (dt.hour + dt.minute/60.0 + dt.second/3600.0)/24.0
        
        if month <= 2:
            year -= 1
            month += 12
            
        a = math.floor(year/100.0)
        b = 2 - a + math.floor(a/4.0)
        
        jd = (math.floor(365.25*(year + 4716)) + 
              math.floor(30.6001*(month + 1)) + 
              day + b - 1524.5)
              
        return jd

    def analyze_chart(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze birth chart and divisional charts for key features.
        
        Args:
            chart_data (Dict[str, Any]): Complete chart data
            
        Returns:
            Dict[str, Any]: Analysis results
        """
        try:
            analysis = {
                'rashi_analysis': self._analyze_rashi_chart(chart_data['rashi_chart']),
                'divisional_analysis': {}
            }
            
            # Analyze each divisional chart
            for varga, chart in chart_data['divisional_charts'].items():
                if chart:  # Skip empty charts
                    analysis['divisional_analysis'][varga] = self._analyze_varga_chart(chart)
            
            return analysis
            
        except Exception as e:
            raise ValueError(f"Error analyzing chart: {str(e)}")

    def _analyze_rashi_chart(self, chart: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze rashi (birth) chart.
        
        Args:
            chart (Dict[str, Any]): Rashi chart data
            
        Returns:
            Dict[str, Any]: Analysis results
        """
        try:
            # Extract planetary positions and house cusps
            planets = chart['planets']
            houses = chart['houses']
            
            # Analyze planetary positions
            planet_analysis = {}
            for planet, pos in planets.items():
                sign = self.divisional_calculator.get_sign(pos['longitude'])
                house = self._find_house(pos['longitude'], houses)
                
                planet_analysis[planet] = {
                    'sign': sign,
                    'house': house,
                    'longitude': pos['longitude'],
                    'is_retrograde': pos.get('speed_longitude', 0) < 0
                }
            
            return {
                'planetary_positions': planet_analysis,
                'house_positions': houses
            }
            
        except Exception as e:
            return {}

    def _analyze_varga_chart(self, chart: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a divisional chart.
        
        Args:
            chart (Dict[str, Any]): Divisional chart data
            
        Returns:
            Dict[str, Any]: Analysis results
        """
        try:
            # Analyze planetary positions in the divisional chart
            planet_analysis = {}
            for planet, pos in chart.items():
                sign = self.divisional_calculator.get_sign(pos['longitude'])
                
                planet_analysis[planet] = {
                    'sign': sign,
                    'longitude': pos['longitude'],
                    'is_retrograde': pos.get('speed_longitude', 0) < 0
                }
            
            return {
                'planetary_positions': planet_analysis
            }
            
        except Exception as e:
            return {}

    def _find_house(self, longitude: float, houses: Dict[int, float]) -> int:
        """
        Find house number for given longitude.
        
        Args:
            longitude (float): Planet's longitude
            houses (Dict[int, float]): House cusps
            
        Returns:
            int: House number (1-12)
        """
        try:
            # Normalize all longitudes to 0-360 range
            norm_long = self.divisional_calculator.normalize_longitude(longitude)
            norm_houses = {h: self.divisional_calculator.normalize_longitude(pos) 
                         for h, pos in houses.items()}
            
            # Find house by comparing with house cusps
            for house in range(1, 13):
                next_house = house + 1 if house < 12 else 1
                start = norm_houses[house]
                end = norm_houses[next_house]
                
                if start < end:
                    if start <= norm_long < end:
                        return house
                else:  # House spans 0°
                    if norm_long >= start or norm_long < end:
                        return house
            
            return 1  # Default to 1st house if not found
            
        except Exception as e:
            return 1 