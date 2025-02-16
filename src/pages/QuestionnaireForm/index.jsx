'use client';

import { useState } from 'react';
import { Button, TextField, Paper, Typography, Box } from '@mui/material';

export function QuestionnaireForm({ analysisData, onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    birthLocation: '',
    birthDate: '',
    significantEvents: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Paper elevation={3} className="p-6 max-w-2xl mx-auto">
      <Typography variant="h4" component="h1" gutterBottom>
        Birth Time Questionnaire
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box className="space-y-4">
          <TextField
            fullWidth
            label="Birth Location"
            name="birthLocation"
            value={formData.birthLocation}
            onChange={handleChange}
            required
          />
          
          <TextField
            fullWidth
            label="Birth Date"
            name="birthDate"
            type="datetime-local"
            value={formData.birthDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          
          <TextField
            fullWidth
            label="Significant Life Events"
            name="significantEvents"
            multiline
            rows={4}
            value={formData.significantEvents}
            onChange={handleChange}
            helperText="Please list any significant life events that might help with birth time rectification"
          />
          
          <Box className="flex justify-between pt-4">
            <Button variant="outlined" onClick={onBack}>
              Back
            </Button>
            <Button variant="contained" type="submit">
              Next
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
} 