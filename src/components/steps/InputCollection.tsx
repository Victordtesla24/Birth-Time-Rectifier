import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format, parse } from 'date-fns';

const InputCollection = ({ onNext, data }) => {
  const [birthDate, setBirthDate] = useState(data?.birthDate ? parse(data.birthDate, 'dd/MM/yyyy', new Date()) : null);
  const [birthTime, setBirthTime] = useState(data?.birthTime || '14:30');
  const [birthPlace, setBirthPlace] = useState(data?.birthPlace || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validateInputs = () => {
    const errors = {};
    if (!birthDate) errors.birthDate = 'Birth date is required';
    if (!birthTime) errors.birthTime = 'Birth time is required';
    if (!birthPlace.trim()) errors.birthPlace = 'Birth place is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateInputs()) return;

    setLoading(true);
    try {
      const formattedData = {
        birthDate: format(birthDate, 'dd/MM/yyyy'),
        birthTime: birthTime,
        birthPlace: birthPlace.trim()
      };

      await onNext(formattedData);
    } catch (err) {
      setError(err.message || 'An error occurred while processing your input');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h5" gutterBottom data-testid="typography">
          Birth Information Collection
        </Typography>
        <Typography variant="body1" gutterBottom data-testid="typography">
          Please provide accurate birth details for precise rectification calculations.
        </Typography>
        <Paper elevation={0} sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box mb={3}>
              <DatePicker
                label="Birth Date"
                value={birthDate}
                onChange={(newValue) => {
                  setBirthDate(newValue);
                  setValidationErrors(prev => ({ ...prev, birthDate: null }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!!validationErrors.birthDate}
                    helperText={validationErrors.birthDate}
                    required
                    fullWidth
                    inputProps={{
                      ...params.inputProps,
                      'data-testid': 'date-picker',
                      'aria-label': 'Birth Date'
                    }}
                  />
                )}
                format="dd/MM/yyyy"
              />
            </Box>
            <Box mb={3}>
              <TimePicker
                label="Birth Time"
                value={birthTime}
                onChange={(newValue) => {
                  setBirthTime(newValue);
                  setValidationErrors(prev => ({ ...prev, birthTime: null }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={!!validationErrors.birthTime}
                    helperText={validationErrors.birthTime}
                    required
                    fullWidth
                    inputProps={{
                      ...params.inputProps,
                      'data-testid': 'time-picker',
                      'aria-label': 'Birth Time'
                    }}
                  />
                )}
              />
            </Box>
            <TextField
              label="Birth Place"
              value={birthPlace}
              onChange={(e) => {
                setBirthPlace(e.target.value);
                setValidationErrors(prev => ({ ...prev, birthPlace: null }));
              }}
              error={!!validationErrors.birthPlace}
              helperText={validationErrors.birthPlace || 'Enter city and country, e.g., "New Delhi, India"'}
              required
              fullWidth
              margin="normal"
              inputProps={{
                'data-testid': 'text-field',
                'aria-label': 'Birth Place'
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
              data-testid="button"
            >
              {loading ? <CircularProgress size={24} /> : 'Proceed to Data Processing'}
            </Button>
          </form>
        </Paper>
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary" data-testid="typography">
            Note: The accuracy of birth time rectification depends on the precision of your input data. Please provide as accurate information as possible.
          </Typography>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default InputCollection;