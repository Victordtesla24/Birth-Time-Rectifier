import { VisualizationManager } from '../../js/visualization.js';
import { AnimationController } from '../../js/animation.js';
import { CONFIG } from '../../js/config.js';

describe('Animation Core Functions', () => {
    let visualizer;
    
    beforeEach(() => {
        // Mock p5.js functions
        global.random = jest.fn(max => max * 0.5);
        global.color = jest.fn((r, g, b) => ({ levels: [r, g, b] }));
        global.map = jest.fn((value, start1, stop1, start2, stop2) => {
            return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
        });
        global.width = 800;
        global.height = 600;
        global.TWO_PI = Math.PI * 2;
        global.PI = Math.PI;
        global.frameCount = 0;
        global.sin = Math.sin;
        global.cos = Math.cos;
        
        visualizer = new VisualizationManager();
    });
    
    describe('Star Field Animation', () => {
        test('stars are initialized with correct properties', () => {
            expect(visualizer.stars.length).toBe(1000);
            const star = visualizer.stars[0];
            expect(star).toHaveProperty('x');
            expect(star).toHaveProperty('y');
            expect(star).toHaveProperty('z');
            expect(star).toHaveProperty('size');
            expect(star).toHaveProperty('twinkleSpeed');
            expect(star).toHaveProperty('color');
        });
        
        test('star movement stays within bounds', () => {
            const star = visualizer.stars[0];
            const originalZ = star.z;
            
            // Simulate movement
            for (let i = 0; i < 1000; i++) {
                const speed = (star.z > 0) ? 2 : 0.5;
                star.z += speed;
                if (star.z > 1000) {
                    star.z = -1000;
                }
            }
            
            expect(star.z).toBeLessThanOrEqual(1000);
            expect(star.z).toBeGreaterThanOrEqual(-1000);
        });
        
        test('depth-based intensity calculation', () => {
            const star = visualizer.stars[0];
            star.z = -1000;
            const farIntensity = visualizer.getStarIntensity(star);
            
            star.z = 0;
            const midIntensity = visualizer.getStarIntensity(star);
            
            star.z = 1000;
            const nearIntensity = visualizer.getStarIntensity(star);
            
            expect(nearIntensity).toBeGreaterThan(farIntensity);
            expect(midIntensity).toBeGreaterThan(farIntensity);
            expect(midIntensity).toBeLessThan(nearIntensity);
        });
    });
    
    describe('Planet Animation', () => {
        test('planets are initialized with correct properties', () => {
            expect(visualizer.planets.length).toBe(8);
            const planet = visualizer.planets[0];
            expect(planet).toHaveProperty('name');
            expect(planet).toHaveProperty('radius');
            expect(planet).toHaveProperty('distance');
            expect(planet).toHaveProperty('angle');
            expect(planet).toHaveProperty('speed');
            expect(planet).toHaveProperty('color');
        });
        
        test('orbital calculations maintain proper distance', () => {
            const planet = visualizer.planets[0];
            const originalDistance = planet.distance;
            
            // Test multiple orbital positions
            for (let angle = 0; angle < TWO_PI; angle += PI/4) {
                planet.angle = angle;
                const [x, z] = visualizer.getPlanetPosition(planet);
                const currentDistance = Math.sqrt(x*x + z*z);
                expect(currentDistance).toBeCloseTo(originalDistance, 1);
            }
        });
        
        test('planet rotation and speed', () => {
            const planet = visualizer.planets[0];
            const originalAngle = planet.angle;
            
            // Simulate multiple frames
            for (let i = 0; i < 60; i++) {
                planet.angle += planet.speed;
            }
            
            expect(planet.angle).toBeGreaterThan(originalAngle);
            expect(planet.angle % TWO_PI).toBeLessThan(TWO_PI);
        });
    });
});

describe('AnimationController', () => {
    let animationController;
    let element;

    beforeEach(() => {
        animationController = new AnimationController();
        element = document.createElement('div');
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    test('constructor initializes with correct duration', () => {
        expect(animationController.duration).toBe(CONFIG.ANIMATION_DURATION);
        expect(animationController.animations).toBeDefined();
        expect(animationController.animations.size).toBe(0);
    });

    test('fadeIn sets correct initial styles', () => {
        animationController.fadeIn(element);
        
        expect(element.style.opacity).toBe('0');
        expect(element.style.display).toBe('block');
    });

    test('fadeOut sets correct styles', () => {
        animationController.fadeOut(element);
        
        setTimeout(() => {
            expect(element.style.display).toBe('none');
        }, CONFIG.FADE_DURATION + 50);
    });

    test('slideIn sets correct initial styles', () => {
        animationController.slideIn(element);
        
        expect(element.style.opacity).toBe('0');
        expect(element.style.display).toBe('block');
    });

    test('bounce animation sequence is correct', () => {
        const scale = 1.1;
        animationController.bounce(element, scale);
        
        expect(animationController.animations.has(element)).toBe(true);
    });

    test('shake animation sequence is correct', () => {
        const intensity = 5;
        animationController.shake(element, intensity);
        
        expect(animationController.animations.has(element)).toBe(true);
    });
});
