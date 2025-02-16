import React, { useState } from 'react';
import { Box } from '@mui/material';
import { format } from 'date-fns';
import { ApiClient } from '../../services/api';
import { RectificationForm } from './RectificationForm';
import { RectificationQuestionnaire } from './RectificationQuestionnaire';
import { ProgressTracker } from '../ProgressTracker';
import { BirthData, RectificationState, Question } from './types';

const STEPS = {
  INITIAL_DATA: 'INITIAL_DATA',
  RESEARCH: 'RESEARCH',
  QUESTIONNAIRE: 'QUESTIONNAIRE',
  ANALYSIS: 'ANALYSIS',
  RESULTS: 'RESULTS',
} as const;

const CONFIDENCE_THRESHOLD = 0.95;

interface RectificationContainerProps {
  initialValues?: Partial<BirthData>;
  onSubmit?: (data: any) => void;
  apiClient?: ApiClient;
}

export const RectificationContainer: React.FC<RectificationContainerProps> = ({
  initialValues = {},
  onSubmit,
  apiClient = new ApiClient(),
}) => {
  const [state, setState] = useState<RectificationState>({
    step: STEPS.INITIAL_DATA,
    birthData: {
      date: initialValues?.date ?? null,
      time: initialValues?.time ?? null,
      location: initialValues?.location ?? '',
    },
    loading: false,
    error: '',
    result: null,
    currentQuestion: null,
    answers: {},
    confidenceScore: 0,
    chartData: null,
    completedSteps: [],
  });

  const handleBirthDataChange = (birthData: BirthData) => {
    setState((prev) => ({ ...prev, birthData, error: '' }));
  };

  const validateInitialData = () => {
    const errors = [];
    if (!state.birthData.date) errors.push('Birth date is required');
    if (!state.birthData.time) errors.push('Approximate birth time is required');
    if (!state.birthData.location) errors.push('Birth location is required');
    return errors;
  };

  const handleInitialSubmit = async () => {
    const validationErrors = validateInitialData();
    if (validationErrors.length > 0) {
      setState((prev) => ({ ...prev, error: validationErrors.join(', ') }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: '' }));

    try {
      const birthDataPayload = {
        birthDate: format(state.birthData.date!, 'dd/MM/yyyy'),
        birthTime: format(state.birthData.time!, 'HH:mm'),
        birthPlace: state.birthData.location,
      };

      const response = await apiClient.calculateBirthTime({
        birthData: birthDataPayload,
        stage: 'initial',
      });

      if (response.status === 'success') {
        const updatedSteps = [...state.completedSteps];
        if (!updatedSteps.includes(STEPS.INITIAL_DATA)) {
          updatedSteps.push(STEPS.INITIAL_DATA);
        }
        if (!updatedSteps.includes(STEPS.RESEARCH)) {
          updatedSteps.push(STEPS.RESEARCH);
        }

        setState((prev) => ({
          ...prev,
          confidenceScore: response.confidence_score || 0,
          chartData: response.preliminary_analysis?.chart_data,
          step: response.preliminary_analysis?.next_questions?.length
            ? STEPS.QUESTIONNAIRE
            : STEPS.RESEARCH,
          currentQuestion: response.preliminary_analysis?.next_questions?.[0] || null,
          completedSteps: updatedSteps,
          result: {
            rectifiedTime: response.birth_data?.birthTime,
            confidence: Math.round(response.confidence_score * 100),
            chartData: response.preliminary_analysis?.chart_data,
            birthData: birthDataPayload,
          },
        }));

        if (onSubmit) {
          onSubmit({
            ...birthDataPayload,
            confidence: response.confidence_score || 0,
            preliminaryAnalysis: response.preliminary_analysis || {},
          });
        }
      } else {
        throw new Error(response.message || 'Failed to process birth data');
      }
    } catch (err: any) {
      console.error('API Error:', err);
      setState((prev) => ({
        ...prev,
        error: err.message || 'Error processing birth time rectification',
        step: STEPS.INITIAL_DATA,
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleAnswer = async (questionId: string, answer: any) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      answers: { ...prev.answers, [questionId]: answer },
    }));

    try {
      const response = await apiClient.calculateBirthTime({
        birthData: {
          birthDate: format(state.birthData.date!, 'dd/MM/yyyy'),
          birthTime: format(state.birthData.time!, 'HH:mm'),
          birthPlace: state.birthData.location,
        },
        responses: { ...state.answers, [questionId]: answer },
        currentConfidence: state.confidenceScore,
        stage: 'questionnaire',
      });

      if (response.status === 'success') {
        const newConfidence = response.confidence_score || 0;
        const updatedSteps = [...state.completedSteps];

        if (!updatedSteps.includes(STEPS.QUESTIONNAIRE)) {
          updatedSteps.push(STEPS.QUESTIONNAIRE);
        }
        if (newConfidence >= CONFIDENCE_THRESHOLD && !updatedSteps.includes(STEPS.ANALYSIS)) {
          updatedSteps.push(STEPS.ANALYSIS);
        }

        setState((prev) => ({
          ...prev,
          confidenceScore: newConfidence,
          chartData: response.preliminary_analysis?.chart_data,
          step: newConfidence >= CONFIDENCE_THRESHOLD ? STEPS.RESULTS : prev.step,
          currentQuestion: response.preliminary_analysis?.next_questions?.[0] || null,
          completedSteps: updatedSteps,
          result: newConfidence >= CONFIDENCE_THRESHOLD
            ? {
                rectifiedTime: response.birth_data?.birthTime,
                confidence: Math.round(newConfidence * 100),
                chartData: response.preliminary_analysis?.chart_data,
                birthData: prev.birthData,
              }
            : prev.result,
        }));
      }
    } catch (err: any) {
      console.error('API Error:', err);
      setState((prev) => ({
        ...prev,
        error: err.message || 'Error processing answer',
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <Box>
      <ProgressTracker
        steps={Object.values(STEPS)}
        currentStep={state.step}
        completedSteps={state.completedSteps}
      />
      {state.step === STEPS.INITIAL_DATA && (
        <RectificationForm
          birthData={state.birthData}
          onBirthDataChange={handleBirthDataChange}
          onSubmit={handleInitialSubmit}
          loading={state.loading}
          error={state.error}
        />
      )}
      {(state.step === STEPS.QUESTIONNAIRE || state.step === STEPS.RESEARCH) && (
        <RectificationQuestionnaire
          currentQuestion={state.currentQuestion}
          onAnswer={handleAnswer}
          loading={state.loading}
          chartData={state.chartData}
          confidenceScore={state.confidenceScore}
        />
      )}
    </Box>
  );
}; 