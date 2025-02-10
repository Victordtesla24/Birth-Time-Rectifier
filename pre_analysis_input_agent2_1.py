def pre_chart_input_function(agent1_data: dict):
    """
    Validates and processes the comprehensive data package from Agent 1.
    Prepares data for fine-tuning and analysis.
    """
    try:
        # Validate birth details
        birth_details = agent1_data.get("birth_details", {})
        for required in ["date", "time", "place", "latitude", "longitude", "timezone"]:
            if required not in birth_details:
                raise ValueError(f"Missing required birth detail: {required}")
        
        # Validate coordinates
        latitude = float(birth_details["latitude"])
        longitude = float(birth_details["longitude"])
        if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
            raise ValueError("Invalid coordinates")
        
        # Validate planetary positions
        planets = agent1_data.get("planetary_positions", {})
        if not planets:
            raise ValueError("Missing planetary positions")
        
        for planet, data in planets.items():
            if not all(key in data for key in ["longitude", "latitude", "speed", "house"]):
                raise ValueError(f"Incomplete data for planet {planet}")
        
        # Validate divisional charts
        charts = agent1_data.get("divisional_charts", {})
        if not charts:
            raise ValueError("Missing divisional charts")
        
        # Validate Dasha periods
        dasha = agent1_data.get("dasha_periods", {})
        if not all(key in dasha for key in ["current_dasha", "current_bhukti"]):
            raise ValueError("Invalid Dasha period data")
        
        # Validate KP analysis
        kp = agent1_data.get("kp_analysis", {})
        if not all(key in kp for key in ["significators", "sublord_strengths"]):
            raise ValueError("Invalid KP analysis data")
        
        # Validate Tattwa analysis
        tattwa = agent1_data.get("tattwa_analysis", {})
        if not all(key in tattwa for key in ["elements", "dominant_element", "element_balance"]):
            raise ValueError("Invalid Tattwa analysis data")
        
        # Calculate additional parameters for fine-tuning
        analysis_data = {
            "birth_details": birth_details,
            "planetary_data": {
                "positions": planets,
                "aspects": calculate_aspects(planets),
                "strengths": calculate_planetary_strengths(planets),
                "house_influences": calculate_house_influences(planets)
            },
            "divisional_analysis": analyze_divisional_charts(charts),
            "dasha_analysis": analyze_dasha_periods(dasha),
            "kp_analysis": enhance_kp_analysis(kp),
            "tattwa_analysis": enhance_tattwa_analysis(tattwa)
        }
        
        return analysis_data
        
    except Exception as e:
        raise Exception(f"Pre-analysis error: {str(e)}")

def calculate_aspects(planets):
    """Calculate aspects between planets."""
    aspects = []
    aspect_types = {
        0: "conjunction",
        60: "sextile",
        90: "square",
        120: "trine",
        180: "opposition"
    }
    
    planet_list = list(planets.keys())
    for i in range(len(planet_list)):
        for j in range(i + 1, len(planet_list)):
            planet1 = planet_list[i]
            planet2 = planet_list[j]
            
            # Calculate angular distance
            angle = abs(planets[planet1]["longitude"] - planets[planet2]["longitude"])
            angle = min(angle, 360 - angle)
            
            # Check for aspects with 8-degree orb
            for aspect_angle, aspect_type in aspect_types.items():
                if abs(angle - aspect_angle) <= 8:
                    aspects.append({
                        "planet1": planet1,
                        "planet2": planet2,
                        "type": aspect_type,
                        "orb": abs(angle - aspect_angle)
                    })
    
    return aspects

def calculate_planetary_strengths(planets):
    """Calculate strength of each planet based on position and aspects."""
    strengths = {}
    for planet, data in planets.items():
        # Basic strength calculation (placeholder)
        strength = 0.5  # Base strength
        
        # Add house-based strength
        house_strength = {1: 0.2, 4: 0.15, 7: 0.15, 10: 0.2}  # Angular houses
        strength += house_strength.get(data["house"], 0)
        
        # Add speed-based strength
        if abs(data["speed"]) > 1:
            strength += 0.1
        
        strengths[planet] = min(1.0, strength)
    
    return strengths

