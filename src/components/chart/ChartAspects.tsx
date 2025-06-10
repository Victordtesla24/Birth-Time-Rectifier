import React from 'react';
import { useTheme } from '@mui/material';
import { Aspect, Planet } from './types';

interface ChartAspectsProps {
  aspects: Aspect[];
  planets: Planet[];
  radius: number;
  onAspectHover?: (aspect: Aspect) => void;
}

const aspectColors = {
  conjunction: '#4CAF50',
  opposition: '#f44336',
  trine: '#2196F3',
  square: '#FF9800',
};

export const ChartAspects: React.FC<ChartAspectsProps> = ({
  aspects = [],
  planets = [],
  radius,
  onAspectHover
}) => {
  const theme = useTheme();

  if (!aspects || aspects.length === 0 || !planets || planets.length === 0) {
    return null;
  }

  const getPlanetPosition = (planetId: string) => {
    const planet = planets.find(p => p.id === planetId);
    if (!planet) return { x: 0, y: 0 };
    
    const angle = (planet.longitude || 0) * Math.PI / 180;
    const r = radius * 0.8;
    return {
      x: r * Math.cos(angle - Math.PI / 2),
      y: r * Math.sin(angle - Math.PI / 2)
    };
  };

  return (
    <g className="aspects">
      {aspects.map(aspect => {
        const start = getPlanetPosition(aspect.planet1);
        const end = getPlanetPosition(aspect.planet2);

        return (
          <line
            key={aspect.id}
            data-testid={`aspect-${aspect.id}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke={theme.palette.divider}
            strokeWidth={1}
            strokeDasharray={aspect.type === 'opposition' ? '5,5' : undefined}
            onMouseEnter={() => onAspectHover?.(aspect)}
            onMouseLeave={() => onAspectHover?.(null)}
          />
        );
      })}
    </g>
  );
}; 