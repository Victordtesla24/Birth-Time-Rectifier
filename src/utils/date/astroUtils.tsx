// Ascendant trait mappings based on zodiac signs and their rulers
const ascendantTraitMap = {
    Aries: [
        { id: 'aries_1', description: 'Athletic or muscular build' },
        { id: 'aries_2', description: 'Prominent forehead' },
        { id: 'aries_3', description: 'Quick, energetic movements' }
    ],
    Taurus: [
        { id: 'taurus_1', description: 'Well-built, medium height' },
        { id: 'taurus_2', description: 'Full face with prominent features' },
        { id: 'taurus_3', description: 'Strong neck and shoulders' }
    ],
    Gemini: [
        { id: 'gemini_1', description: 'Tall and slender build' },
        { id: 'gemini_2', description: 'Long arms and fingers' },
        { id: 'gemini_3', description: 'Expressive face with bright eyes' }
    ],
    Cancer: [
        { id: 'cancer_1', description: 'Round face with soft features' },
        { id: 'cancer_2', description: 'Pale or fair complexion' },
        { id: 'cancer_3', description: 'Small, delicate hands' }
    ],
    Leo: [
        { id: 'leo_1', description: 'Large, well-built frame' },
        { id: 'leo_2', description: 'Thick or abundant hair' },
        { id: 'leo_3', description: 'Commanding presence' }
    ],
    Virgo: [
        { id: 'virgo_1', description: 'Medium height, slender build' },
        { id: 'virgo_2', description: 'Clear complexion' },
        { id: 'virgo_3', description: 'Quick, precise movements' }
    ],
    Libra: [
        { id: 'libra_1', description: 'Symmetrical features' },
        { id: 'libra_2', description: 'Graceful movement' },
        { id: 'libra_3', description: 'Pleasant, attractive smile' }
    ],
    Scorpio: [
        { id: 'scorpio_1', description: 'Intense, penetrating eyes' },
        { id: 'scorpio_2', description: 'Strong facial features' },
        { id: 'scorpio_3', description: 'Magnetic presence' }
    ],
    Sagittarius: [
        { id: 'sag_1', description: 'Tall, athletic build' },
        { id: 'sag_2', description: 'High forehead' },
        { id: 'sag_3', description: 'Quick, jovial movements' }
    ],
    Capricorn: [
        { id: 'cap_1', description: 'Well-proportioned, lean build' },
        { id: 'cap_2', description: 'Prominent bone structure' },
        { id: 'cap_3', description: 'Reserved demeanor' }
    ],
    Aquarius: [
        { id: 'aqua_1', description: 'Average to tall height' },
        { id: 'aqua_2', description: 'Distinctive features' },
        { id: 'aqua_3', description: 'Quick, alert movements' }
    ],
    Pisces: [
        { id: 'pisces_1', description: 'Soft, dreamy eyes' },
        { id: 'pisces_2', description: 'Flexible body structure' },
        { id: 'pisces_3', description: 'Gentle, flowing movements' }
    ]
};

// Planet significator strengths based on house placement and aspects
const planetaryStrengthMap = {
    angular: 4,    // Planets in 1st, 4th, 7th, 10th houses
    succedent: 3,  // Planets in 2nd, 5th, 8th, 11th houses
    cadent: 2,     // Planets in 3rd, 6th, 9th, 12th houses
    exalted: 2,    // Planet in exaltation sign
    debilitated: -1 // Planet in debilitation sign
};

/**
 * Get physical and personality traits associated with the ascendant sign
 * @param {Object} ascendant - Ascendant details including sign and degree
 * @returns {Array} Array of trait objects with id and description
 */
export const getAscendantTraits = (ascendant) => {
    const sign = ascendant.sign;
    const traits = ascendantTraitMap[sign] || [];
    
    // Add ruler-based traits if available
    const rulerTraits = getRulerTraits(sign);
    return [...traits, ...rulerTraits];
};

/**
 * Get additional traits based on the ruling planet of a sign
 * @param {string} sign - Zodiac sign
 * @returns {Array} Array of trait objects
 */
