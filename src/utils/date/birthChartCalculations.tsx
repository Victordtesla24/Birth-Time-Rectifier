import { calculateAyanamsa } from './astroUtils';

/**
 * Calculate planetary positions for a given birth time
 * @param {Object} birthData - Birth date, time, and location data
 * @returns {Promise<Object>} Calculated planetary positions
 */
export const calculatePlanetaryPositions = async (birthData) => {
    try {
        const { date, time, location } = birthData;
        const datetime = new Date(`${date}T${time}`);
        
        // Calculate ayanamsa for the birth time
        const ayanamsa = calculateAyanamsa(datetime);
        
        // Mock planetary positions for now
        // In a real implementation, this would use Swiss Ephemeris or similar
        return {
            Sun: { longitude: 120.5, latitude: 0, speed: 0.98 },
            Moon: { longitude: 45.8, latitude: -4.2, speed: 12.5 },
            Mars: { longitude: 287.3, latitude: 1.1, speed: 0.5 },
            Mercury: { longitude: 156.2, latitude: -2.1, speed: -0.3 },
            Venus: { longitude: 89.7, latitude: 0.8, speed: 1.2 },
            Jupiter: { longitude: 312.9, latitude: -0.4, speed: -0.1 },
            Saturn: { longitude: 267.4, latitude: 2.3, speed: 0.03 },
            Rahu: { longitude: 178.5, latitude: 0, speed: -0.05 },
            Ketu: { longitude: 358.5, latitude: 0, speed: -0.05 }
        };
    } catch (error) {
        console.error('Error calculating planetary positions:', error);
        throw new Error('Failed to calculate planetary positions');
    }
};

/**
 * Generate birth chart from planetary positions
 * @param {Object} positions - Calculated planetary positions
 * @returns {Promise<Object>} Generated birth chart data
 */
export const generateBirthChart = async (positions) => {
    try {
        // Convert planetary positions to chart format
        const planets = Object.entries(positions).map(([name, data]) => ({
            name,
            longitude: data.longitude,
            latitude: data.latitude,
            speed: data.speed,
            symbol: getPlanetSymbol(name)
        }));

        // Calculate house cusps (mock data for now)
        const houses = Array(12).fill(0).map((_, i) => ({
            number: i + 1,
            degree: i * 30,
            sign: getZodiacSign(i * 30)
        }));

        // Calculate aspects between planets
        const aspects = calculateAspects(planets);

        return {
            planets,
            houses,
            aspects
        };
    } catch (error) {
        console.error('Error generating birth chart:', error);
        throw new Error('Failed to generate birth chart');
    }
};

/**
 * Analyze sensitive points in the chart
 * @param {Object} positions - Planetary positions
 * @returns {Promise<Object>} Sensitivity analysis results
 */
export const analyzeSensitivePoints = async (positions) => {
    try {
        // Mock sensitivity analysis
        return {
            factors: [
                {
                    name: 'Ascendant Sensitivity',
                    sensitivity_level: 'High',
                    description: 'The ascendant is in a critical degree'
                },
                {
                    name: 'Moon Position',
                    sensitivity_level: 'Medium',
                    description: 'Moon is in gandanta position'
                },
                {
                    name: 'Planetary Aspects',
                    sensitivity_level: 'High',
                    description: 'Multiple planets aspecting the ascendant'
                }
            ]
        };
    } catch (error) {
        console.error('Error analyzing sensitive points:', error);
        throw new Error('Failed to analyze sensitive points');
    }
};

/**
 * Generate recommendations based on analysis
 * @param {Object} sensitivity - Sensitivity analysis results
 * @param {Object} positions - Planetary positions
 * @returns {Array} Array of recommendations
 */
export const generateRecommendations = (sensitivity, positions) => {
    return [
        {
            priority: 'High',
            text: 'Focus on collecting major life events around ages 18-22',
            explanation: 'Multiple sensitive points indicate significant life changes during this period'
        },
        {
            priority: 'Medium',
            text: 'Verify early childhood events',
            explanation: 'Moon position suggests important early life patterns'
        },
        {
            priority: 'High',
            text: 'Document career-related events in detail',
            explanation: 'Strong 10th house influences indicate career significance'
        }
    ];
};

// Helper functions
const getPlanetSymbol = (planet) => {
    const symbols = {
        Sun: '☉',
        Moon: '☽',
        Mars: '♂',
        Mercury: '☿',
        Venus: '♀',
        Jupiter: '♃',
        Saturn: '♄',
        Rahu: '☊',
        Ketu: '☋'
    };
    return symbols[planet] || planet;
};

const getZodiacSign = (longitude) => {
    const signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer',
        'Leo', 'Virgo', 'Libra', 'Scorpio',
        'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const signIndex = Math.floor(longitude / 30) % 12;
    return signs[signIndex];
};

const calculateAspects = (planets) => {
    const aspects = [];
    for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
            const angle = Math.abs(planets[i].longitude - planets[j].longitude) % 360;
            if (isSignificantAspect(angle)) {
                aspects.push({
                    planet1: planets[i],
                    planet2: planets[j],
                    angle,
                    type: getAspectType(angle)
                });
            }
        }
    }
    return aspects;
};

const isSignificantAspect = (angle) => {
    const significantAngles = [0, 60, 90, 120, 180];
    return significantAngles.some(significant => 
        Math.abs(angle - significant) <= 8
    );
};

const getAspectType = (angle) => {
    if (angle <= 8) return 'Conjunction';
    if (Math.abs(angle - 60) <= 8) return 'Sextile';
    if (Math.abs(angle - 90) <= 8) return 'Square';
    if (Math.abs(angle - 120) <= 8) return 'Trine';
    if (Math.abs(angle - 180) <= 8) return 'Opposition';
    return 'Other';
}; 