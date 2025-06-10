import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    Button,
    CircularProgress,
    Paper,
    LinearProgress,
    Alert
} from '@mui/material';
import { ApiClient } from '../../services/api';
import { motion } from 'framer-motion';
import InfoIcon from '@mui/icons-material/Info';

const CONFIDENCE_THRESHOLD = 0.95; // 95% confidence required

export const DynamicQuestionnaire = ({ birthData, onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const apiClient = new ApiClient();

    const fetchNextQuestion = async () => {
        setLoading(true);
        try {
            const response = await apiClient.analyzeRectification({
                birth_details: birthData,
                answers
            });
            
            setConfidence(response.confidence_score);
            
            if (response.confidence_score >= CONFIDENCE_THRESHOLD) {
                onComplete(response);
            } else if (response.next_question) {
                // Animate out current question
                if (currentQuestion) {
                    await new Promise(resolve => {
                        const questionElement = document.querySelector('.question-container');
                        if (questionElement) {
                            questionElement.style.opacity = '0';
                            questionElement.style.transform = 'translateY(-20px)';
                            setTimeout(resolve, 300);
                        } else {
                            resolve();
                        }
                    });
                }
                
                setCurrentQuestion(response.next_question);
                setQuestionCount(prev => prev + 1);
            } else {
                onComplete(response); // Complete if no more questions despite lower confidence
            }
        } catch (err) {
            setError('Error fetching next question: ' + err.message);
            // Log error for debugging
            console.error('Questionnaire error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNextQuestion();
        
        // Cleanup function
        return () => {
            setCurrentQuestion(null);
            setAnswers({});
            setLoading(false);
            setError('');
        };
    }, []);

    const handleAnswer = async (value) => {
        if (currentQuestion && !loading) {
            setLoading(true);
            try {
                const newAnswers = {
                    ...answers,
                    [currentQuestion.id]: value
                };
                setAnswers(newAnswers);
                await fetchNextQuestion();
            } catch (err) {
                setError('Error processing answer: ' + err.message);
                console.error('Answer processing error:', err);
            }
        }
    };

    if (loading && !currentQuestion) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="200px"
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                action={
                    <Button 
                        color="inherit" 
                        size="small"
                        onClick={() => {
                            setError('');
                            fetchNextQuestion();
                        }}
                    >
                        Retry
                    </Button>
                }
            >
                {error}
            </Alert>
        );
    }

    if (!currentQuestion) {
        return null;
    }

    return (
        <Box>
            <Paper 
                sx={{ 
                    p: 4, 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: 3,
                    background: 'linear-gradient(45deg, #f3e5f5 0%, #ffffff 100%)'
                }}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                        Confidence Level
                    </Typography>
                    <Box sx={{ position: 'relative', mb: 1 }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={confidence * 100}
                            sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 5,
                                    backgroundImage: 'linear-gradient(45deg, #556cd6 30%, #19857b 90%)',
                                }
                            }}
                        />
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                                position: 'absolute',
                                right: 0,
                                top: -20,
                                fontWeight: 'medium'
                            }}
                        >
                            {Math.round(confidence * 100)}%
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Questions Answered: {questionCount}
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography 
                        variant="h5" 
                        gutterBottom 
                        sx={{ 
                            color: 'text.primary',
                            fontWeight: 'medium'
                        }}
                    >
                        {currentQuestion.question}
                    </Typography>
                    
                    <FormControl component="fieldset" sx={{ width: '100%' }}>
                        {currentQuestion.type === 'select' && !currentQuestion.multiple && (
                            <RadioGroup
                                value={answers[currentQuestion.id] || ''}
                                onChange={(e) => handleAnswer(e.target.value)}
                            >
                                <Box 
                                    sx={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: 2,
                                        mt: 2
                                    }}
                                >
                                    {currentQuestion.options.map((option, index) => (
                                        <Paper
                                            key={index}
                                            component={motion.div}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            sx={{
                                                p: 2,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                border: '1px solid',
                                                borderColor: answers[currentQuestion.id] === option ? 
                                                    'primary.main' : 'grey.300',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    boxShadow: 2
                                                }
                                            }}
                                            onClick={() => handleAnswer(option)}
                                        >
                                            <FormControlLabel
                                                value={option}
                                                control={
                                                    <Radio 
                                                        sx={{ 
                                                            '& .MuiSvgIcon-root': {
                                                                fontSize: 20,
                                                            }
                                                        }}
                                                    />
                                                }
                                                label={option}
                                                sx={{ 
                                                    m: 0,
                                                    width: '100%',
                                                    '& .MuiFormControlLabel-label': {
                                                        fontWeight: answers[currentQuestion.id] === option ?
                                                            'medium' : 'normal'
                                                    }
                                                }}
                                            />
                                        </Paper>
                                    ))}
                                </Box>
                            </RadioGroup>
                        )}
                        
                        {currentQuestion.type === 'select' && currentQuestion.multiple && (
                            <Box 
                                sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: 2,
                                    mt: 2
                                }}
                            >
                                {currentQuestion.options.map((option, index) => (
                                    <Paper
                                        key={index}
                                        component={motion.div}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        sx={{
                                            p: 2,
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            border: '1px solid',
                                            borderColor: answers[currentQuestion.id]?.includes(option) ?
                                                'primary.main' : 'grey.300',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                boxShadow: 2
                                            }
                                        }}
                                        onClick={() => {
                                            const currentAnswers = answers[currentQuestion.id] || [];
                                            const newAnswers = currentAnswers.includes(option) ?
                                                currentAnswers.filter(a => a !== option) :
                                                [...currentAnswers, option];
                                            handleAnswer(newAnswers);
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox 
                                                    checked={answers[currentQuestion.id]?.includes(option) || false}
                                                    sx={{ 
                                                        '& .MuiSvgIcon-root': {
                                                            fontSize: 20,
                                                        }
                                                    }}
                                                />
                                            }
                                            label={option}
                                            sx={{ 
                                                m: 0,
                                                width: '100%',
                                                '& .MuiFormControlLabel-label': {
                                                    fontWeight: answers[currentQuestion.id]?.includes(option) ?
                                                        'medium' : 'normal'
                                                }
                                            }}
                                        />
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </FormControl>
                </Box>
            </Paper>

            {currentQuestion.impact && (
                <Paper 
                    sx={{ 
                        p: 2, 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        backgroundColor: 'grey.50'
                    }}
                >
                    <InfoIcon color="action" sx={{ fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                        Question Impact: <span style={{ fontWeight: 500 }}>{currentQuestion.impact}</span>
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}; 