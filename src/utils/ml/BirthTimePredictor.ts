import type { BirthData } from '../../backend/models/birth_data';
import type { MLInsight } from '../chart/types/visualization';
import { TattwaAnalyzer } from '../../backend/core/rectification/analysis/tattwa_analyzer';
import { PhysicalCorrelationCalculator } from '../../backend/core/rectification/analysis/metrics/physical_correlation_calculator';
import { DashaVerificationCalculator } from '../../backend/core/rectification/analysis/metrics/dasha_verification_calculator';

export interface PredictionResult {
    predictedTime: string;
    confidence: number;
    insights: MLInsight[];
    adjustmentMinutes: number;
    correlationScores: {
        physical: number;
        events: number;
        dashas: number;
        tattwa: number;
    };
}

export class BirthTimePredictor {
    private tattwaAnalyzer: TattwaAnalyzer;
    private physicalCorrelation: PhysicalCorrelationCalculator;
    private dashaVerification: DashaVerificationCalculator;
    
    constructor() {
        this.tattwaAnalyzer = new TattwaAnalyzer();
        this.physicalCorrelation = new PhysicalCorrelationCalculator();
        this.dashaVerification = new DashaVerificationCalculator();
    }
    
    public async predictBirthTime(birthData: BirthData): Promise<PredictionResult> {
        try {
            // Calculate base correlations
            const physicalScores = await this.calculatePhysicalCorrelations(birthData);
            const eventScores = await this.calculateEventCorrelations(birthData);
            const dashaScores = await this.calculateDashaCorrelations(birthData);
            const tattwaScores = await this.calculateTattwaCorrelations(birthData);
            
            // Generate insights from correlations
            const insights = this.generateInsightsFromCorrelations({
                physical: physicalScores,
                events: eventScores,
                dashas: dashaScores,
                tattwa: tattwaScores
            });
            
            // Calculate time adjustment
            const adjustment = this.calculateTimeAdjustment(
                birthData,
                physicalScores,
                eventScores,
                dashaScores,
                tattwaScores
            );
            
            // Calculate overall confidence
            const confidence = this.calculateOverallConfidence(
                physicalScores,
                eventScores,
                dashaScores,
                tattwaScores
            );
            
            // Adjust birth time
            const predictedTime = this.adjustBirthTime(birthData.time, adjustment);
            
            return {
                predictedTime,
                confidence,
                insights,
                adjustmentMinutes: adjustment,
                correlationScores: {
                    physical: physicalScores.overall,
                    events: eventScores.overall,
                    dashas: dashaScores.overall,
                    tattwa: tattwaScores.overall
                }
            };
        } catch (error) {
            throw new Error(`Birth time prediction failed: ${error.message}`);
        }
    }
    
    private async calculatePhysicalCorrelations(birthData: BirthData): Promise<{
        overall: number;
        details: Record<string, number>;
    }> {
        const correlations = await this.physicalCorrelation.calculateMetrics(
            birthData.physical_characteristics || {},
            birthData
        );
        
        return {
            overall: correlations.element_correlation,
            details: {
                height: correlations.planetary_signification,
                build: correlations.dasha_influence,
                complexion: correlations.tattwa_correlation.element
            }
        };
    }
    
    private async calculateEventCorrelations(birthData: BirthData): Promise<{
        overall: number;
        details: Record<string, number>;
    }> {
        const events = birthData.life_events || [];
        const correlations = await this.dashaVerification.calculateMetrics(
            {},
            birthData,
            events
        );
        
        return {
            overall: correlations.event_verification.dasha_alignment || 0,
            details: Object.fromEntries(
                events.map(event => [
                    event.type,
                    correlations.event_verification[event.type]?.dasha_alignment || 0
                ])
            )
        };
    }
    
    private async calculateDashaCorrelations(birthData: BirthData): Promise<{
        overall: number;
        details: Record<string, number>;
    }> {
        const correlations = await this.dashaVerification.calculateMetrics(
            {},
            birthData,
            []
        );
        
        return {
            overall: correlations.planetary_strength.overall || 0,
            details: correlations.planetary_strength
        };
    }
    
    private async calculateTattwaCorrelations(birthData: BirthData): Promise<{
        overall: number;
        details: Record<string, number>;
    }> {
        const tattwaBalance = await this.tattwaAnalyzer.calculate_balance(
            {},
            birthData
        );
        
        return {
            overall: Object.values(tattwaBalance.element_scores)
                .reduce((sum, score) => sum + score, 0) / 5,
            details: tattwaBalance.element_scores
        };
    }
    
