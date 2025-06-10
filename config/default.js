module.exports = {
    server: {
        port: process.env.PORT || 9000,
        env: process.env.NODE_ENV || 'development'
    },
    session: {
        secret: process.env.SESSION_SECRET || 'birth-time-rectifier-secret',
        name: 'birthTimeRectifier.sid',
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax'
        },
        resave: false,
        saveUninitialized: false
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:9000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
    },
    security: {
        headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'X-XSS-Protection': '1; mode=block'
        }
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'combined'
    },
    rectification: {
        minConfidence: 0.7,
        maxQuestions: 15,
        timeoutMinutes: 30,
        analysisSettings: {
            timeSensitivity: {
                ascendantWeight: 0.4,
                criticalDegreesWeight: 0.3,
                houseCuspsWeight: 0.3
            },
            confidenceThresholds: {
                low: 0.3,
                medium: 0.5,
                high: 0.7
            }
        }
    }
};
