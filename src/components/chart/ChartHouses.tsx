import React from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material';
import { House } from './types';

interface ChartHousesProps {
  houses: House[];
  radius: number;
  onHouseClick?: (house: House) => void;
}

export const ChartHouses: React.FC<ChartHousesProps> = ({
  houses = [],
  radius,
  onHouseClick,
}) => {
  const theme = useTheme();

  if (!houses || houses.length === 0) {
    return null;
  }

  return (
    <g className="houses">
      {houses.map((house, i) => {
        const startAngle = (house.startDegree || 0) * Math.PI / 180;
        const endAngle = (house.endDegree || ((i + 1) * 30)) * Math.PI / 180;
        
        const arc = d3.arc()
          .innerRadius(radius * 0.7)
          .outerRadius(radius)
          .startAngle(startAngle)
          .endAngle(endAngle);
          
        const midAngle = (startAngle + endAngle) / 2;
        const labelRadius = radius * 0.85;

        return (
          <g key={house.id} data-testid={`house-${house.id}`}>
            <path
              d={arc() || ''}
              fill={theme.palette.background.paper}
              stroke={theme.palette.divider}
              cursor="pointer"
              onClick={() => onHouseClick?.(house)}
              onMouseOver={(e) => {
                const target = e.currentTarget;
                target.style.fill = theme.palette.action.hover;
              }}
              onMouseOut={(e) => {
                const target = e.currentTarget;
                target.style.fill = theme.palette.background.paper;
              }}
            />
            <text
              x={labelRadius * Math.cos(midAngle - Math.PI / 2)}
              y={labelRadius * Math.sin(midAngle - Math.PI / 2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12px"
              fill={theme.palette.text.primary}
            >
              {house.number}
            </text>
          </g>
        );
      })}
    </g>
  );
}; 