import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepWizard } from '../../src/components/StepWizard';
import { ApiClient } from '../../src/services/api';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Mock API client
jest.mock('../../src/services/api');

const theme = createTheme();

const renderWithProviders = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {component}
      </LocalizationProvider>
    </ThemeProvider>
  );
};

describe('StepWizard E2E', () => {
    let mockApiClient;

    beforeEach(() => {
        mockApiClient = {
            generateQuestionnaire: jest.fn().mockImplementation(() => 
                Promise.resolve({
                    questions: [
                        {
                            id: 1,
                            type: 'career',
                            text: 'Did you experience significant career changes?',
                            options: ['Yes', 'No'],
                            planetaryInfluence: 'Saturn'
                        }
                    ]
                })
            )
        };
        ApiClient.mockImplementation(() => mockApiClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should complete full birth time rectification process', async () => {
        await act(async () => {
            renderWithProviders(<StepWizard />);
        });

        // Initial form step
        const birthDateInput = screen.getByLabelText(/birth date/i);
        const birthTimeInput = screen.getByLabelText(/birth time/i);
        const birthLocationInput = screen.getByLabelText(/birth location/i);

        // Fill in the form
        await act(async () => {
            await userEvent.type(birthDateInput, '1990-01-01');
            await userEvent.type(birthTimeInput, '12:00');
            await userEvent.type(birthLocationInput, 'New York');
        });

        // Click the Next button
        const nextButton = screen.getByRole('button', { name: /next/i });
        await act(async () => {
            await userEvent.click(nextButton);
        });

        // Verify we're on the research step
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /life events research/i })).toBeInTheDocument();
        });

        // Add a life event
        const eventInput = await screen.findByTestId('life-event-input');
        await act(async () => {
            await userEvent.type(eventInput, 'Started a new job');
        });
        
        const addButton = screen.getByRole('button', { name: /add/i });
        await act(async () => {
            await userEvent.click(addButton);
        });

        // Verify the event was added
        expect(screen.getByText('Started a new job')).toBeInTheDocument();

        // Move to the next step
        const nextButton2 = screen.getByRole('button', { name: /next/i });
        await act(async () => {
            await userEvent.click(nextButton2);
        });

        // Verify we're on the data consolidation step
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /data review & consolidation/i })).toBeInTheDocument();
        });
    });

    it('should handle validation errors', async () => {
        await act(async () => {
            renderWithProviders(<StepWizard />);
        });
        
        // Try to proceed without filling in required fields
        const nextButton = screen.getByRole('button', { name: /next/i });
        await act(async () => {
            await userEvent.click(nextButton);
        });
        
        // Check for validation errors
        await waitFor(() => {
            expect(screen.getByText(/birth date is required/i)).toBeInTheDocument();
            expect(screen.getByText(/birth time is required/i)).toBeInTheDocument();
            expect(screen.getByText(/birth location is required/i)).toBeInTheDocument();
        });
    });

    it('should allow navigation between steps', async () => {
        await act(async () => {
            renderWithProviders(<StepWizard />);
        });

        // Fill in the initial form
        const birthDateInput = screen.getByLabelText(/birth date/i);
        const birthTimeInput = screen.getByLabelText(/birth time/i);
        const birthLocationInput = screen.getByLabelText(/birth location/i);

        await act(async () => {
            await userEvent.type(birthDateInput, '2000-12-31');
            await userEvent.type(birthTimeInput, '15:30');
            await userEvent.type(birthLocationInput, 'New York, NY');
        });

        // Navigate to next step
        const nextButton = screen.getByRole('button', { name: /next/i });
        await act(async () => {
            await userEvent.click(nextButton);
        });

        // Verify we're on the research step
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /life events research/i })).toBeInTheDocument();
        });

        // Navigate back
        const backButton = screen.getByRole('button', { name: /back/i });
        await act(async () => {
            await userEvent.click(backButton);
        });

        // Verify we're back on the initial step
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /birth information/i })).toBeInTheDocument();
        });
    });
});