const getRulerTraits = (sign) => {
    const rulerMap = {
        Aries: 'Mars',
        Taurus: 'Venus',
        Gemini: 'Mercury',
        Cancer: 'Moon',
        Leo: 'Sun',
        Virgo: 'Mercury',
        Libra: 'Venus',
        Scorpio: 'Mars',
        Sagittarius: 'Jupiter',
        Capricorn: 'Saturn',
        Aquarius: 'Saturn',
        Pisces: 'Jupiter'
    };

    const ruler = rulerMap[sign];
    const rulerTraits = {
        Mars: [{ id: `${sign.toLowerCase()}_mars`, description: 'Strong physical vitality' }],
        Venus: [{ id: `${sign.toLowerCase()}_venus`, description: 'Artistic sensibility' }],
        Mercury: [{ id: `${sign.toLowerCase()}_mercury`, description: 'Quick mental responses' }],
        Moon: [{ id: `${sign.toLowerCase()}_moon`, description: 'Emotional sensitivity' }],
        Sun: [{ id: `${sign.toLowerCase()}_sun`, description: 'Natural authority' }],
        Jupiter: [{ id: `${sign.toLowerCase()}_jupiter`, description: 'Expansive personality' }],
        Saturn: [{ id: `${sign.toLowerCase()}_saturn`, description: 'Reserved demeanor' }]
    };

    return rulerTraits[ruler] || [];
};

/**
 * Get planetary significators from KP analysis
 * @param {Object} kpAnalysis - KP analysis data including sublords and significators
 * @returns {Object} Object containing planetary significators and their strengths
 */
export const getPlanetarySignificators = (kpAnalysis) => {
    const significators = {};
    
    // Process each house's significators
    Object.entries(kpAnalysis.house_significators || {}).forEach(([house, planets]) => {
        planets.forEach(planet => {
            if (!significators[planet]) {
                significators[planet] = {
                    strength: calculatePlanetaryStrength(planet, house, kpAnalysis),
                    houses: [parseInt(house)]
                };
            } else {
                significators[planet].houses.push(parseInt(house));
                significators[planet].strength += calculatePlanetaryStrength(planet, house, kpAnalysis);
            }
        });
    });

    return significators;
};

/**
 * Calculate the strength of a planet based on its position and aspects
 * @param {string} planet - Planet name
 * @param {string} house - House number
 * @param {Object} kpAnalysis - Complete KP analysis data
 * @returns {number} Strength score of the planet
 */
const calculatePlanetaryStrength = (planet, house, kpAnalysis) => {
    let strength = 0;
    const houseNum = parseInt(house);

    // Base strength from house placement
    if ([1, 4, 7, 10].includes(houseNum)) {
        strength += planetaryStrengthMap.angular;
    } else if ([2, 5, 8, 11].includes(houseNum)) {
        strength += planetaryStrengthMap.succedent;
    } else {
        strength += planetaryStrengthMap.cadent;
    }

    // Additional strength from dignity
    if (kpAnalysis.planetary_dignities) {
        const dignity = kpAnalysis.planetary_dignities[planet];
        if (dignity === 'exalted') {
            strength += planetaryStrengthMap.exalted;
        } else if (dignity === 'debilitated') {
            strength += planetaryStrengthMap.debilitated;
        }
    }

    // Normalize strength to a 0-1 scale
    return Math.max(0, Math.min(1, strength / 10));
};

/**
 * Calculate precise ayanamsa using multiple methods
 * @param {Date} date - Date object for calculation
 * @returns {Object} Different ayanamsa values
 */
export const calculateAyanamsa = (date) => {
    const jd = calculateJulianDay(date);
    
    return {
        lahiri: calculateLahiriAyanamsa(jd),
        raman: calculateRamanAyanamsa(jd),
        krishnamurti: calculateKrishnamurtiAyanamsa(jd),
        yukteshwar: calculateYukteshwarAyanamsa(jd)
    };
};

const calculateJulianDay = (date) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const h = date.getHours() + date.getMinutes()/60;
    
    const jd = 367 * y - Math.floor(7 * (y + Math.floor((m + 9) / 12)) / 4) 
             - Math.floor(3 * (Math.floor((y + (m - 9) / 7) / 100) + 1) / 4)
             + Math.floor(275 * m / 9) + d + 1721028.5 + h/24;
    
    return jd;
};

const calculateLahiriAyanamsa = (jd) => {
    // Lahiri ayanamsa calculation
    const t = (jd - 2451545.0) / 36525;
    return 23.85 + 0.0000925833 * t;
};

const calculateRamanAyanamsa = (jd) => {
    // Raman ayanamsa calculation
    const t = (jd - 2451545.0) / 36525;
    return 22.5 + 1.396042 * t + 0.0003550556 * t * t;
};

const calculateKrishnamurtiAyanamsa = (jd) => {
    // Krishnamurti ayanamsa calculation
    const t = (jd - 2451545.0) / 36525;
    return 23.85 + 0.0001125 * (jd - 2415020);
};

const calculateYukteshwarAyanamsa = (jd) => {
    // Yukteshwar ayanamsa calculation
    const t = (jd - 2451545.0) / 36525;
    return 22.0 + 1.11 * t;
}; 