import * as d3 from 'd3';
import { COLORS, CONFIG } from './modules';
import { ChartData, Planet, House, Aspect } from '../types/shared';

export interface VisualizationOptions {
    width: number;
    height: number;
    margin: number;
    padding: number;
}

export class VisualizationManager {
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private width: number;
    private height: number;
    private margin: { top: number; right: number; bottom: number; left: number };
    
    constructor(container: string, width: number, height: number) {
        this.width = width;
        this.height = height;
        this.margin = { top: 20, right: 20, bottom: 30, left: 40 };

        this.svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
    }
    
    public clear(): void {
        this.svg.selectAll('*').remove();
    }
    
    public drawHouses(houses: House[]): void {
        const radius = Math.min(this.width, this.height) / 2;
        const arc = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius * 0.8);

        const pie = d3.pie()
            .value(1)
            .padAngle(0.01);

        this.svg.selectAll('.house')
            .data(houses)
            .enter()
            .append('path')
            .attr('class', 'house')
            .attr('d', arc as any)
            .attr('transform', `translate(${this.width/2},${this.height/2})`);
    }
    
    public drawPlanets(planets: Planet[]): void {
        const radius = Math.min(this.width, this.height) / 2;
        
        this.svg.selectAll('.planet')
            .data(planets)
            .enter()
            .append('circle')
            .attr('class', 'planet')
            .attr('r', 5)
            .attr('cx', d => radius * Math.cos(d.longitude * Math.PI / 180))
            .attr('cy', d => radius * Math.sin(d.longitude * Math.PI / 180))
            .attr('transform', `translate(${this.width/2},${this.height/2})`);
    }
    
    public drawAspects(aspects: Aspect[]): void {
        const radius = Math.min(this.width, this.height) / 2;
        
        this.svg.selectAll('.aspect')
            .data(aspects)
            .enter()
            .append('line')
            .attr('class', 'aspect')
            .attr('x1', d => radius * Math.cos(d.planet1.longitude * Math.PI / 180))
            .attr('y1', d => radius * Math.sin(d.planet1.longitude * Math.PI / 180))
            .attr('x2', d => radius * Math.cos(d.planet2.longitude * Math.PI / 180))
            .attr('y2', d => radius * Math.sin(d.planet2.longitude * Math.PI / 180))
            .attr('transform', `translate(${this.width/2},${this.height/2})`);
    }
    
    public enableZoom(): void {
        const zoom = d3.zoom()
            .scaleExtent([0.5, 4])
            .on('zoom', (event) => {
                this.svg.attr('transform', event.transform);
            });

        this.svg.call(zoom as any);
    }
    
    public destroy(): void {
        this.svg.remove();
    }

    drawChart(data: ChartData): void {
        this.clear();
        this.drawHouses(data.houses);
        this.drawPlanets(data.planets);
        if (data.aspects) {
            this.drawAspects(data.aspects);
        }
        this.enableZoom();
    }
}

export const createVisualizationManager = (
    container: HTMLElement,
    width: number,
    height: number
) => {
    return new VisualizationManager(container, width, height);
}; 