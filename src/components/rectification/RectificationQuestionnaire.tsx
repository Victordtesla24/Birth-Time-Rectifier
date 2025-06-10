import React from 'react';
import { Box, Button, Typography, CircularProgress, Paper } from '@mui/material';
import { ChartVisualization } from '../chart/ChartVisualization';
import { Question } from './types';

interface RectificationQuestionnaireProps {
  currentQuestion: Question | null;
  onAnswer: (questionId: string, answer: any) => void;
  loading: boolean;
  chartData: any;
  confidenceScore: number;
}

export const RectificationQuestionnaire: React.FC<RectificationQuestionnaireProps> = ({
  currentQuestion,
  onAnswer,
  loading,
  chartData,
  confidenceScore,
}) => {
  if (!currentQuestion) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Generating next question...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {currentQuestion.text}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          {currentQuestion.options.map((option) => (
            <Button
              key={option.value}
              variant="outlined"
              onClick={() => onAnswer(currentQuestion.id, option.value)}
              disabled={loading}
            >
              {option.label}
            </Button>
          ))}
        </Box>
      </Paper>

      {chartData && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Current Chart Analysis (Confidence: {Math.round(confidenceScore * 100)}%)
          </Typography>
          <ChartVisualization
            planets={chartData.planets}
            houses={chartData.houses}
            aspects={chartData.aspects}
            width={600}
            height={600}
          />
        </Box>
      )}
    </Box>
  );
}; 