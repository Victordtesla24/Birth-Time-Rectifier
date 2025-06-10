export interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  aspects?: string[];
  retrograde?: boolean;
  speed?: number;
}

export interface House {
  number: number;
  sign: string;
  degree: number;
  cusp?: number;
}

export interface ChartData {
  planets: Planet[];
  houses: House[];
  ascendant?: {
    sign: string;
    degree: number;
  };
  midheaven?: {
    sign: string;
    degree: number;
  };
  date: string;
  time: string;
  location: string;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  exact?: boolean;
}

export interface ChartPoint {
  x: number;
  y: number;
  label?: string;
  angle?: number;
  radius?: number;
} 