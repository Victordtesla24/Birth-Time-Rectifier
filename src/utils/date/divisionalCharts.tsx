/**
 * Advanced Divisional Chart Calculations
 * Implements precise varga (divisional) chart calculations using 
 * traditional Vedic astrology algorithms
 */

/**
 * Calculate all divisional charts from D1 to D60
 * @param {Object} planetaryPositions - Planetary longitude positions
 * @returns {Object} Calculated divisional charts
 */
export const calculateDivisionalCharts = (planetaryPositions) => {
    const charts = {
        D1: calculateRashiChart(planetaryPositions),
        D2: calculateHoraChart(planetaryPositions),
        D3: calculateDrekkanaChart(planetaryPositions),
        D4: calculateChaturthamsakChart(planetaryPositions),
        D7: calculateSaptamsakChart(planetaryPositions),
        D9: calculateNavamsakChart(planetaryPositions),
        D10: calculateDasamsakChart(planetaryPositions),
        D12: calculateDwadasamsakChart(planetaryPositions),
        D16: calculateShodasamsakChart(planetaryPositions),
        D20: calculateVimsamsakChart(planetaryPositions),
        D24: calculateChaturvimsamsakChart(planetaryPositions),
        D27: calculateNakshatramsaChart(planetaryPositions),
        D30: calculateTrimsamsakChart(planetaryPositions),
        D40: calculateKhavedamsakChart(planetaryPositions),
        D45: calculateAkshavedamsakChart(planetaryPositions),
        D60: calculateShastiamsaChart(planetaryPositions)
    };

    return charts;
};

const calculateRashiChart = (positions) => {
    // D1 - Rashi (Birth) Chart - Direct positions
    return positions;
};

const calculateHoraChart = (positions) => {
    // D2 - Hora Chart
    const chart = {};
    Object.entries(positions).forEach(([planet, pos]) => {
        const longitude = pos.longitude;
        const hora = Math.floor(longitude / 15);
        chart[planet] = {
            ...pos,
            longitude: hora * 30 + (longitude % 15) * 2
        };
    });
    return chart;
};

const calculateDrekkanaChart = (positions) => {
    // D3 - Drekkana Chart
    const chart = {};
    Object.entries(positions).forEach(([planet, pos]) => {
        const longitude = pos.longitude;
        const drekkana = Math.floor(longitude / 10);
        chart[planet] = {
            ...pos,
            longitude: drekkana * 40 + (longitude % 10) * 4
        };
    });
    return chart;
};

const calculateNavamsakChart = (positions) => {
    // D9 - Navamsa Chart - Most important divisional chart
    const chart = {};
    Object.entries(positions).forEach(([planet, pos]) => {
        const longitude = pos.longitude;
        const sign = Math.floor(longitude / 30);
        const signDegree = longitude % 30;
        const navamsa = Math.floor(signDegree / 3.333333);
        
        // Calculate navamsa starting sign based on rashi
        let startSign;
        if (sign % 3 === 0) startSign = 0; // Movable signs
        else if (sign % 3 === 1) startSign = 4; // Fixed signs
        else startSign = 8; // Dual signs
        
        const finalSign = (startSign + navamsa) % 12;
        const finalDegree = (signDegree % 3.333333) * 9;
        
        chart[planet] = {
            ...pos,
            longitude: finalSign * 30 + finalDegree
        };
    });
    return chart;
};

const calculateShastiamsaChart = (positions) => {
    // D60 - Shashtiamsa Chart - Most detailed divisional chart
    const chart = {};
    Object.entries(positions).forEach(([planet, pos]) => {
        const longitude = pos.longitude;
        const sign = Math.floor(longitude / 30);
        const signDegree = longitude % 30;
        const shashtiamsa = Math.floor(signDegree * 2);
        
        // Calculate shashtiamsa position
        const finalSign = (sign * 5 + Math.floor(shashtiamsa / 12)) % 12;
        const finalDegree = (shashtiamsa % 12) * 2.5;
        
        chart[planet] = {
            ...pos,
            longitude: finalSign * 30 + finalDegree
        };
    });
    return chart;
};

/**
 * Calculate strength and dignity in divisional charts
 * @param {Object} charts - Calculated divisional charts
 * @returns {Object} Strength and dignity analysis
 */
export const analyzeDivisionalStrength = (charts) => {
    const analysis = {};
    
    Object.entries(charts).forEach(([chartType, positions]) => {
        analysis[chartType] = {
            strengths: calculatePlanetaryStrengths(positions),
            dignities: calculateDignities(positions),
            aspects: calculateAspects(positions),
            combinations: findYogaCombinations(positions)
        };
    });
    
    return analysis;
};

const calculateDignities = (positions) => {
    const dignities = {};
    const exaltationPoints = {
        Sun: 10, // Aries
        Moon: 33, // Taurus
        Mars: 298, // Capricorn
        Mercury: 165, // Virgo
        Jupiter: 95, // Cancer
        Venus: 357, // Pisces
        Saturn: 200 // Libra
    };
    
    Object.entries(positions).forEach(([planet, pos]) => {
        if (exaltationPoints[planet]) {
            const distance = Math.abs(pos.longitude - exaltationPoints[planet]);
            dignities[planet] = calculateDignityStatus(distance);
        }
    });
    
    return dignities;
};

const calculateDignityStatus = (distance) => {
    if (distance <= 6) return 'exalted';
    if (distance >= 174 && distance <= 186) return 'debilitated';
    if (distance <= 30) return 'strong';
    if (distance >= 150 && distance <= 210) return 'weak';
    return 'neutral';
};

