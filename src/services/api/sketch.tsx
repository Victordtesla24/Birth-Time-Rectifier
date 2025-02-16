/**
 * Consolidated Sketch Service Module
 * Combines p5.js sketch functionality with visualization features
 */

import p5 from 'p5';
import { visualizationService } from './visualization';
import { chartConfig } from '../config';
import { logger } from '../../shared/utils/logger';

export class SketchService {
    constructor() {
        this.p5Instance = null;
        this.container = null;
        this.chartData = null;
        this.options = {};
        this.isAnimating = false;
    }

    initialize(container, options = {}) {
        this.container = container;
        this.options = {
            ...chartConfig,
            ...options
        };

        // Initialize visualization service
        visualizationService.initialize(container, this.options);

        // Create p5 instance
        this.p5Instance = new p5(this.sketch.bind(this), container);
    }

    sketch(p) {
        p.setup = () => {
            const { width, height } = this.options.dimensions;
            p.createCanvas(width, height);
            p.angleMode(p.DEGREES);
            p.colorMode(p.RGB);
            p.noLoop();
        };

        p.draw = () => {
            p.background(this.options.colorScheme.background);
            
            if (this.chartData) {
                this.drawChart(p);
            }
        };

        p.mousePressed = () => {
            if (this.chartData) {
                const clicked = this.handleChartClick(p.mouseX, p.mouseY);
                if (clicked && this.options.onChartClick) {
                    this.options.onChartClick(clicked);
                }
            }
        };
    }

    drawChart(p) {
        const { width, height } = this.options.dimensions;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2.5;

        // Draw chart frame
        this.drawChartFrame(p, centerX, centerY, radius);

        // Draw houses
        this.drawHouses(p, centerX, centerY, radius);

        // Draw planets
        this.drawPlanets(p, centerX, centerY, radius);

        // Draw aspects
        if (this.chartData.aspects) {
            this.drawAspects(p, centerX, centerY, radius);
        }
    }

    drawChartFrame(p, centerX, centerY, radius) {
        p.push();
        p.noFill();
        p.stroke(this.options.colorScheme.houses);
        p.strokeWeight(2);
        p.circle(centerX, centerY, radius * 2);
        p.pop();
    }

    drawHouses(p, centerX, centerY, radius) {
        const { houses } = this.chartData;
        
        p.push();
        p.stroke(this.options.colorScheme.houses);
        p.strokeWeight(1);

        houses.forEach((house, index) => {
            const angle = index * 30;
            const x2 = centerX + radius * p.cos(angle);
            const y2 = centerY + radius * p.sin(angle);

            p.line(centerX, centerY, x2, y2);

            if (this.options.showLabels) {
                const labelX = centerX + radius * 0.85 * p.cos(angle + 15);
                const labelY = centerY + radius * 0.85 * p.sin(angle + 15);
                
                p.push();
                p.noStroke();
                p.fill(0);
                p.textAlign(p.CENTER, p.CENTER);
                p.text(house.number, labelX, labelY);
                p.pop();
            }
        });

        p.pop();
    }

    drawPlanets(p, centerX, centerY, radius) {
        const { planets } = this.chartData;

        planets.forEach(planet => {
            const angle = planet.longitude;
            const x = centerX + radius * 0.7 * p.cos(angle);
            const y = centerY + radius * 0.7 * p.sin(angle);

            // Draw planet symbol
            p.push();
            p.fill(this.options.colorScheme.planets);
            p.noStroke();
            p.circle(x, y, 10);
            p.pop();

            // Draw planet label
            if (this.options.showLabels) {
                p.push();
                p.noStroke();
                p.fill(0);
                p.textAlign(p.CENTER, p.CENTER);
                p.text(planet.symbol, x, y - 15);
                p.pop();
            }
        });
    }

    drawAspects(p, centerX, centerY, radius) {
        const { aspects } = this.chartData;

        p.push();
        p.stroke(this.options.colorScheme.aspects);
        p.strokeWeight(1);

        aspects.forEach(aspect => {
            const angle1 = aspect.planet1.longitude;
            const angle2 = aspect.planet2.longitude;
            const x1 = centerX + radius * 0.7 * p.cos(angle1);
            const y1 = centerY + radius * 0.7 * p.sin(angle1);
            const x2 = centerX + radius * 0.7 * p.cos(angle2);
            const y2 = centerY + radius * 0.7 * p.sin(angle2);

            p.drawingContext.setLineDash([5, 5]);
            p.line(x1, y1, x2, y2);
        });

        p.pop();
    }

    handleChartClick(mouseX, mouseY) {
        const { width, height } = this.options.dimensions;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2.5;

        // Check if clicked on a planet
        const clickedPlanet = this.chartData.planets.find(planet => {
            const angle = planet.longitude;
            const x = centerX + radius * 0.7 * Math.cos(angle * Math.PI / 180);
            const y = centerY + radius * 0.7 * Math.sin(angle * Math.PI / 180);
            const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
            return distance < 10;
        });

        if (clickedPlanet) {
            return {
                type: 'planet',
                data: clickedPlanet
            };
        }

        return null;
    }

    updateChart(chartData) {
        this.chartData = chartData;
        if (this.p5Instance) {
            this.p5Instance.redraw();
        }
    }

    startAnimation() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.p5Instance.loop();
        }
    }

    stopAnimation() {
        if (this.isAnimating) {
            this.isAnimating = false;
            this.p5Instance.noLoop();
        }
    }

    resize(width, height) {
        if (this.p5Instance) {
            this.p5Instance.resizeCanvas(width, height);
            this.options.dimensions = { width, height };
            this.p5Instance.redraw();
        }
    }

    dispose() {
        if (this.p5Instance) {
            this.p5Instance.remove();
            this.p5Instance = null;
        }
        visualizationService.dispose();
    }
}

// Create and export singleton instance
export const sketchService = new SketchService(); 