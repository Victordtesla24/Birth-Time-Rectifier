import { P5Instance } from 'p5';
import { VisualizationManager } from './visualization';
import * as d3 from 'd3';
import { COLORS, CONFIG } from './modules';
import { Planet, House, Aspect } from '../types/shared';

export interface VisualizationState {
    zoom: number;
    transform: d3.ZoomTransform;
    selectedPlanet: string | null;
    selectedHouse: number | null;
    hoveredAspect: Aspect | null;
}

export class EnhancedVisualizationManager extends VisualizationManager {
    effects: Map<string, any> = new Map();
    shaders: Map<string, any> = new Map();
    postProcessing = {
        enabled: false,
        effects: [] as any[],
    };
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    private state: VisualizationState;
    private onStateChange: (state: VisualizationState) => void;

    constructor(
        svgElement: SVGSVGElement,
        initialState: Partial<VisualizationState> = {},
        onStateChange?: (state: VisualizationState) => void
    ) {
        super(null);
        this.svg = d3.select(svgElement);
        this.mainGroup = this.svg.append('g');
        this.state = {
            zoom: 1,
            transform: d3.zoomIdentity,
            selectedPlanet: null,
            selectedHouse: null,
            hoveredAspect: null,
            ...initialState
        };
        this.onStateChange = onStateChange || (() => {});
        this.initializeZoom();
    }

    private updateState(updates: Partial<VisualizationState>) {
        this.state = { ...this.state, ...updates };
        this.onStateChange(this.state);
    }

    private initializeZoom() {
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([CONFIG.MIN_ZOOM, CONFIG.MAX_ZOOM])
            .on('zoom', (event) => {
                this.mainGroup.attr('transform', event.transform);
                this.updateState({
                    zoom: event.transform.k,
                    transform: event.transform
                });
            });
        
        this.svg.call(zoom);
    }

    addEffect(effectName: string) {
        this.effects.set(effectName, {});
    }

    removeEffect(effectName: string) {
        this.effects.delete(effectName);
    }

    addShader(name: string, shader: any) {
        this.shaders.set(name, shader);
    }

    enablePostProcessing() {
        this.postProcessing.enabled = true;
    }

    disablePostProcessing() {
        this.postProcessing.enabled = false;
    }

    addPostProcessingEffect(effect: any) {
        this.postProcessing.effects.push(effect);
    }

    clearPostProcessingEffects() {
        this.postProcessing.effects = [];
    }

    renderPlanets(planets: Planet[], radius: number) {
        const planetGroup = this.mainGroup.selectAll<SVGGElement, Planet>('.planet-group')
            .data(planets, (d) => d.id);
        
        // Remove old planets
        planetGroup.exit().remove();
        
        // Add new planets
        const planetEnter = planetGroup.enter()
            .append('g')
            .attr('class', 'planet-group')
            .attr('data-testid', (d) => `planet-${d.id}`);
        
        // Add planet circles
        planetEnter.append('circle')
            .attr('r', CONFIG.PLANET_RADIUS)
            .attr('fill', (d) => COLORS[d.name.toUpperCase()])
            .attr('stroke', '#000')
            .attr('stroke-width', CONFIG.PLANET_STROKE_WIDTH);
        
        // Add planet symbols
        planetEnter.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .text((d) => d.symbol);
        
        // Update all planets
        const planetUpdate = planetEnter.merge(planetGroup)
            .attr('transform', (d) => {
                const angle = (d.longitude - 90) * (Math.PI / 180);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return `translate(${x},${y})`;
            });
        
        // Add click handlers
        planetUpdate.on('click', (event, d) => {
            this.updateState({
                selectedPlanet: this.state.selectedPlanet === d.id ? null : d.id
            });
        });
    }
    
