"""
Planetary Positions Calculator Module
Handles base calculations for planetary positions using Swiss Ephemeris.
"""

import math
from typing import Dict, Any
import swisseph as swe
from datetime import datetime

class PlanetaryPositionsCalculator:
    def __init__(self):
        """Initialize Swiss Ephemeris with proper path."""
        swe.set_ephe_path("/usr/share/ephe")  # Set path to ephemeris files
        
    def calculate_t_value(self, jd: float) -> float:
        """
        Calculate T - centuries since J2000.0.
        
        Args:
            jd (float): Julian day number
            
        Returns:
            float: T value in Julian centuries
        """
        return (jd - 2451545.0) / 36525.0

    def normalize_angle(self, angle: float) -> float:
        """
        Normalize angle to range [0, 360).
        
        Args:
            angle (float): Angle in degrees
            
        Returns:
            float: Normalized angle
        """
        return angle % 360

    def calculate_planet_position(self, jd: float, planet_id: int) -> Dict[str, float]:
        """
        Calculate planet's position using Swiss Ephemeris.
        
        Args:
            jd (float): Julian day number
            planet_id (int): Swiss Ephemeris planet ID
            
        Returns:
            Dict[str, float]: Planet's longitude, latitude, and other details
        """
        try:
            # Calculate planet's position
            xx, ret = swe.calc_ut(jd, planet_id)
            
            return {
                'longitude': self.normalize_angle(xx[0]),
                'latitude': xx[1],
                'distance': xx[2],
                'speed_longitude': xx[3],
                'speed_latitude': xx[4],
                'speed_distance': xx[5]
            }
        except Exception as e:
            raise ValueError(f"Error calculating planet position: {str(e)}")

    def calculate_all_positions(self, jd: float) -> Dict[str, Any]:
        """
        Calculate positions for all planets using Swiss Ephemeris.
        
        Args:
            jd (float): Julian day number
            
        Returns:
            Dict[str, Any]: Dictionary of planetary positions
        """
        try:
            # Planet IDs in Swiss Ephemeris
            planets = {
                'Sun': swe.SUN,
                'Moon': swe.MOON,
                'Mars': swe.MARS,
                'Mercury': swe.MERCURY,
                'Jupiter': swe.JUPITER,
                'Venus': swe.VENUS,
                'Saturn': swe.SATURN,
                'Rahu': swe.MEAN_NODE,  # Using mean node for Rahu
                'Ketu': swe.MEAN_NODE   # Ketu is 180° from Rahu
            }
            
            positions = {}
            for planet_name, planet_id in planets.items():
                pos = self.calculate_planet_position(jd, planet_id)
                if planet_name == 'Ketu':
                    # Adjust Ketu's position (180° from Rahu)
                    pos['longitude'] = self.normalize_angle(positions['Rahu']['longitude'] + 180)
                positions[planet_name] = pos
            
            return positions
            
        except Exception as e:
            raise ValueError(f"Error calculating planetary positions: {str(e)}")

    def calculate_ayanamsa(self, jd: float) -> float:
        """
        Calculate ayanamsa (precession) using Swiss Ephemeris.
        
        Args:
            jd (float): Julian day number
            
        Returns:
            float: Ayanamsa value in degrees
        """
        try:
            return swe.get_ayanamsa_ut(jd)
        except Exception as e:
            raise ValueError(f"Error calculating ayanamsa: {str(e)}")

    @staticmethod
    def calculate_sun_position(T: float) -> Dict[str, float]:
        """
        Calculate Sun's position.
        
        Args:
            T (float): Time in Julian centuries since J2000.0
            
        Returns:
            Dict[str, float]: Sun's longitude and latitude
        """
        try:
            # Calculate mean elements
            L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T**2  # Mean longitude
            M0 = 357.52911 + 35999.05029 * T - 0.0001537 * T**2  # Mean anomaly
            e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T**2  # Eccentricity
            
            # Calculate Sun's equation of center
            C = (1.914602 - 0.004817 * T - 0.000014 * T**2) * math.sin(math.radians(M0))
            C += (0.019993 - 0.000101 * T) * math.sin(math.radians(2 * M0))
            C += 0.000289 * math.sin(math.radians(3 * M0))
            
            # Calculate Sun's true longitude
            L_true = L0 + C
            
            return {
                'longitude': PlanetaryPositionsCalculator.normalize_angle(L_true),
                'latitude': 0.0  # Sun's latitude is always approximately 0
            }
            
        except Exception as e:
            return {'longitude': 0.0, 'latitude': 0.0}

    @staticmethod
    def calculate_mean_elements(T: float, daily_motion: float, epoch_value: float) -> float:
        """
        Calculate mean elements for planetary calculations.
        
        Args:
            T (float): Time in Julian centuries since J2000.0
            daily_motion (float): Mean daily motion in degrees
            epoch_value (float): Value at epoch J2000.0
            
        Returns:
            float: Calculated mean element value
        """
        # Convert daily motion to century motion and add epoch value
        return epoch_value + (daily_motion * 36525 * T)
