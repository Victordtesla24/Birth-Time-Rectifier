export interface Planet {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  isRetrograde: boolean;
  sign: string;
  house: number;
  aspects: string[];
}

export interface House {
  number: number;
  cusp: number;
  sign: string;
  planets: string[];
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying: boolean;
}

export interface ChartData {
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  ascendant: number;
  midheaven: number;
  confidence?: number;
}

export interface BirthData {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface IEventBus {
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data?: any) => void) => void;
  off: (event: string, callback: (data?: any) => void) => void;
}

export interface ConfidenceMetrics {
  overallConfidence: number;
  planetaryConfidence: Record<string, number>;
  houseConfidence: Record<number, number>;
  aspectConfidence: Record<string, number>;
}

export interface MLInsights {
  planetaryStrengths: Record<string, number>;
  houseSignificance: Record<number, number>;
  aspectImportance: Record<string, number>;
  recommendations: string[];
} 