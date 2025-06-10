from typing import Dict, Any, List, TypedDict
from ....models.birth_data import BirthData
from ...calculations.shadbala_calculator import ShadbalaCalculator

class PlanetaryStrength(TypedDict):
    dignity: str
    strength: float
    house_strength: float

class PlanetaryMetricsCalculator:
    """Calculator for planetary strength metrics."""
    
    def __init__(self):
        """Initialize the planetary metrics calculator."""
        self.shadbala_calculator = ShadbalaCalculator()
        
    def evaluate_planetary_strengths(self, positions: Dict[str, float]) -> float:
        """
        Evaluate planetary strength score.
        
        Args:
            positions: Dictionary mapping planet names to their longitudes
            
        Returns:
            float: Normalized strength score between 0 and 1
        """
        strengths = []
        for planet, position in positions.items():
            shadbala = self.shadbala_calculator.calculate_shadbala(planet, position)
            strengths.append(shadbala)
            
        return sum(strengths) / len(strengths) if strengths else 0.0
        
    def calculate_dignity_status(self, planet: str, position: float) -> PlanetaryStrength:
        """
        Calculate detailed dignity status for a planet.
        
        Args:
            planet: Name of the planet
            position: Longitude of the planet
            
        Returns:
            PlanetaryStrength: Detailed strength metrics for the planet
        """
        return {
            'dignity': self.shadbala_calculator.calculate_dignity(planet, position),
            'strength': self.shadbala_calculator.calculate_shadbala(planet, position),
            'house_strength': self.shadbala_calculator.calculate_house_placement(planet, position)
        } 