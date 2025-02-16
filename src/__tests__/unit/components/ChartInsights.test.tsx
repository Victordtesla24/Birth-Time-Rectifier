import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChartInsights } from '../../../components/chart/ChartInsights';
import { mockPlanets, mockHouses, mockAspects } from '../../fixtures/mockChartData';

const defaultProps = {
    planets: mockPlanets,
    houses: mockHouses,
    aspects: mockAspects,
    confidence: 0.85
};

describe('ChartInsights', () => {
    it('renders chart insights', () => {
        render(<ChartInsights {...defaultProps} />);
        expect(screen.getByText('Chart Insights')).toBeInTheDocument();
    });

    it('displays birth time confidence', () => {
        render(<ChartInsights {...defaultProps} />);
        expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('shows planetary information', () => {
        render(<ChartInsights {...defaultProps} />);
        mockPlanets.forEach(planet => {
            expect(screen.getByText(planet.name)).toBeInTheDocument();
        });
    });

    it('shows house information', () => {
        render(<ChartInsights {...defaultProps} />);
        mockHouses.forEach(house => {
            expect(screen.getByText(`House ${house.number}`)).toBeInTheDocument();
        });
    });

    it('calculates and displays planetary strengths', () => {
        render(<ChartInsights {...defaultProps} />);
        expect(screen.getByText(/Strength: \d+%/)).toBeInTheDocument();
    });

    it('calculates and displays house significances', () => {
        render(<ChartInsights {...defaultProps} />);
        expect(screen.getByText(/Significance: \d+ planets/)).toBeInTheDocument();
    });
}); 