// Main p5.js Sketch Coordinating All Components

import p5 from 'p5';
import { VisualizationManager } from './visualization.js';
import { workflowOrchestrator } from './workflow.js';
import { CONFIG } from './modules.js';

export class SketchManager {
    constructor() {
        this.stars = [];
        this.planets = [];
        this.nebulae = [];
        this.shootingStars = [];
        this.p5Instance = null;
        this.colors = CONFIG.CHART_COLORS;
        this.visualizer = new VisualizationManager();
        this.frameCount = 0;
        this.lastShootingStarTime = 0;
        this.rotationAngle = 0;
        this.mouseRotationX = 0;
        this.mouseRotationY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.currentDepth = 0;
        this.targetDepth = 0;
        this.sunShader = null;
    }

    initialize(containerId) {
        const sketch = (p) => {
            p.preload = () => {
                // Load sun shader
                this.sunShader = p.loadShader(
                    'shaders/sun.vert',
                    'shaders/sun.frag'
                );
            };

            p.setup = () => {
                const container = document.getElementById(containerId);
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
                canvas.parent(container);
                p.pixelDensity(1);
                p.smooth();
                p.frameRate(60);
                p.noStroke();
                
                // Initialize stars with enhanced depth and color variations
                for (let i = 0; i < 1500; i++) {
                    this.stars.push({
                        x: p.random(-p.width * 4, p.width * 4),
                        y: p.random(-p.height * 4, p.height * 4),
                        z: p.random(-4000, 0),
                        size: p.random(2, 8),
                        twinkleSpeed: p.random(0.02, 0.05),
                        brightness: p.random(180, 255),
                        color: p.color(
                            p.random(200, 255),
                            p.random(220, 255),
                            p.random(230, 255)
                        ),
                        pulsePhase: p.random(p.TWO_PI)
                    });
                }
                
                // Initialize planets with realistic properties
                const planetData = [
                    {
                        name: 'Mercury',
                        color: [255, 150, 50],
                        size: 15,
                        distance: 200,
                        speed: 0.02,
                        atmosphere: false
                    },
                    {
                        name: 'Venus',
                        color: [255, 198, 73],
                        size: 20,
                        distance: 300,
                        speed: 0.015,
                        atmosphere: true
                    },
                    {
                        name: 'Earth',
                        color: [100, 149, 237],
                        size: 25,
                        distance: 400,
                        speed: 0.01,
                        atmosphere: true,
                        moons: [
                            {
                                radius: 5,
                                distance: 40,
                                speed: 0.05,
                                angle: p.random(p.TWO_PI)
                            }
                        ]
                    },
                    {
                        name: 'Mars',
                        color: [255, 80, 80],
                        size: 18,
                        distance: 500,
                        speed: 0.008,
                        atmosphere: true,
                        moons: [
                            {
                                radius: 3,
                                distance: 30,
                                speed: 0.04,
                                angle: p.random(p.TWO_PI)
                            },
                            {
                                radius: 2,
                                distance: 40,
                                speed: 0.03,
                                angle: p.random(p.TWO_PI)
                            }
                        ]
                    },
                    {
                        name: 'Jupiter',
                        color: [255, 215, 0],
                        size: 60,
                        distance: 700,
                        speed: 0.005,
                        atmosphere: true,
                        moons: Array(4).fill().map(() => ({
                            radius: p.random(3, 6),
                            distance: p.random(70, 120),
                            speed: p.random(0.02, 0.04),
                            angle: p.random(p.TWO_PI)
                        }))
                    },
                    {
                        name: 'Saturn',
                        color: [238, 232, 205],
                        size: 50,
                        distance: 900,
                        speed: 0.004,
                        rings: true,
                        atmosphere: true,
                        moons: Array(6).fill().map(() => ({
                            radius: p.random(2, 5),
                            distance: p.random(80, 150),
                            speed: p.random(0.01, 0.03),
                            angle: p.random(p.TWO_PI)
                        }))
                    },
                    {
                        name: 'Uranus',
                        color: [173, 216, 230],
                        size: 35,
                        distance: 1100,
                        speed: 0.003,
                        atmosphere: true,
                        moons: Array(3).fill().map(() => ({
                            radius: p.random(2, 4),
                            distance: p.random(50, 90),
                            speed: p.random(0.02, 0.03),
                            angle: p.random(p.TWO_PI)
                        }))
                    },
                    {
                        name: 'Neptune',
                        color: [0, 0, 128],
                        size: 35,
                        distance: 1300,
                        speed: 0.002,
                        atmosphere: true,
                        moons: Array(2).fill().map(() => ({
                            radius: p.random(2, 4),
                            distance: p.random(50, 80),
                            speed: p.random(0.02, 0.03),
                            angle: p.random(p.TWO_PI)
                        }))
                    }
                ];

                this.planets = planetData.map(data => ({
                    ...data,
                    radius: data.size,
                    angle: p.random(p.TWO_PI),
                    rotationSpeed: p.random(0.01, 0.03),
                    tilt: p.random(-0.3, 0.3),
                    color: p.color(data.color[0], data.color[1], data.color[2])
                }));
                
                // Initialize nebulae with enhanced effects
                const nebulaColors = [
                    [65, 100, 255],  // Blue
                    [255, 100, 180], // Pink
                    [100, 255, 180], // Cyan
                    [180, 100, 255], // Purple
                    [255, 150, 100]  // Orange
                ];
                
                for (let i = 0; i < 5; i++) {
                    const baseColor = nebulaColors[i];
                    this.nebulae.push({
                        x: p.random(-p.width * 2, p.width * 2),
                        y: p.random(-p.height * 2, p.height * 2),
                        z: p.random(-3000, -1000),
                        size: p.random(800, 1600),
                        rotation: p.random(p.TWO_PI),
                        rotationSpeed: p.random(0.0002, 0.0005),
                        color: p.color(
                            baseColor[0],
                            baseColor[1],
                            baseColor[2],
                            40
                        ),
                        particles: Array(150).fill().map(() => ({
                            x: p.random(-1, 1),
                            y: p.random(-1, 1),
                            z: p.random(-0.5, 0.5),
                            size: p.random(0.2, 0.8),
                            phase: p.random(p.TWO_PI)
                        }))
                    });
                }

                // Add interactive controls
                container.addEventListener('mousemove', (e) => {
                    this.targetRotationX = p.map(e.clientY, 0, p.height, -p.PI/3, p.PI/3);
                    this.targetRotationY = p.map(e.clientX, 0, p.width, -p.PI/3, p.PI/3);
                });

                // Add scroll interaction for depth
                container.addEventListener('wheel', (e) => {
                    this.targetDepth = p.constrain(
                        this.targetDepth + e.deltaY,
                        -2000,
                        500
                    );
                });
            };

            p.draw = () => {
                p.background(10, 10, 20);
                
                // Smooth camera movement
                const camX = p.map(p.mouseX, 0, p.width, -150, 150);
                const camY = p.map(p.mouseY, 0, p.height, -150, 150);
                p.camera(camX, camY, (1000 + this.currentDepth));
                
                // Smooth rotation and depth interpolation
                this.mouseRotationX = p.lerp(this.mouseRotationX, this.targetRotationX, 0.05);
                this.mouseRotationY = p.lerp(this.mouseRotationY, this.targetRotationY, 0.05);
                this.currentDepth = p.lerp(this.currentDepth, this.targetDepth, 0.1);
                
                p.push();
                p.rotateX(this.mouseRotationX);
                p.rotateY(this.mouseRotationY);
                
                // Rotate entire scene slowly
                this.rotationAngle += 0.001;
                p.rotateY(this.rotationAngle);
                
                // Draw stars with enhanced parallax and depth
                this.drawStarsWithParallax(p);
                
                // Draw nebulae with enhanced effects
                this.drawNebulaeClouds(p);
                
                // Draw planets with atmospheres and rings
                this.drawPlanetsEnhanced(p);
                
                // Update and draw shooting stars
                this.updateShootingStars(p);
                
                p.pop();
                
                // Add new shooting star periodically
                if (p.millis() - this.lastShootingStarTime > 2000 && p.random(1) < 0.3) {
                    this.addShootingStar(p);
                    this.lastShootingStarTime = p.millis();
                }
                
                this.frameCount++;
            };
            
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
                this.stars = this.stars.map(star => ({
                    ...star,
                    x: p.random(-p.width * 3, p.width * 3),
                    y: p.random(-p.height * 3, p.height * 3)
                }));
            };
        };
        
