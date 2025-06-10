import { Planet, House, Aspect, GeoLocation } from './astrological';
import { ConfidenceMetrics, MLInsights } from './analysis';

export interface ChartData {
    planets: Planet[];
    houses: House[];
    aspects: Aspect[];
    ascendant: number;
    mc: number;
    dateTime: string;
    location: GeoLocation;
}

export interface ChartProps {
    data: ChartData;
    width?: number;
    height?: number;
    confidenceMetrics?: ConfidenceMetrics;
    mlInsights?: MLInsights;
    onPlanetClick?: (planet: Planet) => void;
    onHouseClick?: (house: House) => void;
    onAspectHover?: (aspect: Aspect) => void;
}

export interface ChartControlsProps {
    onZoom: (scale: number) => void;
    onReset: () => void;
    className?: string;
}

export interface ChartInsightsProps {
    data: ChartData;
    confidenceMetrics: ConfidenceMetrics;
    mlInsights: MLInsights;
    selectedPlanet?: Planet;
    selectedHouse?: House;
    className?: string;
} 