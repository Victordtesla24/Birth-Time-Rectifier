import { Planet, House, Aspect, ConfidenceMetrics, MLInsights } from '../../types/shared';

export interface ChartProps {
  planets?: Planet[];
  houses?: House[];
  aspects?: Aspect[];
  width?: number;
  height?: number;
  confidenceMetrics?: ConfidenceMetrics;
  mlInsights?: MLInsights;
  onPlanetClick?: (planet: Planet) => void;
  onHouseClick?: (house: House) => void;
  onAspectHover?: (aspect: Aspect | null) => void;
  selectedPlanet?: string | null;
}

export interface ChartControlsProps {
  onZoom: (level: number) => void;
  onPan: (direction: 'left' | 'right') => void;
  zoomLevel: number;
  minZoom?: number;
  maxZoom?: number;
}

export interface ChartHousesProps {
  houses: House[];
  radius: number;
  onHouseClick?: (house: House) => void;
}

export interface ChartPlanetsProps {
  planets: Planet[];
  radius: number;
  selectedPlanet: string | null;
  onPlanetClick?: (planet: Planet) => void;
  setSelectedPlanet: (name: string | null) => void;
}

export interface ChartAspectsProps {
  aspects: Aspect[];
  planets: Planet[];
  radius: number;
  onAspectHover?: (aspect: Aspect | null) => void;
}

export interface ChartInsightsProps {
  selectedPlanet?: Planet | null;
  hoveredAspect?: Aspect | null;
  confidenceMetrics?: ConfidenceMetrics;
  mlInsights?: MLInsights;
} 