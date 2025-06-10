import React, { useState } from 'react';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  birthDate: yup.string().required('Birth date is required'),
  birthTime: yup.string().required('Birth time is required'),
  birthLocation: yup.string().required('Birth location is required'),
});

interface BirthTimeFormData {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
}

export const BirthTimeForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik<BirthTimeFormData>({
    initialValues: {
      birthDate: '',
      birthTime: '',
      birthLocation: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/rectify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          throw new Error('Failed to submit form');
        }
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ p: 2 }}>
      <TextField
        fullWidth
        id="birthDate"
        name="birthDate"
        label="Birth Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={formik.values.birthDate}
        onChange={formik.handleChange}
        error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
        helperText={formik.touched.birthDate && formik.errors.birthDate}
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        id="birthTime"
        name="birthTime"
        label="Birth Time"
        type="time"
        InputLabelProps={{ shrink: true }}
        value={formik.values.birthTime}
        onChange={formik.handleChange}
        error={formik.touched.birthTime && Boolean(formik.errors.birthTime)}
        helperText={formik.touched.birthTime && formik.errors.birthTime}
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        id="birthLocation"
        name="birthLocation"
        label="Birth Location"
        value={formik.values.birthLocation}
        onChange={formik.handleChange}
        error={formik.touched.birthLocation && Boolean(formik.errors.birthLocation)}
        helperText={formik.touched.birthLocation && formik.errors.birthLocation}
        sx={{ mb: 2 }}
      />
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isSubmitting}
        startIcon={isSubmitting && <CircularProgress size={20} />}
      >
        Start Analysis
      </Button>
    </Box>
  );
}; 