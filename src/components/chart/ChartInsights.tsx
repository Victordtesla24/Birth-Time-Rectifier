import React from 'react';
import {
    Box,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
    LinearProgress,
    Chip,
    useTheme,
    Paper,
    SxProps,
    Theme,
} from '@mui/material';
import { Planet, House, Aspect } from '../../types/shared';
import { ConfidenceMetrics, MLInsights } from './ChartTypes';
import { ChartInsightsProps } from './types';

export const ChartInsights: React.FC<ChartInsightsProps> = ({
    selectedPlanet,
    hoveredAspect,
    confidenceMetrics,
    mlInsights,
    sx
}) => {
    const theme = useTheme();
    
    const renderPlanetInfo = () => {
        if (!selectedPlanet) return null;
        
        return (
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    {selectedPlanet.name}
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemText
                            primary="Position"
                            secondary={`${selectedPlanet.longitude.toFixed(2)}° in House ${selectedPlanet.house}`}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Motion"
                            secondary={`${selectedPlanet.isRetrograde ? 'Retrograde' : 'Direct'} at ${Math.abs(selectedPlanet.speed).toFixed(2)}°/day`}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Dignity"
                            secondary={selectedPlanet.dignity}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Strength"
                            secondary={
                                <LinearProgress
                                    variant="determinate"
                                    value={selectedPlanet.strength * 100}
                                    sx={{ mt: 1 }}
                                />
                            }
                        />
                    </ListItem>
                </List>
            </Box>
        );
    };
    
    const renderAspectInfo = () => {
        if (!hoveredAspect) return null;
        
        return (
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Aspect Details
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    {hoveredAspect.planet1} {hoveredAspect.type} {hoveredAspect.planet2}
                </Typography>
                <Typography variant="body2" paragraph>
                    {hoveredAspect.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                        label={`${hoveredAspect.angle.toFixed(1)}°`}
                        size="small"
                        color="primary"
                    />
                    <Chip
                        label={`Orb: ${hoveredAspect.orb.toFixed(1)}°`}
                        size="small"
                        variant="outlined"
                    />
                </Box>
            </Box>
        );
    };
    
    const renderConfidenceMetrics = () => {
        if (!confidenceMetrics) return null;
        
        return (
            <Box sx={{ mb: 3 }} data-testid="confidence-metrics">
                <Typography variant="h6" gutterBottom>
                    Confidence Metrics
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemText
                            primary="Overall Confidence"
                            secondary={
                                <LinearProgress
                                    variant="determinate"
                                    value={confidenceMetrics.overallConfidence * 100}
                                    sx={{ mt: 1 }}
                                />
                            }
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Planetary Strength"
                            secondary={
                                <LinearProgress
                                    variant="determinate"
                                    value={confidenceMetrics.planetaryStrength * 100}
                                    sx={{ mt: 1 }}
                                />
                            }
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Aspect Harmony"
                            secondary={
                                <LinearProgress
                                    variant="determinate"
                                    value={confidenceMetrics.aspectHarmony * 100}
                                    sx={{ mt: 1 }}
                                />
                            }
                        />
                    </ListItem>
                </List>
            </Box>
        );
    };
    
    const renderMLInsights = () => {
        if (!mlInsights) return null;
        
        return (
            <Box>
                <Typography variant="h6" gutterBottom>
                    AI Insights
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                    Predicted Events
                </Typography>
                <List dense>
                    {mlInsights.predictedEvents.map((event, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={event.type}
                                secondary={
                                    <>
                                        <Typography variant="body2" color="text.secondary">
                                            {event.timeframe} ({(event.probability * 100).toFixed(1)}% probability)
                                        </Typography>
                                        <Typography variant="body2">
                                            {event.description}
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Karmatic Patterns
                </Typography>
                <List dense>
                    {mlInsights.karmaticPatterns.map((pattern, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={pattern.pattern}
                                secondary={
                                    <>
                                        <LinearProgress
                                            variant="determinate"
                                            value={pattern.strength * 100}
                                            sx={{ mt: 1, mb: 1 }}
                                        />
                                        <Typography variant="body2">
                                            {pattern.interpretation}
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        );
    };
    
    return (
        <Paper elevation={2} sx={{ p: 2, ...sx }} data-testid="chart-insights">
            <Typography variant="h6" gutterBottom>
                Chart Insights
            </Typography>
            
            {confidenceMetrics && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Birth Time Confidence
                    </Typography>
                    <Typography variant="body1">
                        {Math.round(confidenceMetrics.overallConfidence * 100)}%
                    </Typography>
                </Box>
            )}

            {selectedPlanet && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Selected Planet
                    </Typography>
                    <Typography variant="body1">
                        {selectedPlanet.name}
                    </Typography>
                    {selectedPlanet.strength && (
                        <Typography variant="body2">
                            Strength: {Math.round(selectedPlanet.strength * 100)}%
                        </Typography>
                    )}
                </Box>
            )}

            {hoveredAspect && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Aspect Details
                    </Typography>
                    <Typography variant="body1">
                        {hoveredAspect.type}
                    </Typography>
                    {hoveredAspect.strength && (
                        <Typography variant="body2">
                            Significance: {hoveredAspect.strength} planets
                        </Typography>
                    )}
                </Box>
            )}

            {selectedPlanet && <Divider sx={{ my: 2 }} />}
            {renderAspectInfo()}
            {hoveredAspect && <Divider sx={{ my: 2 }} />}
            {confidenceMetrics && renderConfidenceMetrics()}
            {confidenceMetrics && mlInsights && <Divider sx={{ my: 2 }} />}
            {mlInsights && renderMLInsights()}
        </Paper>
    );
}; 