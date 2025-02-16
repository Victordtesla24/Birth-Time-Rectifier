import React from 'react';
import type { FC, ChangeEvent } from 'react';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import type { RectificationFormProps } from './types';

export const RectificationForm: FC<RectificationFormProps> = ({
  birthData,
  onBirthDataChange,
  onSubmit,
  loading,
  error,
}) => {
  const handleDateChange = (date: Date | null) => {
    onBirthDataChange({ ...birthData, date });
  };

  const handleTimeChange = (time: Date | null) => {
    onBirthDataChange({ ...birthData, time });
  };

  const handleLocationChange = (event: ChangeEvent<HTMLInputElement>) => {
    onBirthDataChange({ ...birthData, location: event.target.value });
  };

  const hasErrors = Boolean(error);
  const dateError = hasErrors && !birthData.date;
  const timeError = hasErrors && !birthData.time;
  const locationError = hasErrors && !birthData.location;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Enter Birth Details
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <DatePicker
            label="Birth Date"
            value={birthData.date}
            onChange={handleDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                error: dateError,
                helperText: dateError ? 'Birth date is required' : '',
              },
            }}
          />
          <TimePicker
            label="Approximate Birth Time"
            value={birthData.time}
            onChange={handleTimeChange}
            slotProps={{
              textField: {
                fullWidth: true,
                error: timeError,
                helperText: timeError ? 'Birth time is required' : '',
              },
            }}
          />
          <TextField
            label="Birth Location"
            value={birthData.location}
            onChange={handleLocationChange}
            fullWidth
            placeholder="City, Country"
            error={locationError}
            helperText={locationError ? 'Birth location is required' : ''}
          />
          {error && !dateError && !timeError && !locationError && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Start Rectification'
            )}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}; 