"""
House Calculator Module
Handles calculations for house cusps using Swiss Ephemeris.
"""

import math
from typing import Dict, Any
import swisseph as swe

class HouseCalculator:
    def __init__(self):
        """Initialize house calculator."""
        pass

    def calculate_house_cusps(self, jd: float, lat: float, lon: float, ayanamsa: float) -> Dict[int, float]:
        """
        Calculate house cusps using Swiss Ephemeris.
        
        Args:
            jd (float): Julian day number
            lat (float): Latitude in degrees
            lon (float): Longitude in degrees
            ayanamsa (float): Ayanamsa value in degrees
            
        Returns:
            Dict[int, float]: Dictionary of house cusps (1-12)
        """
        try:
            # Set sidereal mode with given ayanamsa
            swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
            
            # Calculate house cusps
            houses, ascmc = swe.houses_ex(
                jd,
                lat,
                lon,
                b'P',  # Placidus house system
                0      # Tropical zodiac (ayanamsa will be applied later)
            )
            
            # Create dictionary of house cusps
            house_cusps = {}
            for i in range(12):
                # Apply ayanamsa to get sidereal positions
                house_cusps[i + 1] = self.normalize_angle(houses[i] - ayanamsa)
            
            return house_cusps
            
        except Exception as e:
            raise ValueError(f"Error calculating house cusps: {str(e)}")

    def calculate_special_points(self, jd: float, lat: float, lon: float, ayanamsa: float) -> Dict[str, float]:
        """
        Calculate special points (Ascendant, MC, etc.) using Swiss Ephemeris.
        
        Args:
            jd (float): Julian day number
            lat (float): Latitude in degrees
            lon (float): Longitude in degrees
            ayanamsa (float): Ayanamsa value in degrees
            
        Returns:
            Dict[str, float]: Dictionary of special points
        """
        try:
            # Calculate house cusps and special points
            houses, ascmc = swe.houses_ex(
                jd,
                lat,
                lon,
                b'P',  # Placidus house system
                0      # Tropical zodiac (ayanamsa will be applied later)
            )
            
            # Extract and adjust special points
            special_points = {
                'Ascendant': self.normalize_angle(ascmc[0] - ayanamsa),
                'Midheaven': self.normalize_angle(ascmc[1] - ayanamsa),
                'ARMC': self.normalize_angle(ascmc[2]),  # Sidereal time
                'Vertex': self.normalize_angle(ascmc[3] - ayanamsa),
                'East_Point': self.normalize_angle(ascmc[4] - ayanamsa),
                'Part_of_Fortune': self.calculate_part_of_fortune(
                    ascmc[0], 
                    self.get_sun_moon_positions(jd)
                )
            }
            
            return special_points
            
        except Exception as e:
            raise ValueError(f"Error calculating special points: {str(e)}")

    def get_sun_moon_positions(self, jd: float) -> Dict[str, float]:
        """
        Get Sun and Moon positions for Part of Fortune calculation.
        
        Args:
            jd (float): Julian day number
            
        Returns:
            Dict[str, float]: Sun and Moon longitudes
        """
        try:
            # Calculate Sun position
            sun_pos, sun_ret = swe.calc_ut(jd, swe.SUN)
            
            # Calculate Moon position
            moon_pos, moon_ret = swe.calc_ut(jd, swe.MOON)
            
            return {
                'sun': sun_pos[0],
                'moon': moon_pos[0]
            }
            
        except Exception as e:
            raise ValueError(f"Error calculating Sun/Moon positions: {str(e)}")

    def calculate_part_of_fortune(self, asc: float, positions: Dict[str, float]) -> float:
        """
        Calculate Part of Fortune.
        
        Args:
            asc (float): Ascendant longitude
            positions (Dict[str, float]): Sun and Moon longitudes
            
        Returns:
            float: Part of Fortune longitude
        """
        try:
            # Traditional formula: Ascendant + Moon - Sun
            pof = asc + positions['moon'] - positions['sun']
            return self.normalize_angle(pof)
            
        except Exception as e:
            raise ValueError(f"Error calculating Part of Fortune: {str(e)}")

    @staticmethod
    def normalize_angle(angle: float) -> float:
        """
        Normalize angle to range [0, 360).
        
        Args:
            angle (float): Angle in degrees
            
        Returns:
            float: Normalized angle
        """
        return angle % 360

    def calculate_house_strengths(self, house_cusps: Dict[int, float]) -> Dict[int, float]:
        """
        Calculate relative strengths of houses based on their sizes.
        
        Args:
            house_cusps (Dict[int, float]): Dictionary of house cusps
            
        Returns:
            Dict[int, float]: Dictionary of house strengths (0-1)
        """
        try:
            strengths = {}
            
            for house in range(1, 13):
                next_house = house + 1 if house < 12 else 1
                start = house_cusps[house]
                end = house_cusps[next_house]
                
                # Calculate house size
                size = end - start if end > start else end + 360 - start
                
                # Normalize to 0-1 range (30° is considered normal size)
                strength = min(size / 30.0, 1.0)
                strengths[house] = strength
            
            return strengths
            
        except Exception as e:
            raise ValueError(f"Error calculating house strengths: {str(e)}") 