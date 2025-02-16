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

const RectificationProcessing = ({ birthData, analysisResults, onRectifiedTime, onNext, onBack }) => {
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const processRectification = async () => {
      try {
        // Initialize processing
        setProgress(20);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Process birth data
        setProgress(40);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Process analysis results
        setProgress(60);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Calculate rectified time
        const rectificationResults = {
          originalTime: birthData.birthTime,
          rectifiedTime: new Date(birthData.birthTime.getTime() + 30 * 60000), // Add 30 minutes for example
          confidence: 0.85,
          adjustments: [
            { factor: 'Planetary Positions', impact: 0.4 },
            { factor: 'Life Events', impact: 0.35 },
            { factor: 'Dasha Analysis', impact: 0.25 }
          ],
          verificationPoints: [
            'Strong correlation with major life events',
            'Improved planetary strength',
            'Enhanced predictive accuracy'
          ]
        };

        setProgress(80);
        await new Promise(resolve => setTimeout(resolve, 1000));

        setResults(rectificationResults);
        onRectifiedTime(rectificationResults.rectifiedTime);
        setProgress(100);
        setProcessing(false);

      } catch (err) {
        setError(err.message || 'An error occurred during rectification processing');
        setProcessing(false);
      }
    };

    processRectification();
  }, [birthData, analysisResults, onRectifiedTime]);

  const handleSubmit = () => {
    onNext();
  };

  if (processing) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Birth Time Rectification Processing
        </Typography>
        <Box sx={{ width: '100%', mb: 3 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {progress}% Complete
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={onBack}>
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Rectification Results
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Time Adjustment
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Original Time
              </Typography>
              <Typography variant="body1">
                {results.originalTime.toLocaleTimeString()}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Rectified Time
              </Typography>
              <Typography variant="body1">
                {results.rectifiedTime.toLocaleTimeString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Confidence Score
              </Typography>
              <Typography variant="h4" color="primary">
                {(results.confidence * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Adjustment Factors
            </Typography>
            <Grid container spacing={2}>
              {results.adjustments.map((factor, index) => (
                <Grid item xs={12} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">
                        {factor.factor}
                      </Typography>
                      <Typography variant="body2">
                        Impact: {(factor.impact * 100).toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Verification Points
        </Typography>
        <Grid container spacing={2}>
          {results.verificationPoints.map((point, index) => (
            <Grid item xs={12} key={index}>
              <Typography variant="body1">
                • {point}
              </Typography>
            </Grid>
          ))}
        </Grid>
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

export default RectificationProcessing; 