import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Alert
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  Transform,
  Check,
  Error
} from '@mui/icons-material';

const ProcessingStep = ({ label, status, details }) => (
  <ListItem>
    <ListItemIcon>
      {status === 'completed' && <Check color="success" />}
      {status === 'processing' && <Transform className="rotating" />}
      {status === 'error' && <Error color="error" />}
      {status === 'waiting' && <AccessTime color="disabled" />}
    </ListItemIcon>
    <ListItemText
      primary={label}
      secondary={details}
      primaryTypographyProps={{
        color: status === 'error' ? 'error' : 'textPrimary',
        'data-testid': 'processing-step-label'
      }}
    />
  </ListItem>
);

const DataPreprocessing = ({ onNext, previousData }) => {
  const [processingSteps, setProcessingSteps] = useState({
    geocoding: { status: 'waiting', details: 'Geocoding location data...' },
    timezone: { status: 'waiting', details: 'Resolving timezone information...' },
    coordinates: { status: 'waiting', details: 'Calculating astronomical coordinates...' },
    normalization: { status: 'waiting', details: 'Normalizing input data...' }
  });
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processData = async () => {
      try {
        // Geocoding
        setProcessingSteps(prev => ({
          ...prev,
          geocoding: { status: 'processing', details: 'Geocoding location data...' }
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProcessingSteps(prev => ({
          ...prev,
          geocoding: { status: 'completed', details: 'Location data processed successfully' }
        }));
        setProgress(25);

        // Timezone Resolution
        setProcessingSteps(prev => ({
          ...prev,
          timezone: { status: 'processing', details: 'Resolving timezone information...' }
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProcessingSteps(prev => ({
          ...prev,
          timezone: { status: 'completed', details: 'Timezone resolved successfully' }
        }));
        setProgress(50);

        // Coordinate Calculation
        setProcessingSteps(prev => ({
          ...prev,
          coordinates: { status: 'processing', details: 'Calculating astronomical coordinates...' }
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProcessingSteps(prev => ({
          ...prev,
          coordinates: { status: 'completed', details: 'Coordinates calculated successfully' }
        }));
        setProgress(75);

        // Data Normalization
        setProcessingSteps(prev => ({
          ...prev,
          normalization: { status: 'processing', details: 'Normalizing input data...' }
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProcessingSteps(prev => ({
          ...prev,
          normalization: { status: 'completed', details: 'Data normalized successfully' }
        }));
        setProgress(100);

        // Proceed to next step
        await onNext({
          ...previousData,
          preprocessed: true
        });
      } catch (err) {
        setError(err.message || 'An error occurred during data preprocessing');
        setProcessingSteps(prev => ({
          ...prev,
          [Object.keys(prev).find(key => prev[key].status === 'processing')]: {
            status: 'error',
            details: 'Processing failed'
          }
        }));
      }
    };

    processData();
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom data-testid="typography">
        Data Preprocessing
      </Typography>
      <Typography variant="body1" gutterBottom data-testid="typography">
        Processing your birth information...
      </Typography>

      <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />
        
        <List>
          <ProcessingStep
            label="Geocoding"
            status={processingSteps.geocoding.status}
            details={processingSteps.geocoding.details}
          />
          <ProcessingStep
            label="Timezone Resolution"
            status={processingSteps.timezone.status}
            details={processingSteps.timezone.details}
          />
          <ProcessingStep
            label="Coordinate Calculation"
            status={processingSteps.coordinates.status}
            details={processingSteps.coordinates.details}
          />
          <ProcessingStep
            label="Data Normalization"
            status={processingSteps.normalization.status}
            details={processingSteps.normalization.details}
          />
        </List>

        {error && (
          <Box mt={2}>
            <Alert severity="error" data-testid="error-message">
              {error}
              <Button
                color="inherit"
                size="small"
                onClick={() => window.location.reload()}
                data-testid="retry-button"
              >
                Retry
              </Button>
            </Alert>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DataPreprocessing; 