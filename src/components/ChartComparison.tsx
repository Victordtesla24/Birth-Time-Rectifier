import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, useTheme, Tooltip, LinearProgress } from '@mui/material';
import BirthChartVisualization from './BirthChartVisualization';

interface ChartData {
  id: string;
  title: string;
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  confidenceMetrics?: ConfidenceMetrics;
}

interface ChartComparisonProps {
  charts: ChartData[];
  width?: number;
  height?: number;
  onPlanetClick?: (chartId: string, planet: Planet) => void;
  onHouseClick?: (chartId: string, house: House) => void;
  onAspectHover?: (chartId: string, aspect: Aspect) => void;
}

const ChartDifferences = ({ chart1, chart2 }: { chart1: ChartData; chart2: ChartData }) => {
  // Calculate differences between charts
  const differences = React.useMemo(() => {
    const diffs: Array<{
      planet: string;
      difference: number;
      significance: 'high' | 'medium' | 'low';
    }> = [];
    
    chart1.planets.forEach(planet1 => {
      const planet2 = chart2.planets.find(p => p.name === planet1.name);
      if (planet2) {
        const diff = Math.abs(planet1.longitude - planet2.longitude);
        const adjustedDiff = diff > 180 ? 360 - diff : diff;
        
        diffs.push({
          planet: planet1.name,
          difference: adjustedDiff,
          significance: adjustedDiff > 5 ? 'high' : adjustedDiff > 2 ? 'medium' : 'low'
        });
      }
    });
    
    return diffs.sort((a, b) => b.difference - a.difference);
  }, [chart1.planets, chart2.planets]);
  
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Key Differences
      </Typography>
      {differences.map(diff => (
        <Box
          key={diff.planet}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Typography>{diff.planet}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              color={
                diff.significance === 'high'
                  ? 'error.main'
                  : diff.significance === 'medium'
                  ? 'warning.main'
                  : 'success.main'
              }
            >
              {`${diff.difference.toFixed(2)}°`}
            </Typography>
            <Tooltip title={`${diff.significance} significance`}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor:
                    diff.significance === 'high'
                      ? 'error.main'
                      : diff.significance === 'medium'
                      ? 'warning.main'
                      : 'success.main'
                }}
              />
            </Tooltip>
          </Box>
        </Box>
      ))}
    </Paper>
  );
};

const ChartComparison: React.FC<ChartComparisonProps> = ({
  charts,
  width = 400,
  height = 400,
  onPlanetClick,
  onHouseClick,
  onAspectHover,
}) => {
  const theme = useTheme();
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  
  const handleChartSelect = (chartId: string) => {
    setSelectedCharts(prev => {
      if (prev.includes(chartId)) {
        return prev.filter(id => id !== chartId);
      }
      if (prev.length < 2) {
        return [...prev, chartId];
      }
      return [prev[1], chartId];
    });
  };
  
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Chart Comparison
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Select up to two charts to compare their differences
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {charts.map((chart) => (
          <Grid item xs={12} md={6} key={chart.id}>
            <Paper
              elevation={selectedCharts.includes(chart.id) ? 8 : 2}
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: selectedCharts.includes(chart.id)
                  ? `2px solid ${theme.palette.primary.main}`
                  : 'none',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
              onClick={() => handleChartSelect(chart.id)}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: theme.palette.text.primary,
                  textAlign: 'center',
                }}
              >
                {chart.title}
              </Typography>
              
              <BirthChartVisualization
                planets={chart.planets}
                houses={chart.houses}
                aspects={chart.aspects}
                confidenceMetrics={chart.confidenceMetrics}
                width={width}
                height={height}
                onPlanetClick={(planet) => onPlanetClick?.(chart.id, planet)}
                onHouseClick={(house) => onHouseClick?.(chart.id, house)}
                onAspectHover={(aspect) => onAspectHover?.(chart.id, aspect)}
              />
              
              {chart.confidenceMetrics && (
                <Box sx={{ mt: 2, width: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Confidence Metrics
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={chart.confidenceMetrics.overall * 100}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {`Overall Confidence: ${(chart.confidenceMetrics.overall * 100).toFixed(1)}%`}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {selectedCharts.length === 2 && (
        <ChartDifferences
          chart1={charts.find(c => c.id === selectedCharts[0])!}
          chart2={charts.find(c => c.id === selectedCharts[1])!}
        />
      )}
    </Box>
  );
};

export default ChartComparison; 