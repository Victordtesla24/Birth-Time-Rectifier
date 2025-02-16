export interface BirthData {
  date: Date | null;
  time: Date | null;
  location: string;
}

export interface RectificationFormProps {
  birthData: BirthData;
  onBirthDataChange: (data: BirthData) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'date' | 'time' | 'text';
  options: Array<{
    value: string | number | boolean;
    label: string;
  }>;
}

export interface RectificationResult {
  rectifiedTime: string;
  confidence: number;
  chartData: any; // This will be of type ChartData from shared types
  birthData: BirthData;
}

export interface RectificationState {
  step: 'INITIAL_DATA' | 'RESEARCH' | 'QUESTIONNAIRE' | 'ANALYSIS' | 'RESULTS';
  birthData: BirthData;
  loading: boolean;
  error: string;
  result: RectificationResult | null;
  currentQuestion: Question | null;
  answers: Record<string, any>;
  confidenceScore: number;
  chartData: any; // This will be of type ChartData from shared types
  completedSteps: string[];
} 