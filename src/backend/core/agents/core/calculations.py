"""
Planetary calculations using Swiss Ephemeris
"""

import swisseph as swe
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
import pytz
import os
from pathlib import Path
import glob

logger = logging.getLogger(__name__)

# Enhanced constants for calculations
REQUIRED_PLANETS = [
    swe.SUN, swe.MOON, swe.MARS, swe.MERCURY, swe.JUPITER,
    swe.VENUS, swe.SATURN, swe.URANUS, swe.NEPTUNE,
    swe.PLUTO, swe.MEAN_NODE  # Rahu, Ketu is 180° from Rahu
]

PLANET_NAMES = {
    swe.SUN: 'Sun',
    swe.MOON: 'Moon',
    swe.MARS: 'Mars',
    swe.MERCURY: 'Mercury',
    swe.JUPITER: 'Jupiter',
    swe.VENUS: 'Venus',
    swe.SATURN: 'Saturn',
    swe.URANUS: 'Uranus',
    swe.NEPTUNE: 'Neptune',
    swe.PLUTO: 'Pluto',
    swe.MEAN_NODE: 'Rahu'
}

# Enhanced calculation flags for maximum accuracy
CALC_FLAGS = (swe.SEFLG_SWIEPH |  # Use Swiss Ephemeris
             swe.SEFLG_SPEED |    # Calculate speed
             swe.SEFLG_TOPOCTR |  # Topocentric positions
             swe.SEFLG_SIDEREAL | # Sidereal zodiac
             swe.SEFLG_NONUT |    # No nutation
             swe.SEFLG_TRUEPOS)   # True positions

# House system constants
HOUSE_SYSTEMS = {
    'P': 'Placidus',
    'K': 'Koch',
    'O': 'Porphyrius',
    'R': 'Regiomontanus',
    'C': 'Campanus',
    'A': 'Equal',
    'V': 'Vehlow equal',
    'W': 'Whole sign',
    'X': 'Meridian',
    'M': 'Morinus',
    'B': 'Alcabitius'
}

