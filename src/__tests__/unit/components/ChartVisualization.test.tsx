import React from 'react';
import { render, screen } from '@tests/testSetup';
import { ChartVisualization } from '@/components/chart/ChartVisualization';
import { mockChartData } from '@tests/fixtures/mockChartData';
import { canvasManager } from '@tests/mocks/animation';
import type { ChartData } from '@/types/shared';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
    ...jest.requireActual('@tests/mocks/mui'),
}));

// Mock canvas
jest.mock('canvas', () => canvasManager);

// Mock VisualizationManager
jest.mock('@/services/visualization', () => ({
    VisualizationManager: jest.fn().mockImplementation(() => ({
        drawChart: jest.fn(),
        destroy: jest.fn(),
    })),
}));

describe('ChartVisualization', () => {
    const defaultProps = {
        data: mockChartData,
        width: 800,
        height: 600,
        onChartReady: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<ChartVisualization {...defaultProps} />);
        expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    });

    it('renders with default dimensions', () => {
        render(<ChartVisualization data={mockChartData} />);
        const container = screen.getByTestId('chart-container');
        expect(container).toHaveStyle({ width: '800px', height: '600px' });
    });

    it('renders with custom dimensions', () => {
        render(
            <ChartVisualization
                data={mockChartData}
                width={1000}
                height={800}
            />
        );
        const container = screen.getByTestId('chart-container');
        expect(container).toHaveStyle({ width: '1000px', height: '800px' });
    });

    it('calls onChartReady when visualization is initialized', () => {
        render(<ChartVisualization {...defaultProps} />);
        expect(defaultProps.onChartReady).toHaveBeenCalled();
    });

    it('cleans up visualization on unmount', () => {
        const { unmount } = render(<ChartVisualization {...defaultProps} />);
        unmount();
        // Verify destroy is called
        expect(require('@/services/visualization').VisualizationManager.mock.results[0].value.destroy).toHaveBeenCalled();
    });

    it('updates visualization when data changes', () => {
        const { rerender } = render(<ChartVisualization {...defaultProps} />);
        
        const updatedData: ChartData = {
            ...mockChartData,
            planets: [
                ...mockChartData.planets,
                {
                    name: 'NewPlanet',
                    longitude: 180,
                    latitude: 0,
                    speed: 1,
                    house: 7,
                    sign: 'Libra',
                    isRetrograde: false,
                    aspects: []
                }
            ]
        };
        
        rerender(
            <ChartVisualization
                {...defaultProps}
                data={updatedData}
            />
        );
        
        // Verify drawChart is called with updated data
        expect(require('@/services/visualization').VisualizationManager.mock.results[0].value.drawChart).toHaveBeenCalledWith(updatedData);
    });

    it('maintains aspect ratio during resize', () => {
        const { rerender } = render(<ChartVisualization {...defaultProps} />);
        
        rerender(
            <ChartVisualization
                {...defaultProps}
                width={400}
                height={300}
            />
        );
        
        const container = screen.getByTestId('chart-container');
        expect(container).toHaveStyle({ width: '400px', height: '300px' });
    });
}); 