"""
Julian Day Calculator Module
Handles conversion between calendar dates and Julian days.
"""

from datetime import datetime
import pytz
from ..models.birth_data import BirthData

class JulianDayCalculator:
    @staticmethod
    def calculate_julian_day(birth_data: BirthData) -> float:
        """
        Calculate Julian day from birth data.
        
        Args:
            birth_data (BirthData): Birth data with date, time, and timezone
            
        Returns:
            float: Julian day number
            
        Raises:
            ValueError: If date/time conversion fails
        """
        try:
            # Combine date and time
            dt = datetime.strptime(f"{birth_data.date} {birth_data.time}", "%Y-%m-%d %H:%M")
            
            # Apply timezone if available
            if birth_data.timezone:
                try:
                    tz = pytz.timezone(birth_data.timezone)
                    dt = tz.localize(dt)
                except pytz.exceptions.UnknownTimeZoneError:
                    # Fall back to UTC if timezone is invalid
                    tz = pytz.UTC
                    dt = tz.localize(dt)
            
            # Convert to Julian day
            # JD = Unix timestamp / seconds per day + Unix epoch in JD
            jd = (dt.timestamp() / 86400.0) + 2440587.5
            
            return jd
            
        except Exception as e:
            raise ValueError(f"Error calculating Julian day: {str(e)}")

    @staticmethod
    def julian_day_to_datetime(jd: float, timezone: str = "UTC") -> datetime:
        """
        Convert Julian day back to datetime.
        
        Args:
            jd (float): Julian day number
            timezone (str): Timezone identifier (defaults to "UTC")
            
        Returns:
            datetime: Datetime object in specified timezone
            
        Raises:
            ValueError: If conversion fails
        """
        try:
            # Convert JD to Unix timestamp
            timestamp = (jd - 2440587.5) * 86400.0
            
            # Create UTC datetime
            dt = datetime.fromtimestamp(timestamp, pytz.UTC)
            
            # Convert to target timezone
            try:
                target_tz = pytz.timezone(timezone)
                dt = dt.astimezone(target_tz)
            except pytz.exceptions.UnknownTimeZoneError:
                # Keep UTC if timezone is invalid
                pass
            
            return dt
            
        except Exception as e:
            raise ValueError(f"Error converting Julian day to datetime: {str(e)}")
