import React from 'react';
import { Box, useTheme } from '@mui/material';
import { VisualizationManager } from '../../services/visualization';
import type { ChartData } from '@/types/shared';

interface ChartProps {
  data: ChartData;
  width?: number;
  height?: number;
  onChartReady?: () => void;
}

export const ChartVisualization: React.FC<ChartProps> = ({
  data,
  width = 800,
  height = 600,
  onChartReady,
}) => {
  const theme = useTheme();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const visualizationRef = React.useRef<VisualizationManager | null>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      visualizationRef.current = new VisualizationManager(
        containerRef.current.id,
        width,
        height
      );
      onChartReady?.();
    }

    return () => {
      visualizationRef.current?.destroy();
    };
  }, [width, height, onChartReady]);

  React.useEffect(() => {
    if (visualizationRef.current && data) {
      visualizationRef.current.drawChart(data);
    }
  }, [data]);

  return (
    <Box
      ref={containerRef}
      id="chart-container"
      data-testid="chart-container"
      sx={{
        width,
        height,
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[1],
        overflow: 'hidden',
      }}
    />
  );
}; 