    private generateInsightsFromCorrelations(correlations: {
        physical: { overall: number; details: Record<string, number> };
        events: { overall: number; details: Record<string, number> };
        dashas: { overall: number; details: Record<string, number> };
        tattwa: { overall: number; details: Record<string, number> };
    }): MLInsight[] {
        const insights: MLInsight[] = [];
        
        // Generate physical correlation insights
        if (correlations.physical.overall > 0.7) {
            insights.push({
                type: 'correlation',
                description: 'Strong correlation found in physical characteristics',
                confidence: correlations.physical.overall,
                relatedElements: [
                    { type: 'planet', id: 'ascendant', significance: 0.8 },
                    { type: 'planet', id: 'mars', significance: 0.7 }
                ],
                visualCues: [
                    {
                        type: 'highlight',
                        elements: ['ascendant', 'mars'],
                        style: { color: '#2196F3', thickness: 2 }
                    }
                ]
            });
        }
        
        // Generate event correlation insights
        if (correlations.events.overall > 0.7) {
            insights.push({
                type: 'pattern',
                description: 'Significant event patterns detected',
                confidence: correlations.events.overall,
                relatedElements: [
                    { type: 'planet', id: 'jupiter', significance: 0.75 },
                    { type: 'planet', id: 'saturn', significance: 0.7 }
                ],
                visualCues: [
                    {
                        type: 'connection',
                        elements: ['jupiter', 'saturn'],
                        style: { color: '#4CAF50', thickness: 2 }
                    }
                ]
            });
        }
        
        // Generate dasha correlation insights
        if (correlations.dashas.overall > 0.7) {
            insights.push({
                type: 'prediction',
                description: 'Strong dasha period correlations found',
                confidence: correlations.dashas.overall,
                relatedElements: [
                    { type: 'house', id: 'first_house', significance: 0.8 },
                    { type: 'aspect', id: 'moon_jupiter', significance: 0.75 }
                ],
                visualCues: [
                    {
                        type: 'annotation',
                        elements: ['first_house', 'moon_jupiter'],
                        style: { color: '#3F51B5', thickness: 2 }
                    }
                ]
            });
        }
        
        // Generate tattwa correlation insights
        if (correlations.tattwa.overall > 0.7) {
            insights.push({
                type: 'pattern',
                description: 'Strong elemental balance detected',
                confidence: correlations.tattwa.overall,
                relatedElements: [
                    { type: 'house', id: 'fifth_house', significance: 0.8 },
                    { type: 'planet', id: 'sun', significance: 0.75 }
                ],
                visualCues: [
                    {
                        type: 'highlight',
                        elements: ['fifth_house', 'sun'],
                        style: { color: '#FFC107', thickness: 2 }
                    }
                ]
            });
        }
        
        return insights;
    }
    
    private calculateTimeAdjustment(
        birthData: BirthData,
        physicalScores: { overall: number; details: Record<string, number> },
        eventScores: { overall: number; details: Record<string, number> },
        dashaScores: { overall: number; details: Record<string, number> },
        tattwaScores: { overall: number; details: Record<string, number> }
    ): number {
        // Calculate weighted adjustment based on correlation scores
        const weights = {
            physical: 0.3,
            events: 0.3,
            dashas: 0.25,
            tattwa: 0.15
        };
        
        // Calculate base adjustment (in minutes)
        let adjustment = 0;
        
        // Adjust based on physical correlations
        if (physicalScores.overall < 0.6) {
            adjustment += (0.6 - physicalScores.overall) * 60 * weights.physical;
        }
        
        // Adjust based on event correlations
        if (eventScores.overall < 0.6) {
            adjustment += (0.6 - eventScores.overall) * 60 * weights.events;
        }
        
        // Adjust based on dasha correlations
        if (dashaScores.overall < 0.6) {
            adjustment += (0.6 - dashaScores.overall) * 60 * weights.dashas;
        }
        
        // Adjust based on tattwa correlations
        if (tattwaScores.overall < 0.6) {
            adjustment += (0.6 - tattwaScores.overall) * 60 * weights.tattwa;
        }
        
        // Round to nearest 5 minutes
        return Math.round(adjustment / 5) * 5;
    }
    
    private calculateOverallConfidence(
        physicalScores: { overall: number; details: Record<string, number> },
        eventScores: { overall: number; details: Record<string, number> },
        dashaScores: { overall: number; details: Record<string, number> },
        tattwaScores: { overall: number; details: Record<string, number> }
    ): number {
        const weights = {
            physical: 0.3,
            events: 0.3,
            dashas: 0.25,
            tattwa: 0.15
        };
        
        return (
            physicalScores.overall * weights.physical +
            eventScores.overall * weights.events +
            dashaScores.overall * weights.dashas +
            tattwaScores.overall * weights.tattwa
        );
    }
    
    private adjustBirthTime(time: string, adjustmentMinutes: number): string {
        const [hours, minutes] = time.split(':').map(Number);
        let totalMinutes = hours * 60 + minutes + adjustmentMinutes;
        
        // Handle day wraparound
        while (totalMinutes < 0) totalMinutes += 24 * 60;
        while (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;
        
        const adjustedHours = Math.floor(totalMinutes / 60);
        const adjustedMinutes = totalMinutes % 60;
        
        return `${adjustedHours.toString().padStart(2, '0')}:${adjustedMinutes.toString().padStart(2, '0')}`;
    }
} 