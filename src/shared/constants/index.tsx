/**
 * Consolidated Configuration Module
 */

const env = process.env.NODE_ENV || 'development';

const baseConfig = {
    api: {
        baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
        timeout: 30000,
        retryAttempts: 3
    },
    chart: {
        defaultStyle: 'north-indian',
        colorScheme: {
            background: '#ffffff',
            houses: '#e0e0e0',
            planets: '#2196f3',
            aspects: '#ff4081'
        },
        dimensions: {
            width: 400,
            height: 400
        }
    },
    analysis: {
        confidenceThreshold: 0.85,
        maxIterations: 3,
        timeAdjustmentRange: {
            min: -120, // minutes
            max: 120   // minutes
        }
    },
    validation: {
        birthTime: {
            format: 'HH:mm',
            minYear: 1900,
            maxYear: new Date().getFullYear()
        },
        lifeEvents: {
            maxEvents: 10,
            minEvents: 1
        }
    },
    logging: {
        level: env === 'development' ? 'debug' : 'error',
        enabled: true,
        console: true,
        file: env === 'production'
    }
};

const envConfigs = {
    development: {
        api: {
            mockEnabled: true,
            delayResponse: 1000
        },
        logging: {
            level: 'debug',
            console: true,
            file: false
        }
    },
    test: {
        api: {
            mockEnabled: true,
            delayResponse: 0
        },
        logging: {
            level: 'error',
            console: false,
            file: false
        }
    },
    production: {
        api: {
            mockEnabled: false,
            delayResponse: 0
        },
        logging: {
            level: 'error',
            console: false,
            file: true
        }
    }
};

// Merge base config with environment-specific config
const config = {
    ...baseConfig,
    ...envConfigs[env],
    env
};

// Validation functions
export const validateConfig = () => {
    const requiredFields = [
        'api.baseUrl',
        'chart.defaultStyle',
        'analysis.confidenceThreshold',
        'validation.birthTime.format'
    ];

    const missingFields = requiredFields.filter(field => {
        const parts = field.split('.');
        let current = config;
        for (const part of parts) {
            if (current[part] === undefined) {
                return true;
            }
            current = current[part];
        }
        return false;
    });

    if (missingFields.length > 0) {
        throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
    }

    return true;
};

// Validate config on load
validateConfig();

// Export frozen config object to prevent modifications
export default Object.freeze(config);

// Export specific config sections for convenience
export const {
    api: apiConfig,
    chart: chartConfig,
    analysis: analysisConfig,
    validation: validationConfig,
    logging: loggingConfig
} = config; 