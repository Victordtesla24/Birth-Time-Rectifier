import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Paper, Grid, useTheme } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { ApiClient } from '../services/api';
import { VedicChart } from './VedicChart';
import ProgressTracker from './ProgressTracker.jsx';
import { ChartVisualization } from './chart/ChartVisualization';

// Progress steps definition
const STEPS = {
    INITIAL_DATA: 'INITIAL_DATA',
    RESEARCH: 'RESEARCH',
    QUESTIONNAIRE: 'QUESTIONNAIRE',
    ANALYSIS: 'ANALYSIS',
    RESULTS: 'RESULTS'
};

interface BirthTimeRectifierProps {
    initialValues?: Record<string, any>;
    onSubmit: (values: any) => void;
    apiClient?: ApiClient;
}

export const BirthTimeRectifier: React.FC<BirthTimeRectifierProps> = ({
    initialValues = {},
    onSubmit,
    apiClient = new ApiClient(),
}) => {
    const theme = useTheme();
    const [step, setStep] = useState(STEPS.INITIAL_DATA);
    const [birthData, setBirthData] = useState({
        date: initialValues?.birthDate ?? null,
        time: initialValues?.birthTime ?? null,
        location: initialValues?.location ?? ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answers, setAnswers] = useState({});
    const [confidenceScore, setConfidenceScore] = useState(0);
    const [chartData, setChartData] = useState(null);
    const [completedSteps, setCompletedSteps] = useState([]);
    const CONFIDENCE_THRESHOLD = 0.95;

    const handleDateChange = (date) => {
        setBirthData(prev => ({ ...prev, date }));
        setError('');
    };

    const handleTimeChange = (time) => {
        setBirthData(prev => ({ ...prev, time }));
        setError('');
    };

    const handleLocationChange = (event) => {
        setBirthData(prev => ({ ...prev, location: event.target.value }));
        setError('');
    };

    const validateInitialData = () => {
        const errors = [];
        if (!birthData.date) errors.push('Birth date is required');
        if (!birthData.time) errors.push('Approximate birth time is required');
        if (!birthData.location) errors.push('Birth location is required');
        return errors;
    };

    const processAnswer = async (questionId, answer) => {
        setAnswers(prev => ({...prev, [questionId]: answer}));
        setLoading(true);
        try {
            const response = await apiClient.calculateBirthTime({
                birthData: {
                    birthDate: format(birthData.date, 'dd/MM/yyyy'),
                    birthTime: format(birthData.time, 'HH:mm'),
                    birthPlace: birthData.location
                },
                responses: {...answers, [questionId]: answer},
                currentConfidence: confidenceScore,
                stage: 'questionnaire'
            });

            if (response.status === 'success') {
                const newConfidence = response.confidence_score || 0;
                setConfidenceScore(newConfidence);
                setChartData(response.preliminary_analysis?.chart_data);
                
                // Update completed steps
                const updatedSteps = [...completedSteps];
                if (!updatedSteps.includes(STEPS.QUESTIONNAIRE)) {
                    updatedSteps.push(STEPS.QUESTIONNAIRE);
                }
                if (newConfidence >= CONFIDENCE_THRESHOLD && !updatedSteps.includes(STEPS.ANALYSIS)) {
                    updatedSteps.push(STEPS.ANALYSIS);
                }
                setCompletedSteps(updatedSteps);

                if (newConfidence >= CONFIDENCE_THRESHOLD) {
                    setStep(STEPS.RESULTS);
                    if (!updatedSteps.includes(STEPS.RESULTS)) {
                        updatedSteps.push(STEPS.RESULTS);
                    }
                    setCompletedSteps(updatedSteps);
                } else if (response.preliminary_analysis?.next_questions?.length > 0) {
                    setCurrentQuestion(response.preliminary_analysis.next_questions[0]);
                } else {
                    // If no more questions but confidence is not met, request ML-generated questions
                    const mlResponse = await apiClient.calculateBirthTime({
                        birthData: {
                            birthDate: format(birthData.date, 'dd/MM/yyyy'),
                            birthTime: format(birthData.time, 'HH:mm'),
                            birthPlace: birthData.location
                        },
                        responses: {...answers, [questionId]: answer},
                        currentConfidence: newConfidence,
                        stage: 'ml_questions'
                    });

                    if (mlResponse.status === 'success' && mlResponse.preliminary_analysis?.next_questions?.length > 0) {
                        setCurrentQuestion(mlResponse.preliminary_analysis.next_questions[0]);
                    } else {
                        setError('Unable to generate more questions. Please try a different approach.');
                    }
                }

                setResult({
                    rectifiedTime: response.birth_data?.birthTime,
                    confidence: Math.round(newConfidence * 100),
                    chartData: response.preliminary_analysis?.chart_data
                });
            }
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message || 'Error processing birth time rectification');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        const validationErrors = validateInitialData();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }

        setLoading(true);
        setError('');
        try {
            const birthDataPayload = {
                birthDate: format(birthData.date, 'dd/MM/yyyy'),
                birthTime: format(birthData.time, 'HH:mm'),
                birthPlace: birthData.location
            };
            
            const response = await apiClient.calculateBirthTime({
                birthData: birthDataPayload,
                stage: 'initial'
            });

            if (response.status === 'success') {
                setConfidenceScore(response.confidence_score || 0);
                setChartData(response.preliminary_analysis?.chart_data);
                
                // Update completed steps
                const updatedSteps = [...completedSteps];
                if (!updatedSteps.includes(STEPS.INITIAL_DATA)) {
                    updatedSteps.push(STEPS.INITIAL_DATA);
                }
                if (!updatedSteps.includes(STEPS.RESEARCH)) {
                    updatedSteps.push(STEPS.RESEARCH);
                }
                setCompletedSteps(updatedSteps);

                // Set next step based on response
                if (response.preliminary_analysis?.next_questions?.length > 0) {
                    setCurrentQuestion(response.preliminary_analysis.next_questions[0]);
                    setStep(STEPS.QUESTIONNAIRE);
                } else {
                    setStep(STEPS.RESEARCH);
                }

                // Update result state
                setResult({
                    rectifiedTime: response.birth_data?.birthTime,
                    confidence: Math.round(response.confidence_score * 100),
                    birthData: birthDataPayload // Store the submitted data
                });

                // Notify parent component
                if (onSubmit) {
                    onSubmit({
                        ...birthDataPayload,
                        confidence: response.confidence_score || 0,
                        preliminaryAnalysis: response.preliminary_analysis || {}
                    });
                }
            } else {
                throw new Error(response.message || 'Failed to process birth data');
            }
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message || 'Error processing birth time rectification');
            // Reset step to initial data on error
            setStep(STEPS.INITIAL_DATA);
        } finally {
            setLoading(false);
        }
    };

    const handleContinueToQuestionnaire = async () => {
        setLoading(true);
        try {
            const response = await apiClient.calculateBirthTime({
                birthData: {
                    birthDate: format(birthData.date, 'dd/MM/yyyy'),
                    birthTime: format(birthData.time, 'HH:mm'),
                    birthPlace: birthData.location
                },
                stage: 'questionnaire',
                currentConfidence: confidenceScore
            });

            if (response.status === 'success') {
                setConfidenceScore(response.confidence_score || confidenceScore);
                setChartData(response.preliminary_analysis?.chart_data);
                
                if (response.preliminary_analysis?.next_questions?.length > 0) {
                    setCurrentQuestion(response.preliminary_analysis.next_questions[0]);
                    setStep(STEPS.QUESTIONNAIRE);
                    
                    // Update completed steps
                    const updatedSteps = [...completedSteps];
                    if (!updatedSteps.includes(STEPS.RESEARCH)) {
                        updatedSteps.push(STEPS.RESEARCH);
                    }
                    setCompletedSteps(updatedSteps);
                } else {
                    // If no questions available, try ML-generated questions
                    const mlResponse = await apiClient.calculateBirthTime({
                        birthData: {
                            birthDate: format(birthData.date, 'dd/MM/yyyy'),
                            birthTime: format(birthData.time, 'HH:mm'),
                            birthPlace: birthData.location
                        },
                        stage: 'ml_questions',
                        currentConfidence: response.confidence_score || confidenceScore
                    });

                    if (mlResponse.status === 'success' && mlResponse.preliminary_analysis?.next_questions?.length > 0) {
                        setCurrentQuestion(mlResponse.preliminary_analysis.next_questions[0]);
                        setStep(STEPS.QUESTIONNAIRE);
                    } else {
                        setError('Unable to generate questions. Please try again with different birth details.');
                    }
                }
            } else {
                throw new Error(response.message || 'Failed to load questionnaire');
            }
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message || 'Error loading questionnaire');
        } finally {
            setLoading(false);
        }
    };

    const renderVedicChart = () => {
        if (!chartData) return null;
        return (
            <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>Vedic Birth Chart</Typography>
                <VedicChart chartData={chartData} />
                {result && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                            Confidence Score: {result.confidence}%
                        </Typography>
                        {result.rectifiedTime && (
                            <Typography variant="body2" color="textSecondary">
                                Rectified Time: {result.rectifiedTime}
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>
        );
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                maxWidth: 800,
                mx: 'auto',
                backgroundColor: theme.palette.background.paper,
            }}
        >
            <Typography variant="h5" gutterBottom>
                Birth Time Rectification
            </Typography>

            <form onSubmit={handleNext}>
                <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
                    <TextField
                        label="Name"
                        value={birthData.name || ''}
                        onChange={handleChange('name')}
                        required
                    />

                    <DatePicker
                        label="Birth Date"
                        value={birthData.date}
                        onChange={handleDateChange}
                        format="dd/MM/yyyy"
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                error: !!error && !birthData.date,
                                placeholder: "DD/MM/YYYY"
                            }
                        }}
                    />

                    <TimePicker
                        label="Approximate Birth Time"
                        value={birthData.time}
                        onChange={handleTimeChange}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                error: !!error && !birthData.time
                            }
                        }}
                    />

                    <TextField
                        label="Birth Place"
                        value={birthData.location}
                        onChange={handleLocationChange}
                        fullWidth
                        error={!!error && !birthData.location}
                    />

                    <TextField
                        label="Latitude"
                        type="number"
                        value={birthData.latitude || ''}
                        onChange={handleChange('latitude')}
                        required
                    />

                    <TextField
                        label="Longitude"
                        type="number"
                        value={birthData.longitude || ''}
                        onChange={handleChange('longitude')}
                        required
                    />
                </Box>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ mb: 3 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Calculate'}
                </Button>
            </form>

            {chartData && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Birth Chart
                    </Typography>
                    <ChartVisualization data={chartData} />
                </Box>
            )}
        </Paper>
    );
};
