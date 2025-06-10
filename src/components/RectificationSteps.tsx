import React, { useState, useEffect } from 'react';
import { Container, ProgressBar, Alert, Stepper, Step, StepLabel } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionnaireStep from './steps/QuestionnaireStep';
import { generateDynamicQuestionnaire } from '../../shared/utils/questionGenerator';

const steps = [
    {
        id: 'input',
        title: 'Input Collection',
        description: 'Enter birth details and initial information.'
    },
    {
        id: 'preprocessing',
        title: 'Data Preprocessing',
        description: 'Processing location and timezone information.'
    },
    {
        id: 'preliminary_chart',
        title: 'Preliminary Chart',
        description: 'Generating initial birth chart and analysis.'
    },
    {
        id: 'preliminary_research',
        title: 'Preliminary Research',
        description: 'Analyzing events and patterns.'
    },
    {
        id: 'consolidation',
        title: 'Data Consolidation',
        description: 'Merging analysis results.'
    },
    {
        id: 'advanced_analysis',
        title: 'Advanced Analysis',
        description: 'Performing comprehensive chart analysis.'
    },
    {
        id: 'questionnaire',
        title: 'Dynamic Questionnaire',
        description: 'Answer questions based on chart analysis.'
    },
    {
        id: 'rectification',
        title: 'Rectification Process',
        description: 'Calculating precise birth time.'
    },
    {
        id: 'final_output',
        title: 'Final Results',
        description: 'View rectified birth time and charts.'
    }
];

const RectificationSteps = ({ initialData, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [analysisData, setAnalysisData] = useState(null);
    const [questionnaire, setQuestionnaire] = useState(null);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState({});

    useEffect(() => {
        if (initialData) {
            processStep('input', initialData);
        }
    }, [initialData]);

    const processStep = async (stepId, data) => {
        setIsLoading(true);
        setError(null);
        try {
            updateProgress(stepId, 'processing');
            
            switch (stepId) {
                case 'input':
                    await processInputStep(data);
                    break;
                case 'preprocessing':
                    await processPreprocessingStep(data);
                    break;
                case 'preliminary_chart':
                    await processPreliminaryChartStep(data);
                    break;
                case 'preliminary_research':
                    await processPreliminaryResearchStep(data);
                    break;
                case 'consolidation':
                    await processConsolidationStep(data);
                    break;
                case 'advanced_analysis':
                    await processAdvancedAnalysisStep(data);
                    break;
                case 'questionnaire':
                    await processQuestionnaireStep(data);
                    break;
                case 'rectification':
                    await processRectificationStep(data);
                    break;
                case 'final_output':
                    await processFinalOutputStep(data);
                    break;
            }
            
            updateProgress(stepId, 'completed');
            if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
            }
        } catch (err) {
            setError(err.message);
            updateProgress(stepId, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const updateProgress = (stepId, status) => {
        setProgress(prev => ({
            ...prev,
            [stepId]: status
        }));
    };

    const renderCurrentStep = () => {
        const currentStepData = steps[currentStep];
        
        if (isLoading) {
            return (
                <div className="text-center p-5">
                    <ProgressBar animated now={100} />
                    <p className="mt-3">Processing {currentStepData.title}...</p>
                </div>
            );
        }

        if (error) {
            return (
                <Alert variant="danger">
                    Error in {currentStepData.title}: {error}
                </Alert>
            );
        }

        switch (currentStepData.id) {
            case 'questionnaire':
                return (
                    <QuestionnaireStep
                        questionnaire={questionnaire}
                        onAnswer={handleQuestionnaireAnswer}
                        onNext={handleQuestionnaireComplete}
                    />
                );
            case 'final_output':
                return (
                    <FinalOutput
                        analysisData={analysisData}
                        onComplete={onComplete}
                    />
                );
            default:
                return (
                    <div className="text-center p-5">
                        <h4>{currentStepData.title}</h4>
                        <p>{currentStepData.description}</p>
                        <ProgressBar
                            now={getStepProgress(currentStepData.id)}
                            label={`${getStepProgress(currentStepData.id)}%`}
                        />
                    </div>
                );
        }
    };

    const getStepProgress = (stepId) => {
        const status = progress[stepId];
        switch (status) {
            case 'completed':
                return 100;
            case 'processing':
                return 50;
            case 'error':
                return 0;
            default:
                return 0;
        }
    };

    return (
        <Container>
            <Stepper activeStep={currentStep} alternativeLabel>
                {steps.map((step, index) => (
                    <Step key={step.id} completed={index < currentStep}>
                        <StepLabel>{step.title}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {renderCurrentStep()}
            </motion.div>
        </Container>
    );
};

export default RectificationSteps; 