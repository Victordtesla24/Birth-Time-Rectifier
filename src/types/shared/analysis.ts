import { ElementalBalance } from './astrological';

export interface ConfidenceMetrics {
    overallConfidence: number;
    detailed_metrics: {
        tattwa_balance: TattwaMetrics;
        event_correlations?: EventMetrics;
        planetary_strength: PlanetaryMetrics;
        chart_harmony: ChartHarmonyMetrics;
    };
    improvement_suggestions: string[];
}

export interface TattwaMetrics {
    score: number;
    weight: number;
    components: {
        element_distribution: ElementalBalance;
        quality_balance: number;
        elemental_harmony: number;
    };
}

export interface EventMetrics {
    score: number;
    weight: number;
    correlations: Array<{
        event: string;
        strength: number;
        description: string;
    }>;
}

export interface PlanetaryMetrics {
    score: number;
    weight: number;
    individual_strengths: Record<string, number>;
}

export interface ChartHarmonyMetrics {
    score: number;
    weight: number;
    components: {
        aspect_harmony: number;
        house_balance: number;
        yoga_strength: number;
    };
}

export interface MLInsights {
    predictedEvents: PredictedEvent[];
    karmaticPatterns: KarmaticPattern[];
    lifeThemes: LifeTheme[];
}

export interface PredictedEvent {
    type: string;
    probability: number;
    timeframe: string;
    description: string;
}

export interface KarmaticPattern {
    pattern: string;
    strength: number;
    interpretation: string;
}

export interface LifeTheme {
    theme: string;
    prominence: number;
    description: string;
} 