/**
 * Find special yoga combinations in divisional charts
 * @param {Object} positions - Planetary positions
 * @returns {Array} Array of yoga combinations found
 */
const findYogaCombinations = (positions) => {
    const yogas = [];
    
    // Check for Raja Yoga
    if (isRajaYoga(positions)) {
        yogas.push({
            name: 'Raja Yoga',
            strength: calculateYogaStrength(positions, 'raja')
        });
    }
    
    // Check for Dhana Yoga
    if (isDhanaYoga(positions)) {
        yogas.push({
            name: 'Dhana Yoga',
            strength: calculateYogaStrength(positions, 'dhana')
        });
    }
    
    // Add more yoga checks as needed
    
    return yogas;
};

const isRajaYoga = (positions) => {
    // Implement Raja Yoga detection logic
    // Example: Lords of kendra and trikona houses conjoined
    return false; // Placeholder
};

const isDhanaYoga = (positions) => {
    // Implement Dhana Yoga detection logic
    // Example: Beneficial planets in 2nd/11th houses
    return false; // Placeholder
};

const calculateYogaStrength = (positions, yogaType) => {
    // Implement yoga strength calculation
    return 0.5; // Placeholder
};

/**
 * Analyze event significance in divisional charts
 * @param {Object} positions - Planetary positions
 * @param {Object} event - Event details
 * @returns {Object} Event significance analysis
 */
const analyzeEventSignificance = (positions, event) => {
    const analysis = {
        significance: 0,
        factors: [],
        yogas: [],
        recommendations: []
    };
    
    // Check for special yoga combinations
    const yogas = findYogaCombinations(positions);
    if (yogas.length > 0) {
        analysis.yogas = yogas;
        analysis.significance += yogas.reduce((acc, yoga) => acc + yoga.strength, 0) / yogas.length;
    }
    
    // Analyze house strengths
    const houseStrengths = calculateHouseStrengths(positions);
    const relevantHouses = getRelevantHouses(event.type);
    let houseScore = 0;
    
    relevantHouses.forEach(house => {
        if (houseStrengths[house] > 0.7) {
            analysis.factors.push({
                type: 'house_strength',
                house,
                strength: houseStrengths[house]
            });
            houseScore += houseStrengths[house];
        }
    });
    
    analysis.significance += houseScore / relevantHouses.length;
    
    // Analyze planetary combinations
    const combinations = analyzePlanetaryCombinations(positions, event.type);
    if (combinations.strength > 0) {
        analysis.factors.push({
            type: 'combinations',
            details: combinations.details,
            strength: combinations.strength
        });
        analysis.significance += combinations.strength;
    }
    
    // Generate recommendations
    if (analysis.significance < 0.5) {
        analysis.recommendations.push(
            'Consider adjusting birth time to strengthen relevant house positions'
        );
    }
    if (analysis.yogas.length === 0) {
        analysis.recommendations.push(
            'Look for time periods with stronger yoga formations'
        );
    }
    
    // Normalize final significance score
    analysis.significance = Math.min(1, analysis.significance / 3);
    
    return analysis;
};

/**
 * Get houses relevant to an event type
 * @param {string} eventType - Type of event
 * @returns {Array} Array of relevant house numbers
 */
const getRelevantHouses = (eventType) => {
    const houseMap = {
        career: [1, 2, 6, 10],
        relationship: [5, 7, 8],
        health: [1, 6, 8, 12],
        spiritual: [4, 8, 9, 12],
        education: [2, 4, 5, 9],
        relocation: [3, 4, 7, 12]
    };
    
    return houseMap[eventType] || [1];
};

/**
 * Calculate strength of each house
 * @param {Object} positions - Planetary positions
 * @returns {Object} House strength scores
 */
const calculateHouseStrengths = (positions) => {
    const strengths = {};
    
    for (let house = 1; house <= 12; house++) {
        strengths[house] = calculateHouseStrength(positions, house);
    }
    
    return strengths;
};

/**
 * Calculate strength of a specific house
 * @param {Object} positions - Planetary positions
 * @param {number} house - House number
 * @returns {number} House strength score
 */
const calculateHouseStrength = (positions, house) => {
    let strength = 0;
    
    // 1. Occupying planets
    const occupants = getHouseOccupants(positions, house);
    strength += calculateOccupantStrength(occupants);
    
    // 2. House lord strength
    const lord = getHouseLord(house);
    strength += calculatePlanetStrength(positions[lord]) * 0.4;
    
    // 3. Aspect strength
    const aspects = getHouseAspects(positions, house);
    strength += calculateAspectStrength(aspects) * 0.3;
    
    return Math.min(1, strength);
};

/**
 * Analyze planetary combinations for event significance
 * @param {Object} positions - Planetary positions
 * @param {string} eventType - Type of event
 * @returns {Object} Combination analysis
 */
const analyzePlanetaryCombinations = (positions, eventType) => {
    const analysis = {
        strength: 0,
        details: []
    };
    
    // Get relevant planets for event type
    const relevantPlanets = getRelevantPlanets(eventType);
    
    // Check conjunctions
    const conjunctions = findConjunctions(positions, relevantPlanets);
    if (conjunctions.length > 0) {
        analysis.details.push({
            type: 'conjunction',
            planets: conjunctions
        });
        analysis.strength += 0.3;
    }
    
    // Check special combinations
    const specialCombs = findSpecialCombinations(positions, relevantPlanets);
    if (specialCombs.length > 0) {
        analysis.details.push({
            type: 'special_combination',
            combinations: specialCombs
        });
        analysis.strength += 0.4;
    }
    
    return analysis;
}; 