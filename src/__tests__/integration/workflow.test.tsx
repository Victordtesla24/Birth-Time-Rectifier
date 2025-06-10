import React, { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { StepWizard } from '../../src/components/StepWizard';
import { ApiClient } from '../../src/services/api';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../src/theme';
import { MockApiClient } from '../../types/test-utils';

jest.mock('../../src/services/api');

const renderWithProviders = (component: ReactElement) => {
    return render(
        <ThemeProvider theme={theme}>
            {component}
        </ThemeProvider>
    );
};

describe('Workflow Integration', () => {
    let mockApiClient: MockApiClient;
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        mockApiClient = {
            calculateBirthTime: jest.fn(),
            generateQuestionnaire: jest.fn(),
            request: jest.fn(),
            onError: jest.fn(),
            setEventBus: jest.fn()
        };

        (ApiClient as jest.Mock).mockImplementation(() => mockApiClient);
        user = userEvent.setup();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Birth Time Form', () => {
        it('should handle birth time form submission', async () => {
            renderWithProviders(<StepWizard apiClient={mockApiClient} />);

            // Get form inputs
            const birthDateInput = screen.getByTestId('birth-date-input');
            const birthTimeInput = screen.getByTestId('birth-time-input');
            const birthLocationInput = screen.getByTestId('birth-location-input');
            const nextButton = screen.getByTestId('next-button');

            // Fill in the form
            await user.type(birthDateInput, '1990-01-01');
            await user.type(birthTimeInput, '12:00');
            await user.type(birthLocationInput, 'New York');

            // Submit form
            await user.click(nextButton);

            // Verify API call
            expect(mockApiClient.calculateBirthTime).toHaveBeenCalled();
        });
    });

    describe('Life Events Form', () => {
        it('should handle life events form submission', async () => {
            renderWithProviders(<StepWizard apiClient={mockApiClient} />);

            // Navigate to life events form
            const eventInput = screen.getByTestId('event-input');
            const addButton = screen.getByTestId('add-event-button');
            const nextButton2 = screen.getByTestId('next-button');

            // Add life event
            await user.type(eventInput, 'Started a new job');
            await user.click(addButton);

            // Submit form
            await user.click(nextButton2);

            // Verify next step is shown
            expect(screen.getByTestId('questionnaire-step')).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('should handle step navigation', async () => {
            renderWithProviders(<StepWizard apiClient={mockApiClient} />);

            const nextButton = screen.getByTestId('next-button');
            await user.click(nextButton);

            expect(screen.getByTestId('life-events-step')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors', async () => {
            mockApiClient.calculateBirthTime.mockRejectedValue(new Error('An error occurred during analysis'));

            renderWithProviders(<StepWizard apiClient={mockApiClient} />);

            // Get form inputs
            const birthDateInput = screen.getByTestId('birth-date-input');
            const birthTimeInput = screen.getByTestId('birth-time-input');
            const birthLocationInput = screen.getByTestId('birth-location-input');
            const nextButton = screen.getByTestId('next-button');

            // Fill in the form
            await user.type(birthDateInput, '1990-01-01');
            await user.type(birthTimeInput, '12:00');
            await user.type(birthLocationInput, 'New York');

            // Submit form
            await user.click(nextButton);

            // Verify error handling
            await waitFor(() => {
                expect(mockApiClient.calculateBirthTime).toHaveBeenCalled();
                expect(screen.getByTestId('error-message')).toBeInTheDocument();
            });
        });
    });

    describe('Data Flow', () => {
        it('should pass data between steps', async () => {
            renderWithProviders(<StepWizard apiClient={mockApiClient} />);

            // Fill birth time form
            const birthDateInput = screen.getByTestId('birth-date-input');
            const birthTimeInput = screen.getByTestId('birth-time-input');
            const birthLocationInput = screen.getByTestId('birth-location-input');
            const nextButton = screen.getByTestId('next-button');

            await user.type(birthDateInput, '2000-12-31');
            await user.type(birthTimeInput, '15:30');
            await user.type(birthLocationInput, 'New York, NY');

            // Submit form
            await user.click(nextButton);

            // Verify API call with correct data
            await waitFor(() => {
                expect(mockApiClient.calculateBirthTime).toHaveBeenCalled();
                expect(mockApiClient.calculateBirthTime).toHaveBeenCalledWith({
                    birthDate: '2000-12-31',
                    birthTime: '15:30',
                    location: 'New York, NY'
                });
            });

            // Navigate back
            const backButton = screen.getByTestId('back-button');
            await user.click(backButton);

            // Verify form data is preserved
            expect(birthDateInput).toHaveValue('2000-12-31');
            expect(birthTimeInput).toHaveValue('15:30');
            expect(birthLocationInput).toHaveValue('New York, NY');
        });
    });
}); 