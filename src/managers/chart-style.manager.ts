import p5 from 'p5';
import { Planet, Aspect } from '../types';

export class ChartStyleManager {
    private readonly CHART_SIZE = 500;
    private readonly PLANET_SIZE = 20;
    private readonly HOUSE_LINE_LENGTH = 250;
    private readonly HOUSE_LABEL_RADIUS = 230;
    private readonly PLANET_LABEL_RADIUS = 200;
    private readonly ASPECT_LINE_WEIGHT = 1;
    
    private readonly COLORS = {
        background: '#FFFFFF',
        frame: '#333333',
        houseLine: '#666666',
        houseLabel: '#333333',
        planetNormal: '#1976D2',
        planetHighlight: '#2196F3',
        aspectBenefic: '#4CAF50',
        aspectMalefic: '#F44336',
        aspectNeutral: '#9E9E9E'
    };
    
    public getBackgroundColor(): string {
        return this.COLORS.background;
    }
    
    public getFrameColor(): string {
        return this.COLORS.frame;
    }
    
    public getChartSize(): number {
        return this.CHART_SIZE;
    }
    
    public drawChartDecorations(p: p5): void {
        // Draw inner circle
        p.stroke(this.COLORS.frame);
        p.noFill();
        p.circle(0, 0, this.CHART_SIZE * 0.8);
        
        // Draw center point
        p.fill(this.COLORS.frame);
        p.circle(0, 0, 4);
    }
    
    public drawHouseLine(p: p5, angle: number): void {
        p.stroke(this.COLORS.houseLine);
        p.line(
            0, 0,
            this.HOUSE_LINE_LENGTH * Math.cos(angle),
            this.HOUSE_LINE_LENGTH * Math.sin(angle)
        );
    }
    
    public drawHouseLabel(p: p5, houseNumber: number, angle: number): void {
        const x = this.HOUSE_LABEL_RADIUS * Math.cos(angle);
        const y = this.HOUSE_LABEL_RADIUS * Math.sin(angle);
        
        p.push();
        p.translate(x, y);
        p.rotate(angle + Math.PI/2);
        p.fill(this.COLORS.houseLabel);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(12);
        p.text(houseNumber.toString(), 0, 0);
        p.pop();
    }
    
    public drawPlanet(p: p5, planet: Planet, angle: number): void {
        const x = this.PLANET_LABEL_RADIUS * Math.cos(angle);
        const y = this.PLANET_LABEL_RADIUS * Math.sin(angle);
        
        p.push();
        p.translate(x, y);
        
        // Draw planet symbol
        p.fill(this.COLORS.planetNormal);
        p.noStroke();
        p.circle(0, 0, this.PLANET_SIZE);
        
        // Draw planet label
        p.fill(this.COLORS.planetNormal);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(10);
        p.text(planet.symbol, 0, 0);
        
        p.pop();
    }
    
    public drawPlanetHighlighted(p: p5, planet: Planet, angle: number): void {
        const x = this.PLANET_LABEL_RADIUS * Math.cos(angle);
        const y = this.PLANET_LABEL_RADIUS * Math.sin(angle);
        
        p.push();
        p.translate(x, y);
        
        // Draw highlight circle
        p.fill(this.COLORS.planetHighlight);
        p.noStroke();
        p.circle(0, 0, this.PLANET_SIZE * 1.2);
        
        // Draw planet symbol
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(10);
        p.text(planet.symbol, 0, 0);
        
        p.pop();
    }
    
    public drawPlanetDetails(p: p5, planet: Planet): void {
        const tooltipWidth = 150;
        const tooltipHeight = 80;
        const padding = 10;
        
        p.push();
        // Position tooltip to the right of the planet
        const x = p.mouseX + 20;
        const y = p.mouseY - tooltipHeight/2;
        
        // Draw tooltip background
        p.fill(255, 240);
        p.stroke(200);
        p.rect(x, y, tooltipWidth, tooltipHeight, 5);
        
        // Draw tooltip content
        p.noStroke();
        p.fill(0);
        p.textSize(12);
        p.textAlign(p.LEFT, p.TOP);
        
        p.text(`${planet.name}`, x + padding, y + padding);
        p.text(`Position: ${planet.longitude.toFixed(2)}°`, x + padding, y + padding + 20);
        p.text(`House: ${planet.house}`, x + padding, y + padding + 40);
        
        p.pop();
    }
    
    public drawAspectLine(p: p5, aspect: Aspect, startAngle: number, endAngle: number): void {
        const startX = this.PLANET_LABEL_RADIUS * Math.cos(startAngle);
        const startY = this.PLANET_LABEL_RADIUS * Math.sin(startAngle);
        const endX = this.PLANET_LABEL_RADIUS * Math.cos(endAngle);
        const endY = this.PLANET_LABEL_RADIUS * Math.sin(endAngle);
        
        p.stroke(this.getAspectColor(aspect.nature));
        p.strokeWeight(this.ASPECT_LINE_WEIGHT);
        
        if (aspect.nature === 'benefic') {
            this.drawBeneficAspectLine(p, startX, startY, endX, endY);
        } else if (aspect.nature === 'malefic') {
            this.drawMaleficAspectLine(p, startX, startY, endX, endY);
        } else {
            this.drawNeutralAspectLine(p, startX, startY, endX, endY);
        }
        
        p.strokeWeight(1); // Reset stroke weight
    }
    
    private getAspectColor(nature: string): string {
        switch (nature) {
            case 'benefic':
                return this.COLORS.aspectBenefic;
            case 'malefic':
                return this.COLORS.aspectMalefic;
            default:
                return this.COLORS.aspectNeutral;
        }
    }
    
    private drawBeneficAspectLine(p: p5, startX: number, startY: number, endX: number, endY: number): void {
        p.line(startX, startY, endX, endY);
    }
    
    private drawMaleficAspectLine(p: p5, startX: number, startY: number, endX: number, endY: number): void {
        const dashLength = 5;
        const distance = p.dist(startX, startY, endX, endY);
        const numDashes = Math.floor(distance / (dashLength * 2));
        
        for (let i = 0; i < numDashes; i++) {
            const t1 = i / numDashes;
            const t2 = (i + 0.5) / numDashes;
            
            const x1 = p.lerp(startX, endX, t1);
            const y1 = p.lerp(startY, endY, t1);
            const x2 = p.lerp(startX, endX, t2);
            const y2 = p.lerp(startY, endY, t2);
            
            p.line(x1, y1, x2, y2);
        }
    }
    
    private drawNeutralAspectLine(p: p5, startX: number, startY: number, endX: number, endY: number): void {
        p.drawingContext.setLineDash([5, 5]);
        p.line(startX, startY, endX, endY);
        p.drawingContext.setLineDash([]);
    }
} 