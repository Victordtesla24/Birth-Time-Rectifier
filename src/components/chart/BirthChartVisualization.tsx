import React from 'react';
import { Box } from '@mui/material';
import { ChartVisualization } from './ChartVisualization';
import { ChartControls } from './ChartControls';
import { ChartInsights } from './ChartInsights';
import { Planet, House, Aspect } from '../../types/shared';

interface BirthChartVisualizationProps {
    planets?: Planet[];
    houses?: House[];
    aspects?: Aspect[];
    width?: number;
    height?: number;
    onPlanetClick?: (planet: Planet) => void;
    onHouseClick?: (house: House) => void;
    onAspectHover?: (aspect: Aspect | null) => void;
}

export const BirthChartVisualization: React.FC<BirthChartVisualizationProps> = ({
    planets = [],
    houses = [],
    aspects = [],
    width = 800,
    height = 800,
    onPlanetClick,
    onHouseClick,
    onAspectHover
}) => {
    const [zoom, setZoom] = React.useState(1);
    const [selectedPlanet, setSelectedPlanet] = React.useState<string | null>(null);
    const [currentMode, setCurrentMode] = React.useState<'select' | 'pan'>('select');
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    const handleZoom = (event: any) => {
        const newZoom = zoom + (event.deltaY < 0 ? 0.1 : -0.1);
        setZoom(Math.max(0.5, Math.min(4, newZoom)));
    };

    const handleZoomIn = () => {
        setZoom(Math.min(4, zoom + 0.1));
    };

    const handleZoomOut = () => {
        setZoom(Math.max(0.5, zoom - 0.1));
    };

    const handleReset = () => {
        setZoom(1);
        setSelectedPlanet(null);
    };

    const handlePlanetClick = (planet: Planet) => {
        setSelectedPlanet(selectedPlanet === planet.id ? null : planet.id);
        onPlanetClick?.(planet);
    };

    const handleToggleMode = (mode: 'select' | 'pan') => {
        setCurrentMode(mode);
    };

    const handleToggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        // Add actual fullscreen logic here
    };

    return (
        <Box 
            sx={{ 
                position: 'relative', 
                width: '100%', 
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
            data-testid="birth-chart-visualization"
        >
            <ChartVisualization
                planets={planets}
                houses={houses}
                aspects={aspects}
                width={width}
                height={height * 0.8}
                onPlanetClick={handlePlanetClick}
                onHouseClick={onHouseClick}
                onAspectHover={onAspectHover}
                selectedPlanet={selectedPlanet}
            />
            <ChartControls
                onZoom={handleZoom}
                onReset={handleReset}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                zoom={zoom}
                onToggleMode={handleToggleMode}
                onToggleFullscreen={handleToggleFullscreen}
                currentMode={currentMode}
                isFullscreen={isFullscreen}
            />
            <ChartInsights
                selectedPlanet={planets.find(p => p.id === selectedPlanet)}
                hoveredAspect={null}
            />
        </Box>
    );
}; 