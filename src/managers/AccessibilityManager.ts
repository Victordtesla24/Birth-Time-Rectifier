import p5 from 'p5';
import { Planet, House, Aspect, ChartData } from '../types';

export class AccessibilityManager {
    private sketch: p5;
    private data: ChartData;
    private ariaLabels: Map<string, string>;
    private ariaDescriptions: Map<string, string>;
    private selectedElement: string | null;
    
    constructor(sketch: p5) {
        this.sketch = sketch;
        this.ariaLabels = new Map();
        this.ariaDescriptions = new Map();
        this.selectedElement = null;
    }
    
    public setupAccessibility(data: ChartData): void {
        this.data = data;
        this.generateAriaLabels();
        this.generateAriaDescriptions();
    }
    
    public updateData(newData: ChartData): void {
        this.data = newData;
        this.generateAriaLabels();
        this.generateAriaDescriptions();
    }
    
    public setSelectedElement(elementId: string | null): void {
        this.selectedElement = elementId;
    }
    
    public drawAccessibilityElements(p: p5): void {
        // Draw focus indicators for keyboard navigation
        if (this.selectedElement) {
            if (this.selectedElement.startsWith('planet_')) {
                this.drawPlanetFocus(p);
            } else if (this.selectedElement.startsWith('house_')) {
                this.drawHouseFocus(p);
            }
        }
    }
    
    private generateAriaLabels(): void {
        // Generate labels for planets
        this.data.planets.forEach(planet => {
            const label = `${planet.name} at ${planet.longitude.toFixed(2)} degrees in house ${planet.house}`;
            this.ariaLabels.set(`planet_${planet.name}`, label);
        });
        
        // Generate labels for houses
        this.data.houses.forEach((house, index) => {
            const label = `House ${index + 1} starting at ${house.startAngle.toFixed(2)} degrees`;
            this.ariaLabels.set(`house_${index + 1}`, label);
        });
        
        // Generate labels for aspects
        this.data.aspects.forEach((aspect, index) => {
            const label = `${aspect.nature} aspect between ${aspect.planet1} and ${aspect.planet2}`;
            this.ariaLabels.set(`aspect_${index}`, label);
        });
    }
    
    private generateAriaDescriptions(): void {
        // Generate detailed descriptions for planets
        this.data.planets.forEach(planet => {
            const description = this.generatePlanetDescription(planet);
            this.ariaDescriptions.set(`planet_${planet.name}`, description);
        });
        
        // Generate detailed descriptions for houses
        this.data.houses.forEach((house, index) => {
            const description = this.generateHouseDescription(house, index + 1);
            this.ariaDescriptions.set(`house_${index + 1}`, description);
        });
        
        // Generate detailed descriptions for aspects
        this.data.aspects.forEach((aspect, index) => {
            const description = this.generateAspectDescription(aspect);
            this.ariaDescriptions.set(`aspect_${index}`, description);
        });
    }
    
    private generatePlanetDescription(planet: Planet): string {
        const aspects = this.data.aspects.filter(
            aspect => aspect.planet1 === planet.name || aspect.planet2 === planet.name
        );
        
        let description = `${planet.name} is located at ${planet.longitude.toFixed(2)} degrees `;
        description += `in house ${planet.house}. `;
        
        if (aspects.length > 0) {
            description += 'It forms aspects with: ';
            aspects.forEach((aspect, index) => {
                const otherPlanet = aspect.planet1 === planet.name ? aspect.planet2 : aspect.planet1;
                description += `${otherPlanet} (${aspect.nature})`;
                if (index < aspects.length - 1) {
                    description += ', ';
                }
            });
        }
        
        return description;
    }
    
    private generateHouseDescription(house: House, houseNumber: number): string {
        const planetsInHouse = this.data.planets.filter(p => p.house === houseNumber);
        
        let description = `House ${houseNumber} spans from ${house.startAngle.toFixed(2)} `;
        description += `to ${house.endAngle.toFixed(2)} degrees. `;
        
        if (planetsInHouse.length > 0) {
            description += 'Contains planets: ';
            planetsInHouse.forEach((planet, index) => {
                description += planet.name;
                if (index < planetsInHouse.length - 1) {
                    description += ', ';
                }
            });
        } else {
            description += 'No planets are currently in this house.';
        }
        
        return description;
    }
    
    private generateAspectDescription(aspect: Aspect): string {
        const planet1 = this.data.planets.find(p => p.name === aspect.planet1);
        const planet2 = this.data.planets.find(p => p.name === aspect.planet2);
        
        if (!planet1 || !planet2) return '';
        
        let description = `${aspect.nature} aspect between ${aspect.planet1} `;
        description += `and ${aspect.planet2}. `;
        description += `${aspect.planet1} is in house ${planet1.house} `;
        description += `and ${aspect.planet2} is in house ${planet2.house}.`;
        
        return description;
    }
    
    private drawPlanetFocus(p: p5): void {
        if (!this.selectedElement?.startsWith('planet_')) return;
        
        const planetName = this.selectedElement.replace('planet_', '');
        const planet = this.data.planets.find(p => p.name === planetName);
        
        if (planet) {
            const angle = planet.longitude * Math.PI / 180;
            const radius = 200; // Planet orbit radius
            
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            
            // Draw focus ring
            p.noFill();
            p.stroke(255, 165, 0); // Orange
            p.strokeWeight(2);
            p.circle(x, y, 30);
            p.strokeWeight(1);
        }
    }
    
    private drawHouseFocus(p: p5): void {
        if (!this.selectedElement?.startsWith('house_')) return;
        
        const houseNumber = parseInt(this.selectedElement.replace('house_', ''));
        const house = this.data.houses[houseNumber - 1];
        
        if (house) {
            const angle = house.startAngle * Math.PI / 180;
            const length = 250; // House line length
            
            const x = length * Math.cos(angle);
            const y = length * Math.sin(angle);
            
            // Draw focus highlight
            p.stroke(255, 165, 0); // Orange
            p.strokeWeight(3);
            p.line(0, 0, x, y);
            p.strokeWeight(1);
        }
    }
    
    public getAriaLabel(elementId: string): string {
        return this.ariaLabels.get(elementId) || '';
    }
    
    public getAriaDescription(elementId: string): string {
        return this.ariaDescriptions.get(elementId) || '';
    }
    
    public handleKeyboardNavigation(event: KeyboardEvent): void {
        if (!this.selectedElement) {
            // If nothing is selected, select the first planet
            if (this.data.planets.length > 0) {
                this.selectedElement = `planet_${this.data.planets[0].name}`;
            }
            return;
        }
        
        switch (event.key) {
            case 'Tab':
                this.navigateElements(event.shiftKey);
                event.preventDefault();
                break;
            case 'Enter':
            case ' ':
                // Trigger click event for selected element
                break;
            case 'Escape':
                this.selectedElement = null;
                break;
        }
    }
    
    private navigateElements(reverse: boolean): void {
        const elements = [
            ...this.data.planets.map(p => `planet_${p.name}`),
            ...Array.from({length: 12}, (_, i) => `house_${i + 1}`)
        ];
        
        const currentIndex = elements.indexOf(this.selectedElement || '');
        let nextIndex;
        
        if (reverse) {
            nextIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
        } else {
            nextIndex = currentIndex >= elements.length - 1 ? 0 : currentIndex + 1;
        }
        
        this.selectedElement = elements[nextIndex];
    }
} 