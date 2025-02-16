import p5 from 'p5';
import { Planet, House } from '../types';

export class InteractionManager {
    private sketch: p5;
    private scale: number;
    private translateX: number;
    private translateY: number;
    private hoveredElement: string | null;
    private selectedPlanet: Planet | null;
    private selectedHouse: House | null;
    private onPlanetSelect: ((planet: Planet) => void) | null;
    private onHouseSelect: ((house: House) => void) | null;
    
    constructor(sketch: p5) {
        this.sketch = sketch;
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.hoveredElement = null;
        this.selectedPlanet = null;
        this.selectedHouse = null;
        this.onPlanetSelect = null;
        this.onHouseSelect = null;
    }
    
    public setCallbacks(
        onPlanetSelect: ((planet: Planet) => void) | null,
        onHouseSelect: ((house: House) => void) | null
    ): void {
        this.onPlanetSelect = onPlanetSelect;
        this.onHouseSelect = onHouseSelect;
    }
    
    public applyTransformations(p: p5): void {
        p.translate(p.width/2 + this.translateX, p.height/2 + this.translateY);
        p.scale(this.scale);
    }
    
    public handleZoom(event: any): void {
        const delta = event.deltaY;
        const zoomFactor = 0.05;
        const newScale = this.scale * (1 - delta * zoomFactor);
        
        // Limit zoom range
        if (newScale >= 0.5 && newScale <= 2.0) {
            this.scale = newScale;
        }
    }
    
    public handlePan(deltaX: number, deltaY: number): void {
        this.translateX += deltaX;
        this.translateY += deltaY;
        
        // Limit pan range
        const maxPan = 200;
        this.translateX = Math.max(-maxPan, Math.min(maxPan, this.translateX));
        this.translateY = Math.max(-maxPan, Math.min(maxPan, this.translateY));
    }
    
    public handleClick(planets: Planet[], houses: House[]): void {
        const mouseX = this.sketch.mouseX - this.sketch.width/2 - this.translateX;
        const mouseY = this.sketch.mouseY - this.sketch.height/2 - this.translateY;
        
        // Check for planet clicks
        const clickedPlanet = this.findClickedPlanet(planets, mouseX, mouseY);
        if (clickedPlanet) {
            this.selectedPlanet = clickedPlanet;
            this.selectedHouse = null;
            if (this.onPlanetSelect) {
                this.onPlanetSelect(clickedPlanet);
            }
            return;
        }
        
        // Check for house clicks
        const clickedHouse = this.findClickedHouse(houses, mouseX, mouseY);
        if (clickedHouse) {
            this.selectedHouse = clickedHouse;
            this.selectedPlanet = null;
            if (this.onHouseSelect) {
                this.onHouseSelect(clickedHouse);
            }
            return;
        }
        
        // Clear selection if clicking empty space
        this.selectedPlanet = null;
        this.selectedHouse = null;
    }
    
    public updateHover(planets: Planet[], houses: House[]): void {
        const mouseX = this.sketch.mouseX - this.sketch.width/2 - this.translateX;
        const mouseY = this.sketch.mouseY - this.sketch.height/2 - this.translateY;
        
        // Check for planet hover
        const hoveredPlanet = this.findClickedPlanet(planets, mouseX, mouseY);
        if (hoveredPlanet) {
            this.hoveredElement = hoveredPlanet.name;
            return;
        }
        
        // Check for house hover
        const hoveredHouse = this.findClickedHouse(houses, mouseX, mouseY);
        if (hoveredHouse) {
            this.hoveredElement = `house_${hoveredHouse.number}`;
            return;
        }
        
        this.hoveredElement = null;
    }
    
    public isHovering(elementId: string): boolean {
        return this.hoveredElement === elementId;
    }
    
    public getSelectedPlanet(): Planet | null {
        return this.selectedPlanet;
    }
    
    public getSelectedHouse(): House | null {
        return this.selectedHouse;
    }
    
    private findClickedPlanet(planets: Planet[], mouseX: number, mouseY: number): Planet | null {
        const planetRadius = 10 * this.scale; // Adjust hit area based on zoom
        
        for (const planet of planets) {
            const angle = planet.longitude * Math.PI / 180;
            const radius = 200; // Planet orbit radius
            
            const planetX = radius * Math.cos(angle);
            const planetY = radius * Math.sin(angle);
            
            const distance = Math.sqrt(
                Math.pow((mouseX - planetX) / this.scale, 2) +
                Math.pow((mouseY - planetY) / this.scale, 2)
            );
            
            if (distance <= planetRadius) {
                return planet;
            }
        }
        
        return null;
    }
    
    private findClickedHouse(houses: House[], mouseX: number, mouseY: number): House | null {
        const houseLineLength = 250;
        const clickThreshold = 10 * this.scale; // Adjust hit area based on zoom
        
        for (const house of houses) {
            const angle = house.startAngle * Math.PI / 180;
            
            const lineEndX = houseLineLength * Math.cos(angle);
            const lineEndY = houseLineLength * Math.sin(angle);
            
            // Calculate distance from point to line
            const distance = this.distanceToLine(
                0, 0,
                lineEndX, lineEndY,
                mouseX / this.scale,
                mouseY / this.scale
            );
            
            if (distance <= clickThreshold) {
                return house;
            }
        }
        
        return null;
    }
    
    private distanceToLine(
        x1: number, y1: number,
        x2: number, y2: number,
        px: number, py: number
    ): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    public reset(): void {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.hoveredElement = null;
        this.selectedPlanet = null;
        this.selectedHouse = null;
    }
} 