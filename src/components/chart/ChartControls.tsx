import React from 'react';
import { Box, IconButton, Tooltip, SxProps, Theme } from '@mui/material';
import {
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    RestartAlt as ResetIcon,
    Fullscreen as FullscreenIcon,
    HighlightAlt as SelectIcon,
    PanTool as PanIcon
} from '@mui/icons-material';

interface ChartControlsProps {
    onZoom: (event: any) => void;
    onReset: () => void;
    onToggleFullscreen?: () => void;
    onToggleMode?: (mode: 'select' | 'pan') => void;
    currentMode?: 'select' | 'pan';
    isFullscreen?: boolean;
    style?: SxProps<Theme>;
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
    onZoom,
    onReset,
    onToggleFullscreen,
    onToggleMode,
    currentMode = 'select',
    isFullscreen = false,
    style,
    zoom,
    onZoomIn,
    onZoomOut
}) => {
    const handleZoomIn = () => {
        onZoom({ deltaY: -1 });
    };
    
    const handleZoomOut = () => {
        onZoom({ deltaY: 1 });
    };
    
    return (
        <Box
            data-testid="chart-controls"
            sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                backgroundColor: 'background.paper',
                borderRadius: 1,
                padding: 1,
                boxShadow: 1,
                ...style
            }}
        >
            <Tooltip title="Zoom In">
                <IconButton onClick={onZoomIn} disabled={zoom >= 4}>
                    <ZoomInIcon />
                </IconButton>
            </Tooltip>
            
            <Tooltip title="Zoom Out">
                <IconButton onClick={onZoomOut} disabled={zoom <= 0.5}>
                    <ZoomOutIcon />
                </IconButton>
            </Tooltip>
            
            <Tooltip title="Reset View">
                <IconButton onClick={onReset}>
                    <ResetIcon />
                </IconButton>
            </Tooltip>
            
            {onToggleMode && (
                <>
                    <Tooltip title="Select Mode" placement="left">
                        <IconButton
                            onClick={() => onToggleMode('select')}
                            color={currentMode === 'select' ? 'primary' : 'default'}
                            size="small"
                            data-testid="select-mode-button"
                            aria-label="Select Mode"
                        >
                            <SelectIcon />
                        </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Pan Mode" placement="left">
                        <IconButton
                            onClick={() => onToggleMode('pan')}
                            color={currentMode === 'pan' ? 'primary' : 'default'}
                            size="small"
                            data-testid="pan-mode-button"
                            aria-label="Pan Mode"
                        >
                            <PanIcon />
                        </IconButton>
                    </Tooltip>
                </>
            )}
            
            {onToggleFullscreen && (
                <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"} placement="left">
                    <IconButton
                        onClick={onToggleFullscreen}
                        size="small"
                        data-testid="fullscreen-button"
                        aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                        sx={{ transform: isFullscreen ? 'rotate(180deg)' : 'none' }}
                    >
                        <FullscreenIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
};

export const PanInstructions: React.FC = () => (
    <Box
        position="absolute"
        bottom={16}
        left={16}
        bgcolor="background.paper"
        borderRadius={1}
        boxShadow={1}
        p={2}
    >
        <Box display="flex" alignItems="center" gap={1}>
            <PanIcon fontSize="small" />
            Click and drag to pan
        </Box>
    </Box>
); 