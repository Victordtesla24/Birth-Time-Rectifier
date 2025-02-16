import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { Planet, House, Aspect } from '../types/shared';

interface ChartInsightsProps {
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  confidence?: number;
}

export const ChartInsights: React.FC<ChartInsightsProps> = ({
  planets,
  houses,
  aspects,
  confidence = 0
}) => {
  const getPlanetaryStrength = (planet: Planet) => {
    // Calculate planetary strength based on position and aspects
    const aspectStrength = aspects
      .filter(a => a.planet1 === planet.id || a.planet2 === planet.id)
      .reduce((sum, aspect) => sum + aspect.strength, 0);
    
    return aspectStrength / 10; // Normalize to 0-1 scale
  };

  const getHouseSignificance = (house: House) => {
    // Calculate house significance based on planets and aspects
    const planetsInHouse = planets.filter(p => 
      p.longitude >= house.startDegree && 
      p.longitude < house.endDegree
    );
    
    return planetsInHouse.length;
  };

  return (
    <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Chart Insights
      </Typography>
      
      {confidence > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Birth Time Confidence
          </Typography>
          <Typography variant="body1">
            {Math.round(confidence * 100)}%
          </Typography>
        </Box>
      )}

      <List>
        {planets.map(planet => (
          <ListItem key={planet.id} divider>
            <ListItemText
              primary={planet.name}
              secondary={`Strength: ${Math.round(getPlanetaryStrength(planet) * 100)}%`}
            />
          </ListItem>
        ))}
        
        {houses.map(house => (
          <ListItem key={house.id} divider>
            <ListItemText
              primary={`House ${house.number}`}
              secondary={`Significance: ${getHouseSignificance(house)} planets`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}; 