// Astrological Types
export interface Planet {
    name: string;
    longitude: number;
    latitude?: number;
    speed?: number;
    house?: number;
    dignity?: string;
    strength?: number;
    sign?: string;
}

export interface House {
    number: number;
    longitude: number;
    startAngle?: number;
    endAngle?: number;
    sign?: string;
}

export interface Aspect {
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
    strength: number;
    angle?: number;
}

export interface ConfidenceMetrics {
    overall: number;
    planetary: number;
    dasha: number;
    events: number;
    appearance: number;
    aspects?: number;
    houses?: number;
    planets?: number;
}

export interface MLInsights {
    patterns: Array<{
        type: string;
        description: string;
        confidence: number;
        planets: string[];
    }>;
    suggestions: Array<{
        type: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
    }>;
    correlations: Array<{
        type: string;
        strength: number;
        description: string;
    }>;
}

// Chart Types
export interface ChartProps {
    planets: Planet[];
    houses: House[];
    aspects: Aspect[];
    width?: number;
    height?: number;
    confidenceMetrics?: ConfidenceMetrics;
    mlInsights?: MLInsights;
    onPlanetClick?: (planet: Planet) => void;
    onHouseClick?: (house: House) => void;
    onAspectHover?: (aspect: Aspect) => void;
}

// Common Types
export type DateTimeString = string;
export type Coordinates = [number, number];
export type TimeZone = string;

export interface UserPreferences {
    theme: 'light' | 'dark';
    language: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
}

export interface ErrorResponse {
    code: string;
    message: string;
    details?: Record<string, any>;
}

export interface SuccessResponse<T> {
    data: T;
    meta?: Record<string, any>;
}

// Core Types
export interface ChartData {
  houses: House[];
  planets: Planet[];
  aspects: Aspect[];
}

export interface ChartOptions {
  width: number;
  height: number;
  padding: number;
  theme: ChartTheme;
}

export interface ChartEvent {
  type: string;
  target: string;
  data: any;
}

// Entity Types
export interface Planet {
  name: string;
  longitude: number;
  latitude?: number;
  speed?: number;
  house?: number;
  dignity?: string;
  strength?: number;
  sign?: string;
}

export interface House {
  number: number;
  longitude: number;
  startAngle?: number;
  endAngle?: number;
  sign?: string;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  strength: number;
  angle?: number;
}

// Metric Types
export interface PlanetaryStrength {
  planet: string;
  dignity: number;
  house: number;
  aspects: number;
  total: number;
}

export interface AspectHarmony {
  type: string;
  strength: number;
  quality: 'benefic' | 'malefic' | 'neutral';
}

export interface HouseBalance {
  house: number;
  strength: number;
  planets: string[];
}

export interface YogaStrength {
  name: string;
  planets: string[];
  strength: number;
}

// Common Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface WorkflowState {
  step: number;
  data: any;
  confidence: number;
}

export interface FormData {
  birthDate: Date;
  birthTime: string;
  location: string;
  confidence: number;
}

// Theme Types
export interface ChartTheme {
  background: string;
  text: string;
  lines: string;
  planets: Record<string, string>;
  aspects: Record<string, string>;
}

// Common Types
export interface DateTimeInput {
  date: Date;
  time: string;
  timezone: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

// Re-export all types
export * from './chart';
export * from './astrological';
export * from './analysis';
export * from './common';
export * from './rectification.types';