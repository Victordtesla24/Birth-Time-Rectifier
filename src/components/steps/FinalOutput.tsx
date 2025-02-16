import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Divider
} from '@mui/material';

const FinalOutput = ({ birthData, rectifiedTime, onBack }) => {
  const handleDownload = () => {
    // Create a text representation of the report
    const report = `
Birth Time Rectification Report

Original Birth Information:
Date: ${birthData.birthDate?.toLocaleDateString()}
Time: ${birthData.birthTime?.toLocaleTimeString()}
Location: ${birthData.location}

Rectified Birth Time: ${rectifiedTime?.toLocaleTimeString()}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    // Create a blob and download it
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'birth-time-rectification-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Final Rectification Report
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Original Birth Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body1">
                {birthData.birthDate?.toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Time
              </Typography>
              <Typography variant="body1">
                {birthData.birthTime?.toLocaleTimeString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1">
                {birthData.location}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rectified Birth Time
              </Typography>
              <Typography variant="h3">
                {rectifiedTime?.toLocaleTimeString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Important Notes
        </Typography>
        <Typography variant="body1" paragraph>
          This rectified birth time has been calculated using advanced astrological techniques
          and analysis of life events. The accuracy of this rectification depends on the
          quality and accuracy of the input data provided.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          It is recommended to verify this rectified time through:
        </Typography>
        <ul>
          <li>
            <Typography variant="body2">
              Correlation with past life events
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Future predictions and transits
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Consultation with an experienced astrologer
            </Typography>
          </li>
        </ul>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleDownload}
        >
          Download Report
        </Button>
      </Box>
    </Box>
  );
};

export default FinalOutput; 