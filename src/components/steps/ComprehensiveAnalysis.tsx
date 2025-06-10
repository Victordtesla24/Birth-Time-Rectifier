import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Alert
} from '@mui/material';

const ComprehensiveAnalysis = ({ birthData, researchData, onAnalysisResults, onNext, onBack }) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const performAnalysis = async () => {
      try {
        setError(null);
        setAnalyzing(true);
        setProgress(0);
        
        // Simulate analysis steps
        setProgress(20);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Analyze birth data
        setProgress(40);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Analyze life events
        setProgress(60);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate analysis results
        const results = {
          birthChart: {
            ascendant: 123.45,
            planets: {
              Sun: { position: 45.67, strength: 0.8 },
              Moon: { position: 156.78, strength: 0.7 },
              Mars: { position: 234.56, strength: 0.6 }
            }
          },
          eventCorrelations: researchData.map(event => ({
            event: event.text,
            timestamp: event.timestamp,
            planetaryInfluences: [
              { planet: 'Sun', strength: 0.75 },
              { planet: 'Moon', strength: 0.65 }
            ]
          })),
          confidenceScore: 0.85
        };

        setProgress(80);
        await new Promise(resolve => setTimeout(resolve, 1000));

        setAnalysis(results);
        onAnalysisResults(results);
        setProgress(100);
        setAnalyzing(false);

      } catch (err) {
        setError(err.message || 'An error occurred during analysis');
        setAnalyzing(false);
        setProgress(0);
      }
    };

    performAnalysis();
  }, [birthData, researchData, onAnalysisResults]);

  const handleSubmit = () => {
    onNext();
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Comprehensive Analysis
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }} role="alert">
          {error}
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3 }}>
          <Button onClick={onBack}>
            Back
          </Button>
        </Box>
      </Box>
    );
  }

  if (analyzing && !error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Comprehensive Analysis
        </Typography>
        {!error && (
          <Box sx={{ width: '100%', mb: 3 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {progress}% Complete
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Analysis Results
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Birth Chart Analysis
            </Typography>
            <Typography variant="body2" gutterBottom>
              Ascendant: {analysis.birthChart.ascendant.toFixed(2)}°
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(analysis.birthChart.planets).map(([planet, data]) => (
                <Grid item xs={12} sm={6} key={planet}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">
                        {planet}
                      </Typography>
                      <Typography variant="body2">
                        Position: {data.position.toFixed(2)}°
                      </Typography>
                      <Typography variant="body2">
                        Strength: {(data.strength * 100).toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Event Correlations
            </Typography>
            {analysis.eventCorrelations.map((correlation, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  {correlation.event}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {correlation.timestamp.toLocaleString()}
                </Typography>
                <Grid container spacing={1}>
                  {correlation.planetaryInfluences.map((influence, i) => (
                    <Grid item xs={6} key={i}>
                      <Typography variant="body2">
                        {influence.planet}: {(influence.strength * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Overall Confidence Score
        </Typography>
        <Typography variant="h4" color="primary">
          {(analysis.confidenceScore * 100).toFixed(1)}%
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default ComprehensiveAnalysis; 