def calculate_house_influences(planets):
    """Calculate planetary influences on houses."""
    influences = {}
    for house in range(1, 13):
        influences[house] = []
        for planet, data in planets.items():
            if data["house"] == house:
                influences[house].append({
                    "planet": planet,
                    "strength": "strong" if data["speed"] > 0 else "moderate"
                })
    return influences

def analyze_divisional_charts(charts):
    """Analyze patterns and strengths in divisional charts."""
    analysis = {}
    for chart_type, data in charts.items():
        analysis[chart_type] = {
            "strength": data["strength"],
            "dominant_planets": get_dominant_planets(data["positions"]),
            "house_patterns": analyze_house_patterns(data["positions"])
        }
    return analysis

def get_dominant_planets(positions):
    """Get list of dominant planets in a chart."""
    # Placeholder implementation
    return ["Sun", "Jupiter", "Saturn"]

def analyze_house_patterns(positions):
    """Analyze patterns of planetary placements in houses."""
    # Placeholder implementation
    return {
        "angular_houses": ["Sun", "Mars"],
        "trine_houses": ["Jupiter", "Venus"],
        "kendra_houses": ["Saturn"]
    }

def analyze_dasha_periods(dasha):
    """Analyze current and upcoming Dasha periods."""
    return {
        "current_period": {
            "planet": dasha["current_dasha"]["planet"],
            "remaining_years": calculate_remaining_years(
                dasha["current_dasha"]["end_date"]
            ),
            "significance": "Major career and spiritual developments"
        },
        "sub_period": {
            "planet": dasha["current_bhukti"]["planet"],
            "remaining_months": calculate_remaining_months(
                dasha["current_bhukti"]["end_date"]
            ),
            "significance": "Focus on relationships and personal growth"
        }
    }

def calculate_remaining_years(end_date):
    """Calculate remaining years in a Dasha period."""
    from datetime import datetime
    end = datetime.strptime(end_date, "%Y-%m-%d")
    remaining = (end - datetime.now()).days / 365.25
    return max(0, round(remaining, 1))

def calculate_remaining_months(end_date):
    """Calculate remaining months in a Bhukti period."""
    from datetime import datetime
    end = datetime.strptime(end_date, "%Y-%m-%d")
    remaining = (end - datetime.now()).days / 30.44
    return max(0, round(remaining, 1))

def enhance_kp_analysis(kp):
    """Enhance KP analysis with additional insights."""
    return {
        "significators": kp["significators"],
        "sublord_strengths": kp["sublord_strengths"],
        "house_significators": calculate_house_significators(kp),
        "cusp_sublords": calculate_cusp_sublords(kp)
    }

def calculate_house_significators(kp):
    """Calculate house-wise significators."""
    # Placeholder implementation
    return {
        "1": ["Sun", "Mars"],
        "2": ["Jupiter", "Mercury"],
        "10": ["Saturn", "Sun"]
    }

def calculate_cusp_sublords(kp):
    """Calculate sublords for house cusps."""
    # Placeholder implementation
    return {
        "1": "Saturn",
        "4": "Jupiter",
        "7": "Mars",
        "10": "Sun"
    }

def enhance_tattwa_analysis(tattwa):
    """Enhance Tattwa analysis with additional insights."""
    return {
        "elements": tattwa["elements"],
        "dominant_element": tattwa["dominant_element"],
        "element_balance": tattwa["element_balance"],
        "recommendations": generate_tattwa_recommendations(tattwa),
        "compatibility": analyze_element_compatibility(tattwa)
    }

def generate_tattwa_recommendations(tattwa):
    """Generate recommendations based on elemental balance."""
    # Placeholder implementation
    return {
        "lifestyle": "Focus on grounding activities",
        "career": "Leadership roles suited to fire dominance",
        "relationships": "Balance needed in emotional expression"
    }

def analyze_element_compatibility(tattwa):
    """Analyze compatibility based on elemental composition."""
    # Placeholder implementation
    return {
        "favorable_elements": ["air", "fire"],
        "challenging_elements": ["water"],
        "balancing_elements": ["earth"]
    }
