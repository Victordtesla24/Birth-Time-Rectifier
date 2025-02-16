import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BirthTimeRectifier } from '../../src/components/BirthTimeRectifier';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../src/theme';
import { ApiClient } from '../../src/services/api';
import { format } from 'date-fns';

// Mock Material-UI components
interface MockProps {
    children?: React.ReactNode;
    sx?: React.CSSProperties;
    onClick?: () => void;
    onChange?: (event: any) => void;
    value?: any;
    gutterBottom?: boolean;
    justifyContent?: string;
    alignItems?: string;
    label?: string;
    fullWidth?: boolean;
}

jest.mock('@mui/material', () => ({
    Box: (props: MockProps) => ({
        type: 'Box',
        props: {
            'data-testid': 'mui-box',
            children: props.children,
            style: props.sx,
            onClick: props.onClick,
            onChange: props.onChange,
            value: props.value,
            gutterBottom: props.gutterBottom,
            justifyContent: props.justifyContent,
            alignItems: props.alignItems
        }
    }),
    Typography: (props: MockProps) => ({
        type: 'Typography',
        props: {
            'data-testid': 'mui-typography',
            children: props.children,
            style: props.sx,
            onClick: props.onClick,
            onChange: props.onChange,
            value: props.value,
            gutterBottom: props.gutterBottom
        }
    }),
    Button: (props: MockProps) => ({
        type: 'Button',
        props: {
            'data-testid': 'mui-button',
            children: props.children,
            style: props.sx,
            onClick: props.onClick,
            onChange: props.onChange,
            value: props.value
        }
    }),
    TextField: (props: MockProps) => ({
        type: 'TextField',
        props: {
            'data-testid': 'mui-textfield',
            label: props.label,
            value: props.value,
            onChange: props.onChange,
            style: props.sx,
            fullWidth: props.fullWidth
        }
    }),
    CircularProgress: () => ({
        type: 'CircularProgress',
        props: {
            'data-testid': 'circular-progress'
        }
    }),
    Paper: (props: MockProps) => ({
        type: 'Paper',
        props: {
            'data-testid': 'mui-paper',
            children: props.children,
            style: props.sx
        }
    })
}));

// Mock date-fns
jest.mock('date-fns', () => ({
    format: jest.fn((date, formatStr) => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    })
}));

// Mock Material-UI date pickers
interface DateTimePickerProps {
    label?: string;
    value?: Date | null;
    onChange?: (date: Date | null) => void;
}

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
    DatePicker: (props: DateTimePickerProps) => ({
        type: 'DatePicker',
        props: {
            'data-testid': 'date-picker',
            label: props.label,
            value: props.value,
            onChange: props.onChange
        }
    })
}));

jest.mock('@mui/x-date-pickers/TimePicker', () => ({
    TimePicker: (props: DateTimePickerProps) => ({
        type: 'TimePicker',
        props: {
            'data-testid': 'time-picker',
            label: props.label,
            value: props.value,
            onChange: props.onChange
        }
    })
}));

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
    LocalizationProvider: ({ children }) => <div data-testid="localization-provider">{children}</div>
}));

jest.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
    AdapterDateFns: jest.fn()
}));

jest.mock('../../src/services/api');

describe('BirthTimeRectifier Component', () => {
    let mockApiClient;

    beforeEach(() => {
        mockApiClient = {
            calculateBirthTime: jest.fn().mockResolvedValue({
                rectifiedTime: '12:30',
                confidence: 85
            })
        };
        ApiClient.mockImplementation(() => mockApiClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = () => {
        return render(
            <ThemeProvider theme={theme}>
                <BirthTimeRectifier initialValues={{
                    birthDate: new Date('1990-01-01'),
                    birthTime: new Date('1990-01-01T12:00:00'),
                    location: 'New York'
                }} />
            </ThemeProvider>
        );
    };

    test('should render initial data collection step', () => {
        renderComponent();
        
        expect(screen.getByText('Birth Time Rectification')).toBeInTheDocument();
        expect(screen.getByLabelText('Birth Date')).toBeInTheDocument();
        expect(screen.getByLabelText('Approximate Birth Time')).toBeInTheDocument();
        expect(screen.getByLabelText('Birth Location')).toBeInTheDocument();
    });

    test('should handle initial data submission', async () => {
        renderComponent();

        // Fill in initial data
        const birthDate = new Date('1990-01-01');
        const birthTime = new Date('1990-01-01T12:00:00');

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Birth Date'), {
                target: { value: birthDate.toISOString().split('T')[0] }
            });
            fireEvent.change(screen.getByLabelText('Approximate Birth Time'), {
                target: { value: '12:00' }
            });
            fireEvent.change(screen.getByLabelText('Birth Location'), {
                target: { value: 'New York' }
            });

            // Submit form
            fireEvent.click(screen.getByText('Next'));
        });

        // Wait for results
        await waitFor(() => {
            expect(screen.getByText('Rectified Time: 12:30')).toBeInTheDocument();
            expect(screen.getByText('Confidence: 85%')).toBeInTheDocument();
        });

        expect(mockApiClient.calculateBirthTime).toHaveBeenCalledWith({
            birthDate: birthDate.toISOString().split('T')[0],
            birthTime: format(birthTime, 'HH:mm'),
            location: 'New York'
        });
    });

    test('should handle API errors', async () => {
        mockApiClient.calculateBirthTime.mockRejectedValue(new Error('API Error'));
        renderComponent();

        // Fill in initial data
        fireEvent.change(screen.getByLabelText('Birth Date'), {
            target: { value: '1990-01-01' }
        });
        fireEvent.change(screen.getByLabelText('Approximate Birth Time'), {
            target: { value: '12:00' }
        });
        fireEvent.change(screen.getByLabelText('Birth Location'), {
            target: { value: 'New York' }
        });

        // Submit form
        fireEvent.click(screen.getByText('Next'));

        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText('Error processing birth time rectification')).toBeInTheDocument();
        });
    });

    test('should validate required fields', async () => {
        renderComponent();

        // Clear initial values
        await act(async () => {
            fireEvent.change(screen.getByLabelText('Birth Date'), {
                target: { value: '' }
            });
            fireEvent.change(screen.getByLabelText('Approximate Birth Time'), {
                target: { value: '' }
            });
            fireEvent.change(screen.getByLabelText('Birth Location'), {
                target: { value: '' }
            });
        });

        // Submit form without filling data
        await act(async () => {
            fireEvent.click(screen.getByText('Next'));
        });

        // Check for validation messages
        await waitFor(() => {
            expect(screen.getByText(/birth date is required/i)).toBeInTheDocument();
            expect(screen.getByText(/birth time is required/i)).toBeInTheDocument();
            expect(screen.getByText(/birth location is required/i)).toBeInTheDocument();
        });
    });
});
