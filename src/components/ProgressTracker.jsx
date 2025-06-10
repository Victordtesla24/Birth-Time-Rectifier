import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Chip,
    Fade
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorIcon from '@mui/icons-material/Error';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { motion } from 'framer-motion';

const workflowSteps = {
    INITIAL_DATA: 'Initial Data Collection',
    RESEARCH: 'Research & Analysis',
    QUESTIONNAIRE: 'Dynamic Questionnaire',
    ANALYSIS: 'Comprehensive Analysis',
    RESULTS: 'Final Results'
};

const ProgressTracker = ({ currentStep, completedSteps, errors }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const totalSteps = Object.keys(workflowSteps).length;
        const completedCount = completedSteps.length;
        setProgress((completedCount / totalSteps) * 100);
    }, [completedSteps]);

    const getStepIcon = (step) => {
        if (errors && errors.includes(step)) {
            return <ErrorIcon color="error" />;
        }
        if (completedSteps && completedSteps.includes(step)) {
            return <CheckCircleIcon color="success" />;
        }
        if (step === currentStep) {
            return <TimelineIcon color="primary" />;
        }
        return <RadioButtonUncheckedIcon />;
    };

    return (
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Progress Tracker
            </Typography>
            
            <Box sx={{ mb: 2 }}>
                <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 1 }}>
                    {Math.round(progress)}% Complete
                </Typography>
            </Box>

            <List>
                {Object.entries(workflowSteps).map(([key, label]) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ marginBottom: '8px' }}
                    >
                        <ListItem>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <ListItemIcon>
                                    {getStepIcon(key)}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={label}
                                    secondary={currentStep === key ? 'In Progress' : ''}
                                />
                                {currentStep === key && (
                                    <ArrowRightIcon color="primary" />
                                )}
                            </Box>
                        </ListItem>
                    </motion.div>
                ))}
            </List>

            {errors && errors.length > 0 && (
                <Fade in>
                    <Box sx={{ mt: 2 }}>
                        <Typography color="error" variant="subtitle2" gutterBottom>
                            Issues Detected:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {errors.map((error) => (
                                <Chip
                                    key={error}
                                    label={workflowSteps[error]}
                                    color="error"
                                    size="small"
                                    icon={<ErrorIcon />}
                                />
                            ))}
                        </Box>
                    </Box>
                </Fade>
            )}
        </Paper>
    );
};

ProgressTracker.propTypes = {
    currentStep: PropTypes.string.isRequired,
    completedSteps: PropTypes.arrayOf(PropTypes.string).isRequired,
    errors: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default ProgressTracker;
