"""
Birth Data Model
Contains the data structure for birth details.
"""

from datetime import datetime
from typing import Any, Optional

class BirthData:
    def __init__(self, date: str, time: str, place: str, latitude: float = None, longitude: float = None):
        """
        Initialize birth data.
        
        Args:
            date (str): Birth date in DD/MM/YYYY or YYYY-MM-DD format
            time (str): Birth time in HH:MM format (24-hour)
            place (str): Birth place (city, country)
            latitude (float, optional): Latitude of birth place
            longitude (float, optional): Longitude of birth place
        """
        self.date = self._normalize_date(date)
        self.time = time
        self.place = place
        self.latitude = latitude
        self.longitude = longitude
        self.timezone = None

    def _normalize_date(self, date: str) -> str:
        """Convert date to YYYY-MM-DD format."""
        try:
            # Try DD/MM/YYYY format first
            dt = datetime.strptime(date, "%d/%m/%Y")
        except ValueError:
            try:
                # Try YYYY-MM-DD format
                dt = datetime.strptime(date, "%Y-%m-%d")
            except ValueError:
                raise ValueError(f"Invalid date format: {date}. Expected DD/MM/YYYY or YYYY-MM-DD")
        return dt.strftime("%Y-%m-%d")

    def get(self, key: str, default: Any = None) -> Any:
        """Dictionary-like get method."""
        return getattr(self, key, default)

    def to_dict(self) -> dict:
        """Convert to dictionary format."""
        return {
            'date': self.date,
            'time': self.time,
            'place': self.place,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'timezone': self.timezone
        }

    @classmethod
    def from_dict(cls, data: dict) -> 'BirthData':
        """Create instance from dictionary."""
        return cls(
            date=data['date'],
            time=data['time'],
            place=data['place'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude')
        )
