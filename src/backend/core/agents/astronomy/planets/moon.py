"""
Moon Position Calculator Module
Handles specific calculations for the Moon's position.
"""

import math
from typing import Dict
from ..planetary_positions import PlanetaryPositionsCalculator

class MoonCalculator:
    # Moon's mean elements at J2000.0
    EPOCH_VALUES = {
        'longitude': 218.3164477,  # Mean longitude
        'elongation': 297.8501921, # Mean elongation
        'anomaly': 134.9633964,    # Mean anomaly
        'latitude': 93.2720950,    # Argument of latitude
    }
    
    # Century motions
    CENTURY_MOTIONS = {
        'longitude': 481267.88123421,
        'elongation': 445267.1114034,
        'anomaly': 477198.8675055,
        'latitude': 483202.0175233
    }
    
    # Perturbation coefficients
    PERTURBATIONS = {
        'principal': 6288.06,      # Principal perturbation
        'evection': 1274.34,       # Evection term
        'variation': 658.31,       # Variation term
        'annual': 214.22,          # Annual equation
        'latitude': 5.13           # Principal latitude term
    }

    @classmethod
    def calculate_position(cls, jd: float) -> Dict[str, float]:
        """
        Calculate Moon's position for given Julian day.
        
        Args:
            jd (float): Julian day number
            
        Returns:
            Dict[str, float]: Moon's longitude and latitude
            
        Note:
            This implementation uses a simplified version of the ELP2000-82 theory.
            For higher precision, additional perturbation terms should be added.
        """
        try:
            # Calculate T - centuries since J2000.0
            T = PlanetaryPositionsCalculator.calculate_t_value(jd)
            
            # Calculate mean elements
            Lp = cls.EPOCH_VALUES['longitude'] + cls.CENTURY_MOTIONS['longitude'] * T - 0.0015786 * T**2  # Mean longitude
            D = cls.EPOCH_VALUES['elongation'] + cls.CENTURY_MOTIONS['elongation'] * T - 0.0018819 * T**2  # Mean elongation
            M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T**2  # Sun's mean anomaly
            Mp = cls.EPOCH_VALUES['anomaly'] + cls.CENTURY_MOTIONS['anomaly'] * T + 0.0087414 * T**2  # Moon's mean anomaly
            F = cls.EPOCH_VALUES['latitude'] + cls.CENTURY_MOTIONS['latitude'] * T - 0.0036539 * T**2  # Argument of latitude
            
            # Calculate perturbations
            dL = cls.PERTURBATIONS['principal'] * math.sin(math.radians(Mp))
            dL += cls.PERTURBATIONS['evection'] * math.sin(math.radians(2*D - Mp))
            dL += cls.PERTURBATIONS['variation'] * math.sin(math.radians(2*D))
            dL += cls.PERTURBATIONS['annual'] * math.sin(math.radians(M))
            
            # Calculate final position
            L = Lp + dL/1000000.0  # Convert perturbations to degrees
            B = cls.PERTURBATIONS['latitude'] * math.sin(math.radians(F))  # Latitude
            
            return {
                'longitude': PlanetaryPositionsCalculator.normalize_angle(L),
                'latitude': B
            }
            
        except Exception as e:
            return {'longitude': 0.0, 'latitude': 0.0}

    @classmethod
    def calculate_phase(cls, moon_long: float, sun_long: float) -> float:
        """
        Calculate Moon's phase.
        
        Args:
            moon_long (float): Moon's longitude
            sun_long (float): Sun's longitude
            
        Returns:
            float: Moon's phase (0-1, where 0=new moon, 0.5=full moon)
        """
        try:
            # Calculate elongation from the Sun
            elongation = moon_long - sun_long
            if elongation < 0:
                elongation += 360
            
            # Convert to phase (0-1)
            phase = elongation / 360.0
            
            return phase
            
        except Exception as e:
            return 0.0  # Default to new moon on error
