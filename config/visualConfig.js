export const VISUAL_CONFIG = {
    camera: {
        fov: 60,
        near: 0.1,
        far: 10000,
        initialPosition: [0, 0, 1000],
        zoomRange: [-2000, 2000],
        enableParallax: true,
        parallaxStrength: 0.1
    },
    celestialObjects: {
        stars: {
            count: 2000,
            sizeRange: [0.5, 2],
            twinkleSpeed: [0.001, 0.005],
            glowSize: [2, 4],
            colors: [
                [1.0, 0.95, 0.8],    // Warm white
                [0.95, 0.95, 1.0],   // Cool white
                [1.0, 0.8, 0.8],     // Reddish
                [0.8, 0.8, 1.0]      // Bluish
            ]
        },
        nebulae: {
            count: 3,
            sizeRange: [100, 300],
            density: [0.1, 0.3],
            movementSpeed: [0.0001, 0.0005],
            colors: [
                [0.5, 0.2, 0.5],     // Purple
                [0.2, 0.5, 0.7],     // Blue
                [0.7, 0.3, 0.2]      // Red
            ]
        },
        planets: {
            earth: {
                radius: 50,
                orbitRadius: 300,
                rotationSpeed: 0.001,
                atmosphereDensity: 0.3,
                atmosphereColor: [0.6, 0.8, 1.0]
            },
            mars: {
                radius: 30,
                orbitRadius: 450,
                rotationSpeed: 0.0008,
                atmosphereDensity: 0.1,
                atmosphereColor: [1.0, 0.6, 0.4]
            },
            jupiter: {
                radius: 120,
                orbitRadius: 700,
                rotationSpeed: 0.002,
                atmosphereDensity: 0.5,
                atmosphereColor: [0.9, 0.7, 0.5]
            },
            saturn: {
                radius: 100,
                orbitRadius: 900,
                rotationSpeed: 0.0015,
                atmosphereDensity: 0.4,
                atmosphereColor: [0.9, 0.8, 0.6],
                rings: {
                    innerRadius: 1.2,
                    outerRadius: 2.0,
                    rotationSpeed: 0.0005,
                    particleDensity: 1.0
                }
            },
            neptune: {
                radius: 45,
                orbitRadius: 1100,
                rotationSpeed: 0.001,
                atmosphereDensity: 0.6,
                atmosphereColor: [0.4, 0.6, 0.9]
            }
        }
    },
    postProcessing: {
        godRays: {
            density: 0.96,
            weight: 0.4,
            decay: 0.9,
            exposure: 0.6
        },
        bloom: {
            threshold: 0.5,
            intensity: 1.5,
            radius: 0.8
        }
    }
};
