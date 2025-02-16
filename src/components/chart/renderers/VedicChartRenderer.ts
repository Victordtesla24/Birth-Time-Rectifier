import p5 from 'p5';
import { BaseRenderer } from './BaseRenderer';
import { ChartData, Planet, House, Aspect } from '../../../../shared/types';
import { TransitionManager } from '../../../../shared/managers/TransitionManager';
import { ConfidenceVisualizer } from '../../../../shared/utils/ConfidenceVisualizer';

export class VedicChartRenderer extends BaseRenderer {
    getInteractionManager() {
        throw new Error('Method not implemented.');
    }
    private data: ChartData;
    private transitionManager: TransitionManager;
    private confidenceVisualizer: ConfidenceVisualizer;
    
    constructor(container: HTMLElement, data: ChartData) {
        super(container);
        this.data = data;
        this.transitionManager = new TransitionManager();
        this.confidenceVisualizer = new ConfidenceVisualizer(this.sketch);
        
        this.transitionManager.setupTransitions(this.data);
        this.confidenceVisualizer.setupVisualization(this.data.confidence);
    }
    
    protected draw(p: p5): void {
        p.background(this.styleManager.getBackgroundColor());
        
        this.interactionManager.applyTransformations(p);
        
        this.drawChartFrame(p);
        this.drawHouses(p);
        this.drawPlanets(p);
        this.drawAspects(p);
        this.drawConfidenceIndicators(p);
        
        this.transitionManager.updateTransitions();
        this.accessibilityManager.drawAccessibilityElements(p);
    }
    
    private drawChartFrame(p: p5): void {
        p.stroke(this.styleManager.getFrameColor());
        p.noFill();
        p.circle(0, 0, this.styleManager.getChartSize());
        
        this.styleManager.drawChartDecorations(p);
    }
    
    private drawHouses(p: p5): void {
        const houses = this.data.houses;
        
        for (let i = 0; i < 12; i++) {
            const startAngle = houses[i].startAngle;
            const endAngle = houses[i].endAngle;
            
            const currentAngle = this.transitionManager.getTransitionedValue(
                `house_${i}`,
                startAngle
            );
            
            this.styleManager.drawHouseLine(p, currentAngle);
            this.styleManager.drawHouseLabel(p, i + 1, (startAngle + endAngle) / 2);
        }
    }
    
    private drawPlanets(p: p5): void {
        const planets = this.data.planets;
        
        for (const planet of planets) {
            const currentPosition = this.transitionManager.getTransitionedValue(
                `planet_${planet.name}`,
                planet.longitude
            );
            
            if (this.interactionManager.isHovering(planet.name)) {
                this.styleManager.drawPlanetHighlighted(p, planet, currentPosition);
                this.drawPlanetDetails(p, planet);
            } else {
                this.styleManager.drawPlanet(p, planet, currentPosition);
            }
        }
    }
    
    private drawAspects(p: p5): void {
        const aspects = this.data.aspects;
        
        for (const aspect of aspects) {
            const startPos = this.transitionManager.getTransitionedValue(
                `planet_${aspect.planet1}`,
                aspect.longitude1
            );
            const endPos = this.transitionManager.getTransitionedValue(
                `planet_${aspect.planet2}`,
                aspect.longitude2
            );
            
            this.styleManager.drawAspectLine(p, aspect, startPos, endPos);
        }
    }
    
    private drawConfidenceIndicators(p: p5): void {
        this.confidenceVisualizer.drawConfidenceMetrics(p, this.data.confidence);
    }
    
    private drawPlanetDetails(p: p5, planet: Planet): void {
        this.styleManager.drawPlanetDetails(p, planet);
    }
    
    public updateData(newData: ChartData): void {
        this.transitionManager.initializeTransitions(this.data, newData);
        this.data = newData;
        this.confidenceVisualizer.updateConfidence(newData.confidence);
    }
} 