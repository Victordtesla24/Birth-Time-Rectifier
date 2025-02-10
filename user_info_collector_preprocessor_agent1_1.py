def input_collection_function(birth_date: str, birth_time: str, birth_place: str):
    """
    Collects birth details, processes location and time data, generates preliminary chart,
    and performs initial analysis.
    
    Flow Chart Steps Covered:
      [Input Collection Module]       -> Collects Birth Date, Time, Place
      [Data Preprocessing]            -> Geocoding and Time Zone Conversion
      [Preliminary Chart Generation]  -> Calculate Natal Chart and Planetary Positions
      [Preliminary Research]          -> Event Analysis and Elemental Evaluation
      [Consolidation Module]         -> Merge Parameters into Dataset
    
    Args:
        birth_date (str): Birth date. Acceptable formats: 'YYYY-MM-DD', 'DD/MM/YYYY', or 'MM/DD/YYYY'
        birth_time (str): Birth time. Acceptable formats: 'HH:MM' (24-hour) or 'HH:MM AM/PM'
        birth_place (str): Birth place in format "City, State, Country"
        
    Returns:
        AgentResponse: A response object containing the processed data.
    """
    from datetime import datetime
    try:
        # Validate input presence.
        if not (birth_date and birth_time and birth_place):
            raise ValueError('All fields (birth_date, birth_time, birth_place) are required')
        
        # Initialize response data
        response_data = {}
        
        # === Data Preprocessing: Parsing Date & Time ===
        # Attempt to parse the date using multiple common formats.
        parsed_date = None
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"):
            try:
                parsed_date = datetime.strptime(birth_date, fmt).date()
                break
            except ValueError:
                continue
        if not parsed_date:
            raise ValueError("Birth date format not recognized. Use YYYY-MM-DD, DD/MM/YYYY, or MM/DD/YYYY.")
        
        # Attempt to parse the time using common formats.
        parsed_time = None
        for fmt in ("%H:%M", "%I:%M %p"):
            try:
                parsed_time = datetime.strptime(birth_time, fmt).time()
                break
            except ValueError:
                continue
        if not parsed_time:
            raise ValueError("Birth time format not recognized. Use HH:MM (24-hour) or HH:MM AM/PM.")
        
        # Combine parsed date and time.
        local_dt_naive = datetime.combine(parsed_date, parsed_time)
        client.stream_message("Parsed date and time successfully.")
        
        # === Data Preprocessing: Geocoding the Place ===
        # Extract city and country from the birth_place string.
        tokens = [token.strip() for token in birth_place.split(',')]
        if len(tokens) < 2:
            raise ValueError("Birth place must include at least city and country (e.g., 'City, Country').")
        city = tokens[0].lower()
        country = tokens[-1].lower()  # Use the last token as country
        
        # Manual coordinates and timezone information for each supported country.
        INDIA_CITIES = {
            'pune':      {'lat': 18.5204,  'lng': 73.8567,  'timezone': 'Asia/Kolkata'},
            'mumbai':    {'lat': 19.0760,  'lng': 72.8777,  'timezone': 'Asia/Kolkata'},
            'delhi':     {'lat': 28.6139,  'lng': 77.2090,  'timezone': 'Asia/Kolkata'},
            'bangalore': {'lat': 12.9716,  'lng': 77.5946,  'timezone': 'Asia/Kolkata'},
            'chennai':   {'lat': 13.0827,  'lng': 80.2707,  'timezone': 'Asia/Kolkata'},
            'kolkata':   {'lat': 22.5726,  'lng': 88.3639,  'timezone': 'Asia/Kolkata'}
        }
        
        AUSTRALIA_CITIES = {
            'sydney':    {'lat': -33.8688, 'lng': 151.2093, 'timezone': 'Australia/Sydney'},
            'melbourne': {'lat': -37.8136, 'lng': 144.9631, 'timezone': 'Australia/Melbourne'},
            'brisbane':  {'lat': -27.4698, 'lng': 153.0251, 'timezone': 'Australia/Brisbane'},
            'perth':     {'lat': -31.9505, 'lng': 115.8605, 'timezone': 'Australia/Perth'},
            'adelaide':  {'lat': -34.9285, 'lng': 138.6007, 'timezone': 'Australia/Adelaide'}
        }
        
        USA_CITIES = {
            'new york':     {'lat': 40.7128, 'lng': -74.0060,  'timezone': 'America/New_York'},
            'los angeles':  {'lat': 34.0522, 'lng': -118.2437, 'timezone': 'America/Los_Angeles'},
            'chicago':      {'lat': 41.8781, 'lng': -87.6298,  'timezone': 'America/Chicago'},
            'houston':      {'lat': 29.7604, 'lng': -95.3698,  'timezone': 'America/Chicago'},
            'phoenix':      {'lat': 33.4484, 'lng': -112.0740, 'timezone': 'America/Phoenix'}
        }
        
        # Mapping of supported countries to their city dictionaries and default cities.
        supported_countries = {
            'india':       {'cities': INDIA_CITIES,    'default': 'pune'},
            'australia':   {'cities': AUSTRALIA_CITIES,'default': 'sydney'},
            'usa':         {'cities': USA_CITIES,      'default': 'new york'},
            'united states': {'cities': USA_CITIES,    'default': 'new york'}
        }
        
        if country not in supported_countries:
            raise ValueError("Country not supported. Only Australia, India, and USA are supported.")
        
        city_dict = supported_countries[country]['cities']
        if city not in city_dict:
            client.stream_message(f"Warning: City '{city}' not found in {country.title()} database. Using default city '{supported_countries[country]['default']}'.")
            coords = city_dict[supported_countries[country]['default']]
        else:
            coords = city_dict[city]
        
        latitude = coords['lat']
        longitude = coords['lng']
        city_timezone = coords['timezone']
        client.stream_message(f"Coordinates found for '{birth_place}': lat={latitude}, lng={longitude} (Timezone: {city_timezone})")
        
        # === Data Preprocessing: Time Zone & Time Conversion ===
        try:
            # Python 3.9+ has the zoneinfo module; for older versions consider using pytz.
            from zoneinfo import ZoneInfo
            local_dt = local_dt_naive.replace(tzinfo=ZoneInfo(city_timezone))
            utc_dt = local_dt.astimezone(ZoneInfo("UTC"))
            client.stream_message(f"Local datetime: {local_dt.isoformat()} | UTC datetime: {utc_dt.isoformat()}")
        except Exception as tz_error:
            raise Exception("Time zone conversion error: " + str(tz_error))
        
        # Calculate planetary positions using Swiss Ephemeris algorithms
        planets = calculate_planetary_positions(utc_dt, latitude, longitude)
        
        # Calculate divisional charts (D1-D12)
        divisional_charts = calculate_divisional_charts(planets)
        
        # Calculate Dasha periods
        dasha_periods = calculate_dasha_periods(utc_dt, planets)
        
        # Perform KP sub-lord analysis
        kp_analysis = analyze_kp_sublords(planets)
        
        # Perform Tattwa Shodhana
        tattwa_analysis = analyze_tattwa_elements(planets)
        
        # Consolidate all data
        response_data = {
            "birth_details": {
                "date": parsed_date.isoformat(),
                "time": parsed_time.strftime("%H:%M"),
                "place": birth_place,
                "latitude": latitude,
                "longitude": longitude,
                "timezone": city_timezone,
                "local_datetime": local_dt.isoformat(),
                "utc_datetime": utc_dt.isoformat()
            },
            "planetary_positions": planets,
            "divisional_charts": divisional_charts,
            "dasha_periods": dasha_periods,
            "kp_analysis": kp_analysis,
            "tattwa_analysis": tattwa_analysis
        }
        
        return response_data
        
    except Exception as e:
        error_msg = f'Error processing input: {str(e)}'
        raise Exception(error_msg)

