import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import { EnhancedChartVisualization } from '@/components/chart/EnhancedChartVisualization';
import { mockChartData } from '@tests/fixtures/mockChartData';
import { canvasManager } from '@tests/mocks/animation';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
    ...jest.requireActual('@tests/mocks/mui'),
}));

// Mock canvas
jest.mock('canvas', () => canvasManager);

const theme = createTheme();

describe('EnhancedChartVisualization', () => {
    const mockPlanets = [
        {
            name: 'Sun',
            longitude: 0,
            house: 1,
            dignity: 'exalted',
            strength: 0.8
        },
        {
            name: 'Moon',
            longitude: 90,
            house: 4,
            dignity: 'own sign',
            strength: 0.7
        }
    ];

    const mockHouses = [
        { number: 1, longitude: 0 },
        { number: 2, longitude: 30 }
    ];

    const mockAspects = [
        {
            planet1: 'Sun',
            planet2: 'Moon',
            type: 'square',
            orb: 2,
            strength: 0.9
        }
    ];

    const mockConfidenceMetrics = {
        overall: 0.85,
        planetary: 0.9,
        dasha: 0.8,
        events: 0.85,
        appearance: 0.8
    };

    const mockMLInsights = {
        patterns: [
            {
                type: 'temporal',
                description: 'Strong Jupiter pattern',
                confidence: 0.9,
                planets: ['Jupiter', 'Sun']
            }
        ],
        suggestions: [
            {
                type: 'adjustment',
                description: 'Consider earlier time',
                priority: 'high' as const
            }
        ]
    };

    const renderComponent = (props = {}) => {
        return render(
            <ThemeProvider theme={theme}>
                <EnhancedChartVisualization
                    planets={mockPlanets}
                    houses={mockHouses}
                    aspects={mockAspects}
                    confidenceMetrics={mockConfidenceMetrics}
                    mlInsights={mockMLInsights}
                    {...props}
                />
            </ThemeProvider>
        );
    };

    it('renders interactive planetary positions', () => {
        renderComponent();
        const planets = screen.getAllByRole('button', { name: /Planet/ });
        expect(planets).toHaveLength(mockPlanets.length);

        // Test planet interaction
        fireEvent.mouseEnter(planets[0]);
        expect(screen.getByText(mockPlanets[0].name)).toBeInTheDocument();
        expect(screen.getByText(`Strength: ${mockPlanets[0].strength}`)).toBeInTheDocument();
    });

    it('handles dynamic transitions', () => {
        renderComponent();
        const chart = screen.getByRole('img');
        
        // Test state transition
        fireEvent.click(chart);
        expect(chart).toHaveStyle('transition: transform 0.3s ease-in-out');
    });

    it('provides detailed planetary information', () => {
        renderComponent();
        const planet = screen.getAllByRole('button', { name: /Planet/ })[0];
        
        // Test planet details
        fireEvent.click(planet);
        expect(screen.getByText(mockPlanets[0].dignity as string)).toBeInTheDocument();
        expect(screen.getByText(`House ${mockPlanets[0].house}`)).toBeInTheDocument();
    });

    it('implements accessibility features', () => {
        renderComponent();
        
        // Test ARIA labels
        expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Birth Chart Visualization');
        expect(screen.getAllByRole('button', { name: /Planet/ })[0]).toHaveAttribute('aria-label', 'Planet Sun');
        
        // Test keyboard navigation
        fireEvent.keyDown(document, { key: '+' });
        fireEvent.keyDown(document, { key: '-' });
        fireEvent.keyDown(document, { key: 'r' });
    });

    it('provides zoom and pan controls', () => {
        renderComponent();
        
        // Test zoom controls
        const zoomIn = screen.getByRole('button', { name: /zoom in/i });
        const zoomOut = screen.getByRole('button', { name: /zoom out/i });
        const reset = screen.getByRole('button', { name: /reset/i });
        
        fireEvent.click(zoomIn);
        fireEvent.click(zoomOut);
        fireEvent.click(reset);
        
        // Test pan functionality
        const chart = screen.getByRole('img');
        fireEvent.mouseDown(chart, { clientX: 0, clientY: 0 });
        fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
        fireEvent.mouseUp(document);
    });

    it('displays confidence metrics', () => {
        renderComponent();
        
        // Test confidence visualization
        expect(screen.getByText('85%')).toBeInTheDocument();
        const confidenceBar = screen.getByRole('img').querySelector('rect:nth-child(2)');
        expect(confidenceBar).toHaveAttribute('width', '68'); // 80 * 0.85
    });

    it('shows ML insights', () => {
        renderComponent();
        
        // Test ML insights visualization
        expect(screen.getByText('Strong Jupiter pattern')).toBeInTheDocument();
        expect(screen.getByText('Consider earlier time')).toBeInTheDocument();
    });

    it('handles window resize', () => {
        const { rerender } = renderComponent({ width: 800, height: 800 });
        
        // Test resize handling
        rerender(
            <ThemeProvider theme={theme}>
                <EnhancedChartVisualization
                    planets={mockPlanets}
                    houses={mockHouses}
                    aspects={mockAspects}
                    width={600}
                    height={600}
                />
            </ThemeProvider>
        );
        
        const chart = screen.getByRole('img');
        expect(chart).toHaveAttribute('width', '600');
        expect(chart).toHaveAttribute('height', '600');
    });

    it('maintains aspect ratios during transformations', () => {
        renderComponent();
        const chart = screen.getByRole('img');
        
        // Test zoom transformation
        fireEvent.click(screen.getByRole('button', { name: /zoom in/i }));
        expect(chart).toHaveStyle({ transform: expect.stringContaining('scale(1.2)') });
        
        // Test pan transformation
        fireEvent.mouseDown(chart, { clientX: 0, clientY: 0 });
        fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
        fireEvent.mouseUp(document);
        expect(chart).toHaveStyle({ transform: expect.stringContaining('translate(100px, 100px)') });
    });
}); 