        this.p5Instance = new p5(sketch);
    }

    drawPlanets(p) {
        p.push();
        p.noStroke();
        
        this.planets.forEach((planet, index) => {
            p.push();
            p.rotateY(planet.angle);
            p.translate(planet.distance, 0, 0);
            
            // Draw orbit path
            p.push();
            p.stroke(255, 50);
            p.noFill();
            p.rotateX(p.HALF_PI);
            p.ellipse(0, 0, planet.distance * 2);
            p.pop();
            
            // Draw planet
            p.fill(p.red(planet.color), p.green(planet.color), p.blue(planet.color));
            p.sphere(planet.radius);
            
            // Draw rings for Saturn
            if (planet.rings) {
                p.push();
                p.rotateX(p.HALF_PI);
                p.stroke(238, 232, 205, 150);
                p.noFill();
                for (let i = 0; i < 10; i++) {
                    p.ellipse(0, 0, planet.radius * 2.5 + i * 2);
                }
                p.pop();
            }
            
            planet.angle += planet.speed;
            p.pop();
        });
        
        p.pop();
    }

    drawStarsWithParallax(p) {
        p.push();
        p.noStroke();
        
        this.stars.forEach(star => {
            const parallaxX = (p.mouseX - p.width/2) * (star.z / -2000) * 0.1;
            const parallaxY = (p.mouseY - p.height/2) * (star.z / -2000) * 0.1;
            
            const brightness = p.map(
                p.sin(this.frameCount * star.twinkleSpeed),
                -1, 1,
                star.brightness * 0.5,
                star.brightness
            );
            
            p.push();
            p.translate(
                star.x + parallaxX,
                star.y + parallaxY,
                star.z
            );
            p.fill(p.red(star.color), p.green(star.color), p.blue(star.color), brightness);
            p.sphere(star.size * (2000 / (2000 - star.z)));
            p.pop();
        });
        
        p.pop();
    }

    drawNebulaeClouds(p) {
        p.push();
        p.noStroke();
        p.blendMode(p.ADD);
        
        this.nebulae.forEach(nebula => {
            nebula.rotation += nebula.rotationSpeed;
            
            // Create volumetric effect
            for (let layer = 0; layer < 5; layer++) {
                const depth = layer * 100;
                nebula.particles.forEach(particle => {
                    const wobble = p.sin(particle.phase + this.frameCount * 0.02) * 20;
                    const x = nebula.x + particle.x * nebula.size * p.cos(nebula.rotation) + wobble;
                    const y = nebula.y + particle.y * nebula.size * p.sin(nebula.rotation) + wobble;
                    const z = nebula.z + particle.z * nebula.size + depth;
                    
                    p.push();
                    p.translate(x, y, z);
                    const alpha = p.map(layer, 0, 4, 40, 10);
                    p.fill(p.red(nebula.color), p.green(nebula.color), p.blue(nebula.color), alpha);
                    const size = nebula.size * particle.size * p.map(layer, 0, 4, 1, 0.5);
                    p.sphere(size);
                    p.pop();
                });
            }
        });
        
        p.blendMode(p.BLEND);
        p.pop();
    }

    addShootingStar(p) {
        const star = {
            x: p.random(-p.width/2, p.width/2),
            y: -p.height/2,
            z: p.random(-500, 0),
            speed: p.random(15, 25),
            size: p.random(2, 4),
            trail: []
        };
        
        this.shootingStars.push(star);
    }

    updateShootingStars(p) {
        p.push();
        p.noStroke();
        p.blendMode(p.ADD);
        
        this.shootingStars = this.shootingStars.filter(star => {
            // Update position with curved trajectory
            star.y += star.speed;
            star.x += star.curve;
            
            // Add current position to trail
            star.trail.push({ x: star.x, y: star.y, z: star.z });
            
            // Limit trail length
            if (star.trail.length > 30) {
                star.trail.shift();
            }
            
            // Draw trail with enhanced effect
            star.trail.forEach((pos, index) => {
                const progress = index / star.trail.length;
                const alpha = p.map(progress, 0, 1, 255, 0);
                const size = p.map(progress, 0, 1, star.size, 0);
                
                // Main trail
                p.push();
                p.translate(pos.x, pos.y, pos.z);
                p.fill(255, 255, 255, alpha);
                p.sphere(size);
                
                // Colored core
                p.fill(200, 220, 255, alpha * 0.5);
                p.sphere(size * 0.5);
                p.pop();
                
                // Particle effects
                if (index === star.trail.length - 1 && p.random(1) < 0.3) {
                    this.addTrailParticle(pos.x, pos.y, pos.z);
                }
            });
            
            return star.y < p.height/2;
        });
        
        // Update trail particles
        this.updateTrailParticles(p);
        
        p.blendMode(p.BLEND);
        p.pop();
    }

    drawPlanetsEnhanced(p) {
        p.push();
        p.noStroke();
        
        // Draw sun at the center
        p.push();
        p.fill(255, 200, 50);
        // Sun glow effect
        p.shader(this.sunShader);
        p.sphere(80);
        
        // Sun corona
        p.blendMode(p.ADD);
        for (let i = 0; i < 360; i += 10) {
            const angle = i * p.PI / 180;
            p.push();
            p.rotate(angle);
            p.stroke(255, 200, 50, 50);
            p.line(90, 0, 150, 0);
            p.pop();
        }
        p.pop();
        
        this.planets.forEach((planet, index) => {
            p.push();
            
            // Orbital tilt
            p.rotateX(planet.tilt);
            p.rotateY(planet.angle);
            
            // Draw orbital path with gradient
            p.push();
            p.noFill();
            p.stroke(255, 50);
            p.rotateX(p.HALF_PI);
            for (let i = 0; i < 360; i++) {
                const a = i * p.PI / 180;
                const alpha = p.map(p.sin(a), -1, 1, 20, 80);
                p.stroke(255, alpha);
                const x = p.cos(a) * planet.distance;
                const y = p.sin(a) * planet.distance;
                p.point(x, y);
            }
            p.pop();
            
            // Planet position
            p.translate(planet.distance, 0, 0);
            
            // Planet self-rotation
            p.rotateY(this.frameCount * planet.rotationSpeed);
            
            // Draw atmosphere if present
            if (planet.atmosphere) {
                p.push();
                p.blendMode(p.ADD);
                p.noStroke();
                for (let i = 0; i < 5; i++) {
                    const size = planet.radius + i * 2;
                    p.fill(p.red(planet.color), p.green(planet.color), p.blue(planet.color), 10);
                    p.sphere(size);
                }
                p.pop();
            }
            
            // Draw planet
            p.fill(p.red(planet.color), p.green(planet.color), p.blue(planet.color));
            p.sphere(planet.radius);
            
            // Draw rings for Saturn
            if (planet.rings) {
                p.push();
                p.rotateX(p.HALF_PI);
                p.noFill();
                
                // Multiple ring layers with different colors
                const ringColors = [
                    [238, 232, 205],
                    [210, 180, 140],
                    [180, 160, 120]
                ];
                
                for (let i = 0; i < 15; i++) {
                    const colorIndex = Math.floor(i / 5);
                    const [r, g, b] = ringColors[colorIndex];
                    p.stroke(r, g, b, 150);
                    const radius = planet.radius * 2 + i * 3;
                    p.ellipse(0, 0, radius, radius * 0.97); // Slightly elliptical
                }
                p.pop();
            }
            
            // Draw moons if applicable
            if (planet.moons) {
                planet.moons.forEach(moon => {
                    p.push();
                    p.rotateY(moon.angle);
                    p.translate(moon.distance, 0, 0);
                    p.fill(200);
                    p.sphere(moon.radius);
                    moon.angle += moon.speed;
                    p.pop();
                });
            }
            
            planet.angle += planet.speed;
            p.pop();
        });
        
        p.pop();
    }
}

// Initialize visualization
const sketchManager = new SketchManager();
sketchManager.initialize('visualization-container');

// Setup event listeners for workflow updates
workflowOrchestrator.on('chart-data-updated', (chartData) => {
    sketchManager.visualizer.renderChart(
        document.getElementById('chartContainer'),
        chartData
    );
});

// Export for module usage
export const sketch = {
    sketchManager,
    visualizer: sketchManager.visualizer
};
