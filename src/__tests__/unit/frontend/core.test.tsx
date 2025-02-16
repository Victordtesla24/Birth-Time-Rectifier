import { render, fireEvent, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../theme';
import { BirthTimeForm } from '@/components/BirthTimeForm';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('UI Components', () => {
    test('Initial Form Rendering', () => {
        const { getByLabelText, getByRole } = renderWithTheme(<BirthTimeForm />);
        expect(getByLabelText('Birth Date')).toBeInTheDocument();
        expect(getByLabelText('Birth Time')).toBeInTheDocument();
        expect(getByLabelText('Birth Location')).toBeInTheDocument();
    });

    test('Form Validation', async () => {
        const { getByRole } = renderWithTheme(<BirthTimeForm />);
        const submitButton = getByRole('button', { name: /start analysis/i });
        
        // Submit empty form
        await act(async () => {
            fireEvent.click(submitButton);
        });
        
        expect(screen.getByText(/birth date is required/i)).toBeInTheDocument();
        expect(screen.getByText(/birth time is required/i)).toBeInTheDocument();
        expect(screen.getByText(/birth location is required/i)).toBeInTheDocument();
    });

    test('Loading States', async () => {
        const { getByLabelText, getByRole } = renderWithTheme(<BirthTimeForm />);
        const submitButton = getByRole('button', { name: /start analysis/i });
        
        await act(async () => {
            // Fill form with valid data
            fireEvent.change(getByLabelText('Birth Date'), { target: { value: '2000-01-01' } });
            fireEvent.change(getByLabelText('Birth Time'), { target: { value: '12:00' } });
            fireEvent.change(getByLabelText('Birth Location'), { target: { value: 'New York, NY' } });
            
            fireEvent.click(submitButton);
        });
        
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});

describe('API Integration', () => {
    test('Birth Time Rectification API', async () => {
        const response = await fetch('/api/rectify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                birthDate: '2000-01-01',
                birthTime: '12:00',
                birthLocation: 'New York, NY'
            })
        });
        
        expect(response.status).toBe(200);
    });

    test('Questionnaire Submission API', async () => {
        const response = await fetch('/api/questionnaire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questions: [
                    { id: 1, answer: 'Yes' },
                    { id: 2, answer: 'No' }
                ]
            })
        });
        
        expect(response.status).toBe(200);
    });
}); 