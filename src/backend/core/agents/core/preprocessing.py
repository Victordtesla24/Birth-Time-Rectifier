"""
Preprocessing Module
Handles data validation, geocoding, and timezone resolution.
"""

from datetime import datetime
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
from ..models.birth_data import BirthData

class DataPreprocessor:
    def __init__(self):
        """Initialize preprocessor with geocoding capabilities."""
        self.geolocator = Nominatim(user_agent="birth_time_rectifier")
        self.tf = TimezoneFinder()

    def validate_time_format(self, time: str) -> None:
        """
        Validate time format (HH:MM).
        
        Args:
            time (str): Time string to validate
            
        Raises:
            ValueError: If time format is invalid
        """
        try:
            datetime.strptime(time, "%H:%M")
        except ValueError:
            raise ValueError(f"Invalid time format: {time}. Expected format: HH:MM (24-hour)")

    def validate_date_format(self, date: str) -> None:
        """
        Validate date format (YYYY-MM-DD).
        
        Args:
            date (str): Date string to validate
            
        Raises:
            ValueError: If date format is invalid
        """
        try:
            datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise ValueError(f"Invalid date format: {date}. Expected format: YYYY-MM-DD")

    def geocode_location(self, birth_data: BirthData) -> BirthData:
        """
        Geocode location and set coordinates.
        
        Args:
            birth_data (BirthData): Birth data object to process
            
        Returns:
            BirthData: Processed birth data with coordinates
            
        Raises:
            ValueError: If location cannot be geocoded
        """
        location = self.geolocator.geocode(birth_data.place)
        if location:
            birth_data.latitude = location.latitude
            birth_data.longitude = location.longitude
            birth_data.timezone = self.get_timezone(birth_data.latitude, birth_data.longitude)
        else:
            raise ValueError(f"Could not geocode location: {birth_data.place}")
        return birth_data

    def get_timezone(self, lat: float, lon: float) -> str:
        """
        Get timezone for given coordinates.
        
        Args:
            lat (float): Latitude
            lon (float): Longitude
            
        Returns:
            str: Timezone identifier or 'UTC' if lookup fails
        """
        try:
            timezone = self.tf.timezone_at(lat=lat, lng=lon)
            return timezone if timezone else "UTC"
        except:
            return "UTC"  # Default to UTC if timezone lookup fails

    def preprocess_data(self, birth_data: BirthData) -> BirthData:
        """
        Preprocess birth data with validation and geocoding.
        
        Args:
            birth_data (BirthData): Birth data to process
            
        Returns:
            BirthData: Processed birth data
            
        Raises:
            ValueError: If any validation or processing step fails
        """
        try:
            # Validate formats
            self.validate_date_format(birth_data.date)
            self.validate_time_format(birth_data.time)
            
            # Geocode and get timezone
            birth_data = self.geocode_location(birth_data)
            
            return birth_data
            
        except Exception as e:
            raise ValueError(f"Error preprocessing birth data: {str(e)}")