def calculate_planetary_positions(utc_dt, latitude, longitude):
    """Calculate planetary positions using Swiss Ephemeris algorithms."""
    # Placeholder for actual Swiss Ephemeris calculations
    planets = {
        "Sun": {"longitude": 45.5, "latitude": 0, "speed": 0.98, "house": 1},
        "Moon": {"longitude": 123.4, "latitude": -2.1, "speed": 12.5, "house": 4},
        "Mars": {"longitude": 78.2, "latitude": 1.1, "speed": 0.5, "house": 3},
        "Mercury": {"longitude": 55.8, "latitude": -0.5, "speed": -0.2, "house": 2},
        "Jupiter": {"longitude": 189.3, "latitude": 0.2, "speed": 0.1, "house": 7},
        "Venus": {"longitude": 234.6, "latitude": -0.8, "speed": 1.2, "house": 8},
        "Saturn": {"longitude": 298.1, "latitude": 0.4, "speed": -0.1, "house": 10},
        "Rahu": {"longitude": 145.7, "latitude": 0, "speed": 0, "house": 5},
        "Ketu": {"longitude": 325.7, "latitude": 0, "speed": 0, "house": 11}
    }
    return planets

def calculate_divisional_charts(planets):
    """Calculate various divisional charts (D1-D12)."""
    # Placeholder for divisional chart calculations
    charts = {
        "D1": {"strength": 0.85, "positions": {}},
        "D9": {"strength": 0.92, "positions": {}},
        "D10": {"strength": 0.88, "positions": {}},
        "D12": {"strength": 0.78, "positions": {}}
    }
    for planet, data in planets.items():
        for chart in charts:
            # Example calculation - in reality would use proper divisional formulas
            charts[chart]["positions"][planet] = {
                "longitude": (data["longitude"] * int(chart[1:])) % 360,
                "house": ((data["house"] * int(chart[1:])) % 12) or 12
            }
    return charts

def calculate_dasha_periods(birth_time, planets):
    """Calculate Vimshottari Dasha periods."""
    # Placeholder for Dasha calculations
    return {
        "current_dasha": {
            "planet": "Jupiter",
            "start_date": "2023-01-15",
            "end_date": "2039-01-15"
        },
        "current_bhukti": {
            "planet": "Venus",
            "start_date": "2025-05-20",
            "end_date": "2027-09-20"
        }
    }

def analyze_kp_sublords(planets):
    """Perform KP (Krishnamurti Paddhati) sub-lord analysis."""
    # Placeholder for KP analysis
    return {
        "significators": {
            "career": ["Saturn", "Sun"],
            "relationship": ["Venus", "Jupiter"],
            "health": ["Mars", "Moon"]
        },
        "sublord_strengths": {
            "Saturn": 0.85,
            "Jupiter": 0.92,
            "Mars": 0.78
        }
    }

def analyze_tattwa_elements(planets):
    """Perform Tattwa Shodhana (elemental analysis)."""
    # Placeholder for Tattwa analysis
    return {
        "elements": {
            "fire": 0.35,
            "earth": 0.25,
            "air": 0.20,
            "water": 0.20
        },
        "dominant_element": "fire",
        "element_balance": 0.82
    }
