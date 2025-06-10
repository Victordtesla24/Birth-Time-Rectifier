import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { ConfidenceMetrics } from './types';

interface ConfidenceIndicatorProps {
    metrics: ConfidenceMetrics;
    width: number;
    height: number;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
    metrics,
    width,
    height
}) => {
    const indicators = [
        { label: 'Overall', value: metrics.overall },
        { label: 'Planetary', value: metrics.planetary },
        { label: 'Dasha', value: metrics.dasha },
        { label: 'Events', value: metrics.events },
        { label: 'Appearance', value: metrics.appearance }
    ];

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                width: 200,
                backgroundColor: 'background.paper',
                borderRadius: 1,
                padding: 2,
                boxShadow: 1,
            }}
        >
            <Typography variant="subtitle2" gutterBottom>
                Confidence Metrics
            </Typography>
            
            {indicators.map(({ label, value }) => (
                <Box key={label} sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">{label}</Typography>
                        <Typography variant="caption">{Math.round(value * 100)}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={value * 100}
                        sx={{
                            height: 4,
                            borderRadius: 2,
                        }}
                    />
                </Box>
            ))}
        </Box>
    );
}; 