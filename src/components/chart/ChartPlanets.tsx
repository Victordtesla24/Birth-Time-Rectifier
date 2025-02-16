import React from 'react';
import { useTheme } from '@mui/material';
import * as d3 from 'd3';
import { Planet } from './types';

interface ChartPlanetsProps {
  planets: Planet[];
  radius: number;
  selectedPlanet: string | null;
  onPlanetClick?: (planet: Planet) => void;
  setSelectedPlanet: (name: string | null) => void;
}

const planetColors = d3.scaleOrdinal()
  .domain(['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'])
  .range(['#FFD700', '#C0C0C0', '#FF4500', '#32CD32', '#4169E1', '#FF69B4', '#708090', '#800080', '#8B4513']);

export const ChartPlanets: React.FC<ChartPlanetsProps> = ({
  planets,
  radius,
  selectedPlanet,
  onPlanetClick,
  setSelectedPlanet,
}) => {
  const theme = useTheme();

  if (!planets || planets.length === 0) {
    return null;
  }

  return (
    <g className="planets">
      {planets.map((planet) => {
        const angle = (planet.longitude || 0) * Math.PI / 180;
        const x = radius * 0.8 * Math.cos(angle - Math.PI / 2);
        const y = radius * 0.8 * Math.sin(angle - Math.PI / 2);

        return (
          <g
            key={planet.id}
            data-testid={`planet-${planet.id}`}
            transform={`translate(${x},${y})`}
            onClick={() => {
              onPlanetClick?.(planet);
              setSelectedPlanet?.(planet.id);
            }}
            style={{ cursor: 'pointer' }}
          >
            <circle
              r={5}
              fill={selectedPlanet === planet.id ? theme.palette.primary.main : theme.palette.text.primary}
              stroke={theme.palette.background.paper}
              strokeWidth={1}
            />
            <text
              y={-8}
              textAnchor="middle"
              fontSize="12px"
              fill={theme.palette.text.primary}
            >
              {planet.symbol}
            </text>
          </g>
        );
      })}
    </g>
  );
}; 