import React, { useState } from 'react';
import { Box, TextField, Button, Typography, FormHelperText } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const PreliminaryChart = ({ birthData, onBirthDataChange, onNext }) => {
  const [errors, setErrors] = useState({});

  const handleDateChange = (date) => {
    setErrors(prev => ({ ...prev, birthDate: '' }));
    onBirthDataChange({ ...birthData, birthDate: date });
  };

  const handleTimeChange = (time) => {
    setErrors(prev => ({ ...prev, birthTime: '' }));
    onBirthDataChange({ ...birthData, birthTime: time });
  };

  const handleLocationChange = (event) => {
    setErrors(prev => ({ ...prev, location: '' }));
    onBirthDataChange({ ...birthData, location: event.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!birthData.birthDate) newErrors.birthDate = 'Birth date is required';
    if (!birthData.birthTime) newErrors.birthTime = 'Birth time is required';
    if (!birthData.location) newErrors.location = 'Birth location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Birth Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 400, mx: 'auto' }}>
          <Box>
            <DatePicker
              label="Birth Date"
              value={birthData.birthDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  error: !!errors.birthDate,
                  fullWidth: true,
                }
              }}
            />
            {errors.birthDate && (
              <FormHelperText error>{errors.birthDate}</FormHelperText>
            )}
          </Box>
          
          <Box>
            <TimePicker
              label="Birth Time"
              value={birthData.birthTime}
              onChange={handleTimeChange}
              slotProps={{
                textField: {
                  error: !!errors.birthTime,
                  fullWidth: true,
                }
              }}
            />
            {errors.birthTime && (
              <FormHelperText error>{errors.birthTime}</FormHelperText>
            )}
          </Box>

          <TextField
            label="Birth Location"
            value={birthData.location}
            onChange={handleLocationChange}
            error={!!errors.location}
            helperText={errors.location}
            fullWidth
          />
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
          >
            Next
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default PreliminaryChart; 