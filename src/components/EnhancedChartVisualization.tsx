import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { ZoomIn, ZoomOut, RestartAlt } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

interface Planet {
    name: string;
    longitude: number;
    latitude?: number;
    speed?: number;
    house?: number;
    dignity?: string;
    strength?: number;
}

interface House {
    number: number;
    longitude: number;
    sign?: string;
}

interface Aspect {
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
    strength: number;
}

interface ConfidenceMetrics {
    overall: number;
    planetary: number;
    dasha: number;
    events: number;
    appearance: number;
}

interface MLInsights {
    patterns: Array<{
        type: string;
        description: string;
        confidence: number;
        planets: string[];
    }>;
    suggestions: Array<{
        type: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
    }>;
}

interface ChartProps {
    planets: Planet[];
    houses: House[];
    aspects: Aspect[];
    width?: number;
    height?: number;
    confidenceMetrics?: ConfidenceMetrics;
    mlInsights?: MLInsights;
    onPlanetClick?: (planet: Planet) => void;
    onHouseClick?: (house: House) => void;
    onAspectHover?: (aspect: Aspect) => void;
}

const EnhancedChartVisualization: React.FC<ChartProps> = ({
    planets,
    houses,
    aspects,
    width = 600,
    height = 600,
    confidenceMetrics,
    mlInsights,
    onPlanetClick,
    onHouseClick,
    onAspectHover
}) => {
    const theme = useTheme();
    const svgRef = useRef<SVGSVGElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
    const [hoveredAspect, setHoveredAspect] = useState<Aspect | null>(null);
    const [chartState, setChartState] = useState('initial');

    // Interactive planetary positions
    const renderPlanets = () => {
        return planets.map((planet, index) => (
            <motion.g
                key={planet.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handlePlanetClick(planet)}
                onMouseEnter={() => handlePlanetHover(planet)}
                onMouseLeave={() => setSelectedPlanet(null)}
                role="button"
                aria-label={`Planet ${planet.name}`}
            >
                <circle
                    cx={calculatePlanetX(planet.longitude)}
                    cy={calculatePlanetY(planet.longitude)}
                    r={10}
                    fill={getPlanetColor(planet)}
                    stroke={selectedPlanet?.name === planet.name ? theme.palette.primary.main : 'none'}
                    strokeWidth={2}
                />
                {selectedPlanet?.name === planet.name && (
                    <PlanetDetails planet={planet} />
                )}
            </motion.g>
        ));
    };

    // Dynamic transitions
    const handleStateTransition = (newState: string) => {
        setChartState(newState);
    };

    // Zoom controls
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev * 1.2, 3));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev / 1.2, 0.5));
    };

    const handleReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // Pan controls
    const handleMouseDown = (e: React.MouseEvent) => {
        const startX = e.clientX - pan.x;
        const startY = e.clientY - pan.y;

        const handleMouseMove = (e: MouseEvent) => {
            setPan({
                x: e.clientX - startX,
                y: e.clientY - startY
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Accessibility features
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case '+':
                    handleZoomIn();
                    break;
                case '-':
                    handleZoomOut();
                    break;
                case 'r':
                    handleReset();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Real-time confidence visualization
    const ConfidenceIndicator = () => (
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {confidenceMetrics && (
                <g transform={`translate(${width - 100}, 20)`}>
                    <rect
                        width={80}
                        height={10}
                        fill={theme.palette.background.paper}
                        rx={5}
                    />
                    <rect
                        width={80 * confidenceMetrics.overall}
                        height={10}
                        fill={getConfidenceColor(confidenceMetrics.overall)}
                        rx={5}
                    />
                    <text
                        x={40}
                        y={25}
                        textAnchor="middle"
                        fill={theme.palette.text.primary}
                        fontSize={12}
                    >
                        {`${(confidenceMetrics.overall * 100).toFixed(0)}%`}
                    </text>
                </g>
            )}
        </motion.g>
    );

    // ML insights visualization
    const MLInsightsVisualization = () => (
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {mlInsights?.patterns.map((pattern, index) => (
                <g
                    key={index}
                    transform={`translate(20, ${index * 30 + 20})`}
                >
                    <circle
                        r={5}
                        fill={getPatternColor(pattern.confidence)}
                    />
                    <text
                        x={10}
                        y={5}
                        fontSize={12}
                        fill={theme.palette.text.primary}
                    >
                        {pattern.description}
                    </text>
                </g>
            ))}
        </motion.g>
    );

    return (
        <Box
            sx={{
                position: 'relative',
                width,
                height,
                overflow: 'hidden'
            }}
        >
            <svg
                ref={svgRef}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={{
                    transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                    cursor: 'grab'
                }}
                onMouseDown={handleMouseDown}
                role="img"
                aria-label="Birth Chart Visualization"
            >
                <g className="houses">
                    {renderHouses()}
                </g>
                <g className="aspects">
                    {renderAspects()}
                </g>
                <g className="planets">
                    {renderPlanets()}
                </g>
                <ConfidenceIndicator />
                <MLInsightsVisualization />
            </svg>

            <ZoomControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
            />

            <PanInstructions />
        </Box>
    );
};

// Helper components
const ZoomControls: React.FC<{
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
}> = ({ onZoomIn, onZoomOut, onReset }) => (
    <Box
        sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            display: 'flex',
            gap: 1
        }}
    >
        <IconButton onClick={onZoomIn} aria-label="Zoom in">
            <ZoomIn />
        </IconButton>
        <IconButton onClick={onZoomOut} aria-label="Zoom out">
            <ZoomOut />
        </IconButton>
        <IconButton onClick={onReset} aria-label="Reset view">
            <RestartAlt />
        </IconButton>
    </Box>
);

const PanInstructions = () => (
    <Typography
        variant="caption"
        sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            color: 'text.secondary'
        }}
    >
        Click and drag to pan. Use +/- keys to zoom, R to reset.
    </Typography>
);

export default EnhancedChartVisualization; 