class PlanetaryCalculator:
    def __init__(self):
        """Initialize Swiss Ephemeris with proper path."""
        try:
            # Use local ephe directory
            ephe_path = str(Path(__file__).parent.parent.parent.parent / 'backend' / 'ephe')
            logger.info(f"Setting ephemeris path to: {ephe_path}")
            
            # Ensure the path exists
            if not os.path.exists(ephe_path):
                raise ValueError(f"Ephemeris path does not exist: {ephe_path}")
            
            # Check if ephemeris files exist
            required_patterns = {
                'planets': ['sepl_*.se1', 'seplm*.se1'],
                'moon': ['semo_*.se1', 'semom*.se1']
            }
            
            missing_types = []
            for file_type, patterns in required_patterns.items():
                has_files = False
                for pattern in patterns:
                    if glob.glob(os.path.join(ephe_path, pattern)):
                        has_files = True
                        break
                if not has_files:
                    missing_types.append(file_type)
            
            if missing_types:
                raise ValueError(f"Missing required ephemeris files for: {', '.join(missing_types)}")
            
            # Set the path and initialize
            swe.set_ephe_path(ephe_path)
            
            # Set Lahiri ayanamsa
            swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
            
            # Test calculation to verify initialization
            test_jd = swe.julday(2000, 1, 1, 0)
            xx, ret = swe.calc_ut(test_jd, swe.SUN, CALC_FLAGS)
            if not xx:
                raise ValueError("Failed to perform test calculation")
            
            logger.info("Swiss Ephemeris initialized successfully")
            logger.debug(f"Test calculation result: {xx}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Swiss Ephemeris: {e}")
            raise

    def calculate_all_positions(self, date: datetime, lat: float, lon: float) -> Dict[str, Any]:
        """Calculate positions for all required planets with enhanced accuracy."""
        try:
            # Convert datetime to Julian Day
            jd = self._datetime_to_jd(date)
            logger.debug(f"Julian Day: {jd}")
            
            # Set topocentric coordinates for this calculation
            swe.set_topo(lat, lon, 0.0)
            logger.debug(f"Set topocentric coordinates: lat={lat}, lon={lon}")
            
            # Calculate Ascendant and houses with advanced Placidus system
            try:
                # Calculate houses using multiple systems for verification
                house_systems = ['P', 'K', 'W']  # Placidus, Koch, Whole sign
                house_data = {}
                
                for system in house_systems:
                    cusps, ascmc = swe.houses_ex2(
                        jd,
                        CALC_FLAGS,
                        lat,
                        lon,
                        system.encode('ascii')
                    )
                    house_data[HOUSE_SYSTEMS[system]] = {
                        'cusps': cusps,
                        'ascmc': ascmc
                    }
                
                # Use Placidus as primary system
                primary_cusps = house_data['Placidus']['cusps']
                primary_ascmc = house_data['Placidus']['ascmc']
                
                ascendant = primary_ascmc[0]  # Ascendant
                mc = primary_ascmc[1]         # Midheaven
                armc = primary_ascmc[2]       # ARMC
                vertex = primary_ascmc[3]     # Vertex
                equatorial_ascendant = primary_ascmc[4]  # Equatorial Ascendant
                
                logger.debug(f"Calculated Ascendant: {ascendant}")
            except Exception as e:
                logger.error(f"Failed to calculate houses: {e}")
                raise
            
            positions = {
                'Ascendant': {
                    'longitude': ascendant,
                    'latitude': 0.0,
                    'distance': 0.0,
                    'speed': 0.0,
                    'house': 1,
                    'isRetrograde': False,
                    'nakshatra': self._calculate_nakshatra(ascendant),
                    'dignity': 'neutral',
                    'sign': int(ascendant / 30) + 1,
                    'degree': ascendant % 30
                }
            }
            
            # Add special points with enhanced calculations
            positions.update({
                'Midheaven': {
                    'longitude': mc,
                    'special_point': True,
                    'sign': int(mc / 30) + 1,
                    'degree': mc % 30,
                    'nakshatra': self._calculate_nakshatra(mc)
                },
                'Vertex': {
                    'longitude': vertex,
                    'special_point': True,
                    'sign': int(vertex / 30) + 1,
                    'degree': vertex % 30,
                    'nakshatra': self._calculate_nakshatra(vertex)
                },
                'ARMC': {
                    'longitude': armc,
                    'special_point': True
                },
                'EquatorialAscendant': {
                    'longitude': equatorial_ascendant,
                    'special_point': True,
                    'sign': int(equatorial_ascendant / 30) + 1,
                    'degree': equatorial_ascendant % 30
                }
            })
            
            # Add house cusps with advanced calculations for all systems
            positions['houses'] = {
                system: {
                    str(i+1): {
                        'longitude': data['cusps'][i],
                        'sign': int(data['cusps'][i] / 30) + 1,
                        'degree': data['cusps'][i] % 30,
                        'nakshatra': self._calculate_nakshatra(data['cusps'][i])
                    }
                    for i in range(12)
                }
                for system, data in house_data.items()
            }
            
            # Calculate planetary positions with enhanced accuracy
            for planet in REQUIRED_PLANETS:
                try:
                    # Calculate planetary position with all flags
                    xx, ret = swe.calc_ut(jd, planet, CALC_FLAGS)
                    if not xx:
                        raise ValueError(f"No position data returned for planet {planet}")
                    
                    # Get planet name
                    planet_name = PLANET_NAMES.get(planet, f'Planet_{planet}')
                    
                    # Calculate additional points
                    declination, rect_ascension = swe.cotrans(xx[0], xx[1], xx[2], -23.4367) # Obliquity
                    
                    # Enhanced position data
                    positions[planet_name] = {
                        'longitude': xx[0],  # Longitude in degrees
                        'latitude': xx[1],   # Latitude in degrees
                        'distance': xx[2],   # Distance in AU
                        'speed': xx[3],      # Speed in deg/day
                        'declination': declination,  # Declination
                        'rectAscension': rect_ascension,  # Right Ascension
                        'house': self._calculate_house(xx[0], ascendant, primary_cusps),
                        'isRetrograde': xx[3] < 0,
                        'nakshatra': self._calculate_nakshatra(xx[0]),
                        'dignity': self._calculate_dignity(planet, xx[0]),
                        'sign': int(xx[0] / 30) + 1,
                        'degree': xx[0] % 30,
                        'aspects': self._calculate_planet_aspects(xx[0], positions)
                    }
                    logger.debug(f"Calculated position for {planet_name}: {positions[planet_name]}")
                except Exception as e:
                    logger.error(f"Failed to calculate position for planet {planet}: {e}")
                    continue

            # Add Ketu (180° from Rahu) with enhanced calculations
            if "Rahu" in positions:
                ketu_long = (positions["Rahu"]["longitude"] + 180) % 360
                ketu_lat = -positions["Rahu"]["latitude"]
                ketu_decl, ketu_rect = swe.cotrans(ketu_long, ketu_lat, positions["Rahu"]["distance"], -23.4367)
                
                positions["Ketu"] = {
                    'longitude': ketu_long,
                    'latitude': ketu_lat,
                    'distance': positions["Rahu"]["distance"],
                    'speed': -positions["Rahu"]["speed"],
                    'declination': ketu_decl,
                    'rectAscension': ketu_rect,
                    'house': self._calculate_house(ketu_long, ascendant, primary_cusps),
                    'isRetrograde': positions["Rahu"]["isRetrograde"],
                    'nakshatra': self._calculate_nakshatra(ketu_long),
                    'dignity': "neutral",
                    'sign': int(ketu_long / 30) + 1,
                    'degree': ketu_long % 30,
                    'aspects': self._calculate_planet_aspects(ketu_long, positions)
                }

            return positions
        except Exception as e:
            logger.error(f"Failed to calculate planetary positions: {e}")
            raise

    def calculate_divisional_charts(self, positions: Dict[str, Any], chart_type: str = 'D9') -> Dict[str, Any]:
        """Calculate divisional chart positions."""
        try:
            divisional = {}
            for planet, data in positions.items():
                if chart_type == 'D9':
                    # Navamsa calculation (D9)
                    navamsa_long = self._calculate_navamsa(data["longitude"])
                    divisional[planet] = {
                        "longitude": navamsa_long,
                        "house": self._calculate_house_from_longitude(navamsa_long),
                        "nakshatra": self._calculate_nakshatra(navamsa_long)
                    }
            return divisional
        except Exception as e:
            logger.error(f"Failed to calculate divisional chart {chart_type}: {e}")
            raise

    def calculate_aspects(self, positions: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Calculate planetary aspects."""
        try:
            aspects = []
            for p1, data1 in positions.items():
                for p2, data2 in positions.items():
                    if p1 >= p2:  # Avoid duplicate aspects
                        continue
                    
                    # Calculate angular distance
                    diff = abs(data1["longitude"] - data2["longitude"])
                    diff = min(diff, 360 - diff)
                    
                    # Check for standard aspects (conjunction, trine, square, opposition)
                    aspect_angles = {0: "Conjunction", 120: "Trine", 90: "Square", 180: "Opposition"}
                    for angle, aspect_type in aspect_angles.items():
                        if abs(diff - angle) <= 6:  # 6° orb
                            aspects.append({
                                "planet1": p1,
                                "planet2": p2,
                                "type": aspect_type,
                                "angle": diff,
                                "orb": abs(diff - angle)
                            })
            return aspects
        except Exception as e:
            logger.error(f"Failed to calculate aspects: {e}")
            raise

    def _calculate_nakshatra(self, longitude: float) -> Dict[str, Any]:
        """Calculate detailed nakshatra details."""
        nakshatra_deg = 360 / 27  # Each nakshatra is 13°20'
        nakshatra_num = int(longitude / nakshatra_deg)
        pada_deg = nakshatra_deg / 4  # Each pada is 3°20'
        pada_num = int((longitude % nakshatra_deg) / pada_deg)
        
        return {
            'number': nakshatra_num + 1,
            'pada': pada_num + 1,
            'degrees': longitude % nakshatra_deg,
            'degrees_in_pada': (longitude % nakshatra_deg) % pada_deg,
            'total_degrees': longitude
        }

    def _calculate_dignity(self, planet: int, longitude: float) -> str:
        """Calculate detailed planetary dignity."""
        # Exaltation degrees with ranges
        exaltation = {
            swe.SUN: {'degree': 10, 'sign': 1},      # Aries
            swe.MOON: {'degree': 3, 'sign': 2},      # Taurus
            swe.MARS: {'degree': 28, 'sign': 10},    # Capricorn
            swe.MERCURY: {'degree': 15, 'sign': 6},  # Virgo
            swe.JUPITER: {'degree': 5, 'sign': 4},   # Cancer
            swe.VENUS: {'degree': 27, 'sign': 12},   # Pisces
            swe.SATURN: {'degree': 20, 'sign': 7}    # Libra
        }
        
        if planet in exaltation:
            sign = int(longitude / 30) + 1
            degree = longitude % 30
            ex = exaltation[planet]
            
            if sign == ex['sign'] and abs(degree - ex['degree']) <= 6:
                return 'exalted'
            elif (sign + 6) % 12 == ex['sign'] % 12 and abs(degree - ex['degree']) <= 6:
                return 'debilitated'
            elif sign == ex['sign']:
                return 'strong'
            elif (sign + 6) % 12 == ex['sign'] % 12:
                return 'weak'
        
        return 'neutral'

    def _datetime_to_jd(self, dt: datetime) -> float:
        """Convert datetime to Julian Day with high precision."""
        return swe.julday(
            dt.year,
            dt.month,
            dt.day,
            dt.hour + dt.minute/60.0 + dt.second/3600.0 + dt.microsecond/3600000000.0
        )

    def _calculate_house(self, longitude: float, ascendant: float, cusps: List[float]) -> int:
        """Calculate precise house placement using cusps."""
        try:
            # Normalize the angles to 0-360 range
            norm_long = longitude % 360
            
            # Find the house by checking cusps
            for i in range(12):
                next_i = (i + 1) % 12
                if (cusps[i] <= norm_long < cusps[next_i]) or \
                   (cusps[i] > cusps[next_i] and (norm_long >= cusps[i] or norm_long < cusps[next_i])):
                    return i + 1
            
            # Fallback to traditional calculation if cusp check fails
            house = int((norm_long - ascendant) / 30) + 1
            if house <= 0:
                house += 12
            return ((house - 1) % 12) + 1
        except Exception as e:
            logger.error(f"Failed to calculate house: {e}")
            return 1  # Default to first house on error

    def _calculate_navamsa(self, longitude: float) -> float:
        """Calculate navamsa longitude."""
        sign = int(longitude / 30)
        remainder = longitude % 30
        navamsa = remainder * 9 / 30
        return (sign * 30) + navamsa

    def _calculate_house_from_longitude(self, longitude: float) -> int:
        """Calculate house from longitude."""
        sign = int(longitude / 30) + 1
        return sign if sign <= 12 else 1

    def _calculate_planet_aspects(self, longitude: float, positions: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Calculate aspects for a specific planet."""
        aspects = []
        aspect_angles = {
            0: {'type': 'Conjunction', 'orb': 8},
            60: {'type': 'Sextile', 'orb': 6},
            90: {'type': 'Square', 'orb': 8},
            120: {'type': 'Trine', 'orb': 8},
            180: {'type': 'Opposition', 'orb': 8}
        }
        
        for other_planet, other_data in positions.items():
            if 'longitude' not in other_data or other_data.get('special_point', False):
                continue
                
            # Calculate angular distance
            diff = abs(longitude - other_data['longitude'])
            diff = min(diff, 360 - diff)
            
            # Check for aspects
            for angle, aspect_info in aspect_angles.items():
                if abs(diff - angle) <= aspect_info['orb']:
                    aspects.append({
                        'planet': other_planet,
                        'type': aspect_info['type'],
                        'angle': angle,
                        'orb': abs(diff - angle),
                        'applying': self._is_aspect_applying(longitude, other_data['longitude'])
                    })
        
        return aspects

    def _is_aspect_applying(self, long1: float, long2: float) -> bool:
        """Determine if an aspect is applying or separating."""
        diff = (long2 - long1) % 360
        return diff < 180 