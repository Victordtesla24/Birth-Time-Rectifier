/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React, { PropsWithChildren } from 'react';
import { render, screen, fireEvent } from '@tests/testSetup';
import '@testing-library/jest-dom';
import { ChartControls } from '@/components/chart/ChartControls';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/theme';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
    ...jest.requireActual('@tests/mocks/mui'),
}));

// Mock Material-UI icons
jest.mock('@mui/icons-material', () => ({
    ...jest.requireActual('@tests/mocks/mui/icons'),
}));

const onZoom = jest.fn();
const onReset = jest.fn();
const onZoomIn = jest.fn();
const onZoomOut = jest.fn();
const onToggleMode = jest.fn();
const onToggleFullscreen = jest.fn();

const defaultProps = {
    onZoom,
    onReset,
    onZoomIn,
    onZoomOut,
    zoom: 1,
    onToggleMode,
    onToggleFullscreen,
    currentMode: 'select' as const,
    isFullscreen: false
};

describe('ChartControls', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders zoom controls', () => {
        render(
            <ThemeProvider theme={theme}>
                <ChartControls {...defaultProps} />
            </ThemeProvider>
        );
        expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
    });

    it('renders mode toggle buttons', () => {
        render(<ChartControls {...defaultProps} />);
        expect(screen.getByRole('button', { name: /select mode/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /pan mode/i })).toBeInTheDocument();
    });

    it('renders fullscreen toggle button', () => {
        render(<ChartControls {...defaultProps} />);
        expect(screen.getByRole('button', { name: /enter fullscreen/i })).toBeInTheDocument();
    });

    it('calls onZoomIn when zoom in button is clicked', () => {
        render(<ChartControls {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /zoom in/i }));
        expect(onZoomIn).toHaveBeenCalled();
    });

    it('calls onZoomOut when zoom out button is clicked', () => {
        render(<ChartControls {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /zoom out/i }));
        expect(onZoomOut).toHaveBeenCalled();
    });

    it('calls onReset when reset button is clicked', () => {
        render(<ChartControls {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /reset view/i }));
        expect(onReset).toHaveBeenCalled();
    });

    it('calls onToggleMode when mode buttons are clicked', () => {
        render(<ChartControls {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /pan mode/i }));
        expect(onToggleMode).toHaveBeenCalledWith('pan');

        fireEvent.click(screen.getByRole('button', { name: /select mode/i }));
        expect(onToggleMode).toHaveBeenCalledWith('select');
    });

    it('calls onToggleFullscreen when fullscreen button is clicked', () => {
        render(<ChartControls {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /enter fullscreen/i }));
        expect(onToggleFullscreen).toHaveBeenCalled();
    });

    it('disables zoom buttons at limits', () => {
        render(<ChartControls {...defaultProps} zoom={4} />);
        expect(screen.getByRole('button', { name: /zoom in/i })).toBeDisabled();

        render(<ChartControls {...defaultProps} zoom={0.5} />);
        expect(screen.getByRole('button', { name: /zoom out/i })).toBeDisabled();
    });
}); 