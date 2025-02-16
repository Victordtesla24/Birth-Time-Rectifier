import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material';
import { Planet, House, Aspect } from './ChartTypes';

interface ChartRendererProps {
    planets: Planet[];
    houses: House[];
    aspects: Aspect[];
    width: number;
    height: number;
    transform: d3.ZoomTransform;
    selectedPlanet: string | null;
    onPlanetClick?: (planet: Planet) => void;
    onHouseClick?: (house: House) => void;
    onAspectHover?: (aspect: Aspect) => void;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
    planets,
    houses,
    aspects,
    width,
    height,
    transform,
    selectedPlanet,
    onPlanetClick,
    onHouseClick,
    onAspectHover,
}) => {
    const theme = useTheme();
    const svgRef = useRef<SVGSVGElement>(null);
    
    // Constants for chart dimensions
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;
    
    // Color scales
    const planetColors = d3.scaleOrdinal()
        .domain(['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'])
        .range(['#FFD700', '#C0C0C0', '#FF4500', '#32CD32', '#4169E1', '#FF69B4', '#708090', '#800080', '#8B4513']);
        
    const aspectColors = {
        conjunction: '#4CAF50',
        opposition: '#f44336',
        trine: '#2196F3',
        square: '#FF9800',
    };
    
    useEffect(() => {
        if (!svgRef.current) return;
        
        // Clear previous content
        d3.select(svgRef.current).selectAll('*').remove();
        
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);
            
        // Main group for zooming
        const mainGroup = svg.append('g')
            .attr('transform', `translate(${centerX},${centerY})`);
            
        // Draw houses
        const houseGroup = mainGroup.append('g').attr('class', 'houses');
        houses.forEach((house, i) => {
            const startAngle = house.longitude * Math.PI / 180;
            const endAngle = houses[(i + 1) % 12].longitude * Math.PI / 180;
            
            const arc = d3.arc()
                .innerRadius(radius * 0.7)
                .outerRadius(radius)
                .startAngle(startAngle)
                .endAngle(endAngle);
                
            houseGroup.append('path')
                .attr('d', arc as any)
                .attr('fill', theme.palette.background.paper)
                .attr('stroke', theme.palette.divider)
                .attr('cursor', 'pointer')
                .on('click', () => onHouseClick?.(house))
                .on('mouseover', function() {
                    d3.select(this).attr('fill', theme.palette.action.hover);
                })
                .on('mouseout', function() {
                    d3.select(this).attr('fill', theme.palette.background.paper);
                });
                
            // Add house numbers
            const midAngle = (startAngle + endAngle) / 2;
            const labelRadius = radius * 0.85;
            houseGroup.append('text')
                .attr('x', labelRadius * Math.cos(midAngle - Math.PI / 2))
                .attr('y', labelRadius * Math.sin(midAngle - Math.PI / 2))
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('font-size', '12px')
                .style('fill', theme.palette.text.primary)
                .text(house.number.toString());
        });
        
        // Draw aspects
        const aspectGroup = mainGroup.append('g').attr('class', 'aspects');
        aspects.forEach(aspect => {
            const planet1 = planets.find(p => p.name === aspect.planet1);
            const planet2 = planets.find(p => p.name === aspect.planet2);
            
            if (planet1 && planet2) {
                const angle1 = planet1.longitude * Math.PI / 180;
                const angle2 = planet2.longitude * Math.PI / 180;
                
                aspectGroup.append('line')
                    .attr('x1', radius * 0.6 * Math.cos(angle1 - Math.PI / 2))
                    .attr('y1', radius * 0.6 * Math.sin(angle1 - Math.PI / 2))
                    .attr('x2', radius * 0.6 * Math.cos(angle2 - Math.PI / 2))
                    .attr('y2', radius * 0.6 * Math.sin(angle2 - Math.PI / 2))
                    .attr('stroke', aspectColors[aspect.type as keyof typeof aspectColors] || '#999')
                    .attr('stroke-width', aspect.strength * 2)
                    .attr('opacity', 0.5)
                    .on('mouseover', () => {
                        onAspectHover?.(aspect);
                        d3.select(this).attr('opacity', 0.8);
                    })
                    .on('mouseout', () => {
                        d3.select(this).attr('opacity', 0.5);
                    });
            }
        });
        
        // Draw planets
        const planetGroup = mainGroup.append('g').attr('class', 'planets');
        planets.forEach(planet => {
            const angle = planet.longitude * Math.PI / 180;
            const planetRadius = radius * 0.6;
            const x = planetRadius * Math.cos(angle - Math.PI / 2);
            const y = planetRadius * Math.sin(angle - Math.PI / 2);
            
            const planetG = planetGroup.append('g')
                .attr('transform', `translate(${x},${y})`)
                .attr('cursor', 'pointer')
                .on('click', () => onPlanetClick?.(planet));
                
            // Planet symbol
            planetG.append('circle')
                .attr('r', 15)
                .attr('fill', planetColors(planet.name))
                .attr('stroke', selectedPlanet === planet.name ? theme.palette.primary.main : 'none')
                .attr('stroke-width', 2);
                
            planetG.append('text')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('font-size', '12px')
                .style('fill', theme.palette.background.paper)
                .text(planet.name.charAt(0));
        });
        
        // Apply current transform
        mainGroup.attr('transform', transform);
        
    }, [planets, houses, aspects, width, height, transform, selectedPlanet, theme]);
    
    return <svg ref={svgRef} />;
}; 