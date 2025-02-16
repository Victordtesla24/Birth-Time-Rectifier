import React, { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DynamicQuestionnaire } from '../../src/components/steps/DynamicQuestionnaire';
import { ApiClient } from '../../src/services/api';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../src/theme';
import { MockApiClient } from '../../types/test-utils';
import { mockQuestions } from '../fixtures/mockQuestions';

// Mock API client
jest.mock('../../src/services/api');

const renderWithTheme = (component: ReactElement) => {
    return render(
        <ThemeProvider theme={theme}>
            {component}
        </ThemeProvider>
    );
};

describe('DynamicQuestionnaire Component', () => {
    let mockOnNext: jest.Mock;
    let mockPreviousData: {
        birthDate?: string;
        birthTime?: string;
        location?: string;
        answers?: Record<string, any>;
    };
    let mockApiClient: MockApiClient;

    beforeEach(() => {
        mockOnNext = jest.fn();
        mockPreviousData = {
            birthDate: '2000-01-01',
            birthTime: '12:00',
            location: 'New York'
        };

        mockApiClient = {
            calculateBirthTime: jest.fn(),
            generateQuestionnaire: jest.fn(),
            request: jest.fn(),
            onError: jest.fn(),
            setEventBus: jest.fn()
        };

        (ApiClient as jest.Mock).mockImplementation(() => mockApiClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shows loading state initially', async () => {
        // Mock the API to delay the response
        mockApiClient.generateQuestionnaire.mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve({
                questions: [
                    {
                        id: 1,
                        type: 'career',
                        text: 'Did you experience significant career changes?',
                        options: ['Yes', 'No'],
                        planetaryInfluence: 'Saturn'
                    }
                ]
            }), 100))
        );

        renderWithTheme(
            <DynamicQuestionnaire
                onNext={mockOnNext}
                previousData={mockPreviousData}
            />
        );
        
        // Wait for the loading indicator to appear
        const loadingIndicator = await screen.findByTestId('loading-indicator');
        expect(loadingIndicator).toBeInTheDocument();
    });

    it('loads questions on mount', async () => {
        await act(async () => {
            renderWithTheme(
                <DynamicQuestionnaire
                    onNext={mockOnNext}
                    previousData={mockPreviousData}
                />
            );
        });

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
        });

        expect(mockApiClient.generateQuestionnaire).toHaveBeenCalledWith(mockPreviousData);
        expect(screen.getByText('Did you experience significant career changes?')).toBeInTheDocument();
    });

    it('handles user responses', async () => {
        await act(async () => {
            renderWithTheme(
                <DynamicQuestionnaire
                    onNext={mockOnNext}
                    previousData={mockPreviousData}
                />
            );
        });

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
        });

        const question = await screen.findByText('Did you experience significant career changes?');
        const questionContainer = question.closest('[data-testid="box"]');
        
        // Click Yes button
        const yesButton = within(questionContainer).getByText('Yes');
        await act(async () => {
            fireEvent.click(yesButton);
        });

        // Set confidence level using the native input
        const slider = within(questionContainer).getByTestId('slider');
        const sliderInput = slider.querySelector('input[type="range"]');
        await act(async () => {
            fireEvent.change(sliderInput, { target: { value: '80' } });
            fireEvent.mouseUp(sliderInput);
        });

        // Click Next button
        const nextButton = screen.getByRole('button', { name: /next/i });
        await act(async () => {
            fireEvent.click(nextButton);
        });

        expect(mockOnNext).toHaveBeenCalledWith(
            expect.objectContaining({
                answers: expect.objectContaining({
                    1: 'Yes'
                }),
                confidenceLevels: expect.objectContaining({
                    1: 80
                })
            })
        );
    });

    it('validates required fields', async () => {
        await act(async () => {
            renderWithTheme(
                <DynamicQuestionnaire
                    onNext={mockOnNext}
                    previousData={mockPreviousData}
                />
            );
        });

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
        });

        // Click Next without answering questions
        const nextButton = screen.getByRole('button', { name: /next/i });
        await act(async () => {
            fireEvent.click(nextButton);
        });

        expect(screen.getByText('Please answer all questions')).toBeInTheDocument();
        expect(mockOnNext).not.toHaveBeenCalled();
    });

    test('should handle API errors gracefully', async () => {
        mockApiClient.generateQuestionnaire.mockRejectedValue(new Error('API Error'));

        await act(async () => {
            renderWithTheme(
                <DynamicQuestionnaire
                    onNext={mockOnNext}
                    previousData={mockPreviousData}
                />
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Failed to load questions. Please try again.')).toBeInTheDocument();
        });
    });

    it('renders the questionnaire with initial questions', () => {
        render(
            <DynamicQuestionnaire
                questions={mockQuestions}
                onSubmit={mockOnNext}
                onBack={mockOnNext}
            />
        );

        expect(screen.getByText(mockQuestions[0].text)).toBeInTheDocument();
    });
});
