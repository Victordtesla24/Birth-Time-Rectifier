"""
Divisional Charts Calculator Module
Handles base calculations for divisional charts (varga).
"""

from typing import Dict, Any, List, Tuple
import math

class DivisionalChartsCalculator:
    # Standard divisional chart factors
    VARGA_FACTORS = {
        'D1': 1,    # Rashi
        'D2': 2,    # Hora
        'D3': 3,    # Drekkana
        'D4': 4,    # Chaturthamsa
        'D7': 7,    # Saptamsa
        'D9': 9,    # Navamsa
        'D10': 10,  # Dasamsa
        'D12': 12,  # Dwadasamsa
        'D16': 16,  # Shodasamsa
        'D20': 20,  # Vimsamsa
        'D24': 24,  # Chaturvimsamsa
        'D27': 27,  # Saptavimsamsa
        'D30': 30,  # Trimsamsa
        'D40': 40,  # Khavedamsa
        'D45': 45,  # Akshavedamsa
        'D60': 60   # Shastiamsa
    }

    @staticmethod
    def normalize_longitude(longitude: float) -> float:
        """
        Normalize longitude to range [0, 360).
        
        Args:
            longitude (float): Longitude in degrees
            
        Returns:
            float: Normalized longitude
        """
        return longitude % 360

    @staticmethod
    def get_sign(longitude: float) -> int:
        """
        Get zodiac sign number (0-11) for given longitude.
        
        Args:
            longitude (float): Longitude in degrees
            
        Returns:
            int: Sign number (0=Aries, 11=Pisces)
        """
        return int(longitude / 30)

    @staticmethod
    def get_sign_remainder(longitude: float) -> float:
        """
        Get remainder within sign (0-30 degrees).
        
        Args:
            longitude (float): Longitude in degrees
            
        Returns:
            float: Remainder within sign
        """
        return longitude % 30

    @classmethod
    def calculate_varga_position(cls, longitude: float, factor: int) -> float:
        """
        Calculate position in any divisional chart.
        
        Args:
            longitude (float): Original longitude
            factor (int): Divisional factor (e.g., 9 for D9)
            
        Returns:
            float: Position in divisional chart
        """
        sign = cls.get_sign(longitude)
        remainder = cls.get_sign_remainder(longitude)
        division = 30.0 / factor
        
        # Calculate division number within sign
        division_num = int(remainder / division)
        
        # Calculate final position
        varga_sign = (sign * factor + division_num) % 12
        varga_remainder = (remainder % division) * factor
        
        return cls.normalize_longitude(varga_sign * 30 + varga_remainder)

    @classmethod
    def calculate_hora(cls, longitude: float) -> float:
        """
        Special calculation for Hora (D2) chart.
        
        Args:
            longitude (float): Original longitude
            
        Returns:
            float: Hora position
        """
        sign = cls.get_sign(longitude)
        remainder = cls.get_sign_remainder(longitude)
        
        # Hora division based on odd/even signs and first/second half
        is_odd_sign = sign % 2 == 0
        is_first_half = remainder < 15
        
        if is_odd_sign:
            hora_sign = 0 if is_first_half else 6  # Leo/Aquarius
        else:
            hora_sign = 3 if is_first_half else 9  # Cancer/Capricorn
            
        return hora_sign * 30 + remainder * 2

    @classmethod
    def calculate_trimsamsa(cls, longitude: float) -> float:
        """
        Special calculation for Trimsamsa (D30) chart.
        
        Args:
            longitude (float): Original longitude
            
        Returns:
            float: Trimsamsa position
        """
        sign = cls.get_sign(longitude)
        remainder = cls.get_sign_remainder(longitude)
        
        # Trimsamsa divisions: 5° Mars, 5° Saturn, 8° Jupiter, 7° Mercury, 5° Venus
        divisions = [(5, 0), (10, 6), (18, 3), (25, 1), (30, 4)]
        
        for end_deg, planet_sign in divisions:
            if remainder <= end_deg:
                base_sign = (sign * 5 + planet_sign) % 12
                portion = remainder / end_deg
                return base_sign * 30 + portion * 30
                
        return 0.0  # Should never reach here

    @classmethod
    def calculate_all_charts(cls, positions: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
        """
        Calculate all divisional charts from planetary positions.
        
        Args:
            positions (Dict[str, Any]): Dictionary of planetary positions
            
        Returns:
            Dict[str, Dict[str, Any]]: Dictionary of divisional charts
        """
        try:
            charts = {}
            
            # Calculate all standard varga charts
            for varga, factor in cls.VARGA_FACTORS.items():
                charts[varga] = {}
                for planet, pos in positions.items():
                    long = pos['longitude']
                    
                    # Special calculations for certain vargas
                    if varga == 'D2':
                        varga_long = cls.calculate_hora(long)
                    elif varga == 'D30':
                        varga_long = cls.calculate_trimsamsa(long)
                    else:
                        varga_long = cls.calculate_varga_position(long, factor)
                    
                    charts[varga][planet] = {
                        'longitude': varga_long,
                        'latitude': pos.get('latitude', 0),
                        'speed_longitude': pos.get('speed_longitude', 0),
                        'speed_latitude': pos.get('speed_latitude', 0),
                        'distance': pos.get('distance', 0),
                        'speed_distance': pos.get('speed_distance', 0)
                    }
            
            return charts
            
        except Exception as e:
            # Return empty charts on error
            return {varga: {} for varga in cls.VARGA_FACTORS.keys()}

    @classmethod
    def calculate_navamsa(cls, positions: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate D9 (Navamsa) chart.
        
        Args:
            positions (Dict[str, Any]): Dictionary of planetary positions
            
        Returns:
            Dict[str, Any]: Navamsa positions
        """
        try:
            navamsa = {}
            
            for planet, pos in positions.items():
                # Calculate navamsa position (each navamsa is 3°20')
                long = pos['longitude']
                sign = cls.get_sign(long)
                remainder = cls.get_sign_remainder(long)
                navamsa_num = int(remainder / 3.333333)
                
                # Calculate final longitude in navamsa
                nav_sign = (sign * 9 + navamsa_num) % 12
                nav_long = nav_sign * 30 + (remainder % 3.333333) * 9
                
                navamsa[planet] = {
                    'longitude': cls.normalize_longitude(nav_long),
                    'latitude': pos['latitude']
                }
            
            return navamsa
            
        except Exception as e:
            return {}

    @classmethod
    def calculate_dasamsa(cls, positions: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate D10 (Dasamsa) chart.
        
        Args:
            positions (Dict[str, Any]): Dictionary of planetary positions
            
        Returns:
            Dict[str, Any]: Dasamsa positions
        """
        try:
            dasamsa = {}
            
            for planet, pos in positions.items():
                # Calculate dasamsa position (each dasamsa is 3°)
                long = pos['longitude']
                sign = cls.get_sign(long)
                remainder = cls.get_sign_remainder(long)
                dasamsa_num = int(remainder / 3)
                
                # Calculate final longitude in dasamsa
                das_sign = (sign * 10 + dasamsa_num) % 12
                das_long = das_sign * 30 + (remainder % 3) * 10
                
                dasamsa[planet] = {
                    'longitude': cls.normalize_longitude(das_long),
                    'latitude': pos['latitude']
                }
            
            return dasamsa
            
        except Exception as e:
            return {}

    @classmethod
    def calculate_shastiamsa(cls, positions: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate D60 (Shastiamsa) chart.
        
        Args:
            positions (Dict[str, Any]): Dictionary of planetary positions
            
        Returns:
            Dict[str, Any]: Shastiamsa positions
        """
        try:
            shastiamsa = {}
            
            for planet, pos in positions.items():
                # Calculate shastiamsa position (each shastiamsa is 0.5°)
                long = pos['longitude']
                sign = cls.get_sign(long)
                remainder = cls.get_sign_remainder(long)
                shastiamsa_num = int(remainder / 0.5)
                
                # Calculate final longitude in shastiamsa
                sha_sign = (sign * 60 + shastiamsa_num) % 12
                sha_long = sha_sign * 30 + (remainder % 0.5) * 60
                
                shastiamsa[planet] = {
                    'longitude': cls.normalize_longitude(sha_long),
                    'latitude': pos['latitude']
                }
            
            return shastiamsa
            
        except Exception as e:
            return {}