    renderHouses(houses: House[], radius: number) {
        const houseGroup = this.mainGroup.selectAll<SVGGElement, House>('.house-group')
            .data(houses, (d) => d.id);
        
        // Remove old houses
        houseGroup.exit().remove();
        
        // Add new houses
        const houseEnter = houseGroup.enter()
            .append('g')
            .attr('class', 'house-group')
            .attr('data-testid', (d) => `house-${d.id}`);
        
        // Create arc generator
        const arc = d3.arc<House>()
            .innerRadius(radius * 0.8)
            .outerRadius(radius)
            .startAngle((d) => (d.startDegree - 90) * (Math.PI / 180))
            .endAngle((d) => (d.endDegree - 90) * (Math.PI / 180));
        
        // Add house paths
        houseEnter.append('path')
            .attr('d', arc)
            .attr('fill', COLORS.HOUSE_FILL)
            .attr('stroke', COLORS.HOUSE_BORDER)
            .attr('stroke-width', CONFIG.HOUSE_LINE_WIDTH);
        
        // Add house numbers
        houseEnter.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('transform', (d) => {
                const angle = ((d.startDegree + d.endDegree) / 2 - 90) * (Math.PI / 180);
                const x = Math.cos(angle) * (radius * CONFIG.HOUSE_NUMBER_RADIUS);
                const y = Math.sin(angle) * (radius * CONFIG.HOUSE_NUMBER_RADIUS);
                return `translate(${x},${y})`;
            })
            .text((d) => d.number);
        
        // Add click handlers
        houseEnter.merge(houseGroup).on('click', (event, d) => {
            this.updateState({
                selectedHouse: this.state.selectedHouse === d.number ? null : d.number
            });
        });
    }
    
    renderAspects(aspects: Aspect[], planets: Planet[], radius: number) {
        const aspectGroup = this.mainGroup.selectAll<SVGLineElement, Aspect>('.aspect-line')
            .data(aspects, (d) => d.id);
        
        // Remove old aspects
        aspectGroup.exit().remove();
        
        // Add new aspects
        const aspectEnter = aspectGroup.enter()
            .append('line')
            .attr('class', 'aspect-line')
            .attr('data-testid', (d) => `aspect-${d.id}`)
            .attr('stroke-width', CONFIG.ASPECT_LINE_WIDTH)
            .attr('opacity', CONFIG.ASPECT_OPACITY);
        
        // Update all aspects
        aspectEnter.merge(aspectGroup)
            .attr('x1', (d) => {
                const planet = planets.find(p => p.id === d.planet1Id);
                const angle = ((planet?.longitude || 0) - 90) * (Math.PI / 180);
                return Math.cos(angle) * radius;
            })
            .attr('y1', (d) => {
                const planet = planets.find(p => p.id === d.planet1Id);
                const angle = ((planet?.longitude || 0) - 90) * (Math.PI / 180);
                return Math.sin(angle) * radius;
            })
            .attr('x2', (d) => {
                const planet = planets.find(p => p.id === d.planet2Id);
                const angle = ((planet?.longitude || 0) - 90) * (Math.PI / 180);
                return Math.cos(angle) * radius;
            })
            .attr('y2', (d) => {
                const planet = planets.find(p => p.id === d.planet2Id);
                const angle = ((planet?.longitude || 0) - 90) * (Math.PI / 180);
                return Math.sin(angle) * radius;
            })
            .attr('stroke', (d) => COLORS[d.type.toUpperCase()])
            .on('mouseenter', (event, d) => {
                this.updateState({ hoveredAspect: d });
            })
            .on('mouseleave', () => {
                this.updateState({ hoveredAspect: null });
            });
    }
    
    getState(): VisualizationState {
        return { ...this.state };
    }
    
    cleanup() {
        this.effects.clear();
        this.shaders.clear();
        this.clearPostProcessingEffects();
        this.svg.selectAll('*').remove();
        super.destroy();
    }
}

export const createEnhancedVisualizationManager = (
    svgElement: SVGSVGElement,
    initialState?: Partial<VisualizationState>,
    onStateChange?: (state: VisualizationState) => void
) => {
    return new EnhancedVisualizationManager(svgElement, initialState, onStateChange);
}; 