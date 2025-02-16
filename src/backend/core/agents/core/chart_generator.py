"""
Unified Chart Generation Module
This module consolidates all chart generation functionality into a single, optimized implementation.
"""

import swisseph as swe
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import numpy as np

class UnifiedChartGenerator:
    def __init__(self):
        self.ephemeris_path = "backend/ephe"
        swe.set_ephe_path(self.ephemeris_path)
        
    def calculate_positions(
        self,
        date: datetime,
        lat: float,
        lon: float,
        alt: float = 0
    ) -> Dict[str, Dict[str, float]]:
        """
        Calculate planetary positions using Swiss Ephemeris.
        """
        julian_day = swe.julday(
            date.year,
            date.month,
            date.day,
            date.hour + date.minute/60.0
        )
        
        positions = {}
        planets = range(swe.SUN, swe.PLUTO + 1)
        
        for planet in planets:
            pos = swe.calc_ut(julian_day, planet)
            positions[str(planet)] = {
                "longitude": pos[0],
                "latitude": pos[1],
                "distance": pos[2],
                "speed_long": pos[3],
                "speed_lat": pos[4]
            }
            
        return positions
    
    def calculate_houses(
        self,
        date: datetime,
        lat: float,
        lon: float
    ) -> Dict[str, float]:
        """
        Calculate house cusps using Swiss Ephemeris.
        """
        julian_day = swe.julday(
            date.year,
            date.month,
            date.day,
            date.hour + date.minute/60.0
        )
        
        houses, ascmc = swe.houses(julian_day, lat, lon, b'P')
        
        return {
            "houses": list(houses),
            "ascendant": ascmc[0],
            "midheaven": ascmc[1],
            "armc": ascmc[2],
            "vertex": ascmc[3]
        }
        
    def calculate_aspects(
        self,
        positions: Dict[str, Dict[str, float]],
        orb: float = 1.0
    ) -> List[Dict[str, any]]:
        """
        Calculate planetary aspects with configurable orb.
        """
        aspects = []
        aspect_angles = {
            "conjunction": 0,
            "sextile": 60,
            "square": 90,
            "trine": 120,
            "opposition": 180
        }
        
        planets = list(positions.keys())
        
        for i, p1 in enumerate(planets):
            for p2 in planets[i+1:]:
                diff = abs(positions[p1]["longitude"] - positions[p2]["longitude"])
                
                for aspect, angle in aspect_angles.items():
                    if abs(diff - angle) <= orb:
                        aspects.append({
                            "planet1": p1,
                            "planet2": p2,
                            "aspect": aspect,
                            "orb": abs(diff - angle)
                        })
                        
        return aspects
    
    def generate_chart(
        self,
        date: datetime,
        lat: float,
        lon: float,
        alt: float = 0,
        orb: float = 1.0
    ) -> Dict[str, any]:
        """
        Generate complete birth chart with all calculations.
        """
        positions = self.calculate_positions(date, lat, lon, alt)
        houses = self.calculate_houses(date, lat, lon)
        aspects = self.calculate_aspects(positions, orb)
        
        return {
            "timestamp": date.isoformat(),
            "location": {
                "latitude": lat,
                "longitude": lon,
                "altitude": alt
            },
            "positions": positions,
            "houses": houses,
            "aspects": aspects
        }
    
    def calculate_divisional_charts(
        self,
        positions: Dict[str, Dict[str, float]],
        division: int
    ) -> Dict[str, Dict[str, float]]:
        """
        Calculate divisional charts (D-charts) for Vedic astrology.
        """
        divisional_positions = {}
        
        for planet, pos in positions.items():
            long = pos["longitude"]
            div_long = (long * division) % 360
            
            divisional_positions[planet] = {
                "longitude": div_long,
                "latitude": pos["latitude"],
                "distance": pos["distance"],
                "speed_long": pos["speed_long"],
                "speed_lat": pos["speed_lat"]
            }
            
        return divisional_positions
    
    def calculate_kp_sublords(
        self,
        positions: Dict[str, Dict[str, float]]
    ) -> Dict[str, Dict[str, str]]:
        """
        Calculate KP (Krishnamurti Paddhati) sublords.
        """
        # KP-specific calculations
        sublords = {}
        
        for planet, pos in positions.items():
            long = pos["longitude"]
            star_lord = self._get_star_lord(long)
            sub_lord = self._get_sub_lord(long)
            
            sublords[planet] = {
                "star_lord": star_lord,
                "sub_lord": sub_lord
            }
            
        return sublords
    
    def _get_star_lord(self, longitude: float) -> str:
        """Helper method to get star lord based on longitude."""
        # Implementation of star lord calculation
        star_span = 360 / 27  # 27 Nakshatras
        star_number = int(longitude / star_span)
        return f"Star_{star_number}"
    
    def _get_sub_lord(self, longitude: float) -> str:
        """Helper method to get sub lord based on longitude."""
        # Implementation of sub lord calculation
        sub_span = 360 / 249  # KP sub divisions
        sub_number = int(longitude / sub_span)
        return f"Sub_{sub_number}" 