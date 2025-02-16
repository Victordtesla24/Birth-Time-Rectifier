"""
KP Analysis Module
Handles Krishnamurti Paddhati (KP) system analysis.
"""

from typing import Dict, Any, List, Tuple

class KPAnalyzer:
    # Sub-lord relationships
    SUB_LORDS = {
        'Sun': ['Moon', 'Mars'],
        'Moon': ['Venus', 'Mercury'],
        'Mars': ['Jupiter', 'Saturn'],
        'Mercury': ['Venus', 'Saturn'],
        'Jupiter': ['Sun', 'Moon'],
        'Venus': ['Mercury', 'Jupiter'],
        'Saturn': ['Mars', 'Sun'],
        'Rahu': ['Jupiter', 'Venus'],
        'Ketu': ['Mars', 'Saturn']
    }
    
    # Planet significations
    SIGNIFICATIONS = {
        'Sun': ['authority', 'father', 'government', 'vitality'],
        'Moon': ['mind', 'mother', 'emotions', 'public'],
        'Mars': ['energy', 'brothers', 'property', 'accidents'],
        'Mercury': ['communication', 'business', 'education'],
        'Jupiter': ['wisdom', 'wealth', 'children', 'spirituality'],
        'Venus': ['relationship', 'marriage', 'luxury', 'arts'],
        'Saturn': ['longevity', 'obstacles', 'service', 'delays'],
        'Rahu': ['foreign', 'unconventional', 'obsession'],
        'Ketu': ['spirituality', 'detachment', 'liberation']
    }

    @classmethod
    def perform_kp_analysis(cls, positions: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform KP analysis for given planetary positions.
        
        Args:
            positions (Dict[str, Any]): Dictionary of planetary positions
            
        Returns:
            Dict[str, Any]: KP analysis results
        """
        try:
            kp_results = {}
            
            # Calculate strength based on angular distance from sub-lords
            for planet, lords in cls.SUB_LORDS.items():
                if planet in positions:
                    planet_pos = positions[planet]['longitude']
                    lord_strengths = []
                    
                    for lord in lords:
                        if lord in positions:
                            lord_pos = positions[lord]['longitude']
                            angle = abs(planet_pos - lord_pos)
                            if angle > 180:
                                angle = 360 - angle
                            # Stronger influence when planets are closer
                            strength = 1 - (angle / 180)
                            lord_strengths.append(strength)
                    
                    if lord_strengths:
                        kp_results[planet] = {
                            'strength': sum(lord_strengths) / len(lord_strengths),
                            'sub_lords': {
                                lords[i]: lord_strengths[i] 
                                for i in range(len(lords)) 
                                if i < len(lord_strengths)
                            }
                        }
            
            return kp_results
            
        except Exception as e:
            return {}

    @classmethod
    def analyze_significators(cls, kp_results: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Analyze significators based on KP results.
        
        Args:
            kp_results (Dict[str, Any]): KP analysis results
            
        Returns:
            Dict[str, List[str]]: Strong and weak significators
        """
        try:
            strong_planets = []
            weak_planets = []
            
            for planet, result in kp_results.items():
                strength = result.get('strength', 0)
                if strength >= 0.7:
                    strong_planets.append(planet)
                elif strength <= 0.3:
                    weak_planets.append(planet)
            
            strong_significations = []
            weak_significations = []
            
            # Get significations for strong and weak planets
            for planet in strong_planets:
                if planet in cls.SIGNIFICATIONS:
                    strong_significations.extend(cls.SIGNIFICATIONS[planet])
            
            for planet in weak_planets:
                if planet in cls.SIGNIFICATIONS:
                    weak_significations.extend(cls.SIGNIFICATIONS[planet])
            
            return {
                'strong_significators': list(set(strong_significations)),
                'weak_significators': list(set(weak_significations))
            }
            
        except Exception as e:
            return {
                'strong_significators': [],
                'weak_significators': []
            }

    @classmethod
    def get_ruling_planets(cls, kp_results: Dict[str, Any]) -> List[Tuple[str, float]]:
        """
        Get ruling planets ordered by strength.
        
        Args:
            kp_results (Dict[str, Any]): KP analysis results
            
        Returns:
            List[Tuple[str, float]]: List of (planet, strength) tuples
        """
        try:
            # Get planet strengths
            planet_strengths = [
                (planet, result['strength'])
                for planet, result in kp_results.items()
                if 'strength' in result
            ]
            
            # Sort by strength in descending order
            return sorted(planet_strengths, key=lambda x: x[1], reverse=True)
            
        except Exception as e:
            return []

    @classmethod
    def analyze_house_cusps(cls, cusps: Dict[int, float], kp_results: Dict[str, Any]) -> Dict[int, Dict[str, Any]]:
        """
        Analyze house cusps using KP system.
        
        Args:
            cusps (Dict[int, float]): House cusp longitudes
            kp_results (Dict[str, Any]): KP analysis results
            
        Returns:
            Dict[int, Dict[str, Any]]: House analysis results
        """
        try:
            house_analysis = {}
            
            for house, longitude in cusps.items():
                # Find planets influencing the cusp
                influences = []
                
                for planet, result in kp_results.items():
                    if planet in positions:
                        planet_pos = positions[planet]['longitude']
                        angle = abs(longitude - planet_pos)
                        if angle > 180:
                            angle = 360 - angle
                        
                        if angle <= 30:  # Within 30 degrees
                            influence = 1 - (angle / 30)
                            influences.append({
                                'planet': planet,
                                'strength': influence * result.get('strength', 0)
                            })
                
                # Sort influences by strength
                influences.sort(key=lambda x: x['strength'], reverse=True)
                
                house_analysis[house] = {
                    'cusp_longitude': longitude,
                    'influences': influences
                }
            
            return house_analysis
            
        except Exception as e:
            return {}
