import type { ConfidenceData, MLInsight } from '../chart/types/visualization';
import type { BirthData } from '../../backend/models/birth_data';
import type { Question } from './QuestionnaireGenerator';

export interface AnalysisResult {
    updatedConfidence: ConfidenceData;
    updatedBirthData: BirthData;
    insights: MLInsight[];
    recommendations: string[];
}

export class QuestionnaireAnalyzer {
    private confidenceWeights = {
        physical: 0.3,
        events: 0.3,
        timing: 0.25,
        verification: 0.15
    };
    
    public analyzeResponses(
        answers: Record<string, any>,
        currentConfidence: ConfidenceData,
        currentBirthData: BirthData,
        questions: Question[]
    ): AnalysisResult {
        // Initialize result with current data
        const result: AnalysisResult = {
            updatedConfidence: { ...currentConfidence },
            updatedBirthData: { ...currentBirthData },
            insights: [],
            recommendations: []
        };
        
        // Group answers by category
        const groupedAnswers = this.groupAnswersByCategory(answers, questions);
        
        // Update confidence metrics
        this.updateConfidenceMetrics(result, groupedAnswers);
        
        // Update birth data
        this.updateBirthData(result, groupedAnswers);
        
        // Generate insights
        this.generateInsights(result, groupedAnswers);
        
        // Generate recommendations
        this.generateRecommendations(result);
        
        return result;
    }
    
    private groupAnswersByCategory(
        answers: Record<string, any>,
        questions: Question[]
    ): Record<string, Record<string, any>> {
        const grouped: Record<string, Record<string, any>> = {
            physical: {},
            events: {},
            timing: {},
            verification: {}
        };
        
        questions.forEach(question => {
            if (answers[question.id] !== undefined) {
                grouped[question.category][question.id] = answers[question.id];
            }
        });
        
        return grouped;
    }
    
    private updateConfidenceMetrics(
        result: AnalysisResult,
        groupedAnswers: Record<string, Record<string, any>>
    ): void {
        // Calculate category scores
        const categoryScores = {
            physical: this.calculatePhysicalScore(groupedAnswers.physical),
            events: this.calculateEventScore(groupedAnswers.events),
            timing: this.calculateTimingScore(groupedAnswers.timing),
            verification: this.calculateVerificationScore(groupedAnswers.verification)
        };
        
        // Update component confidence scores
        result.updatedConfidence.components = {
            ...result.updatedConfidence.components,
            physical_appearance: categoryScores.physical,
            event_correlations: categoryScores.events,
            birth_time_accuracy: categoryScores.timing,
            verification_score: categoryScores.verification
        };
        
        // Calculate overall confidence
        result.updatedConfidence.overall = this.calculateOverallConfidence(categoryScores);
    }
    
    private calculatePhysicalScore(answers: Record<string, any>): number {
        if (Object.keys(answers).length === 0) return 0;
        
        let totalScore = 0;
        let totalWeight = 0;
        
        // Weight each physical characteristic
        if (answers.height) {
            totalScore += 0.8; // High confidence for precise measurements
            totalWeight += 1;
        }
        
        if (answers.build) {
            totalScore += 0.7; // Medium-high confidence for categorical data
            totalWeight += 1;
        }
        
        if (answers.complexion) {
            totalScore += 0.6; // Medium confidence for subjective characteristics
            totalWeight += 1;
        }
        
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }
    
    private calculateEventScore(answers: Record<string, any>): number {
        if (Object.keys(answers).length === 0) return 0;
        
        let totalScore = 0;
        let totalWeight = 0;
        
        Object.entries(answers).forEach(([key, value]) => {
            if (key.startsWith('career_')) {
                totalScore += 0.8; // High confidence for career events
                totalWeight += 1;
            } else if (key.startsWith('relationship_')) {
                totalScore += 0.7; // Medium-high confidence for relationship events
                totalWeight += 1;
            } else {
                totalScore += 0.6; // Medium confidence for other events
                totalWeight += 1;
            }
        });
        
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }
    
    private calculateTimingScore(answers: Record<string, any>): number {
        if (Object.keys(answers).length === 0) return 0;
        
        let score = 0;
        
        // Weight birth time certainty heavily
        if (answers.birth_certainty) {
            score += (answers.birth_certainty / 10) * 0.6; // Scale of 1-10
        }
        
        // Weight source reliability
        if (answers.birth_source) {
            switch (answers.birth_source) {
                case 'Birth Certificate':
                    score += 0.4;
                    break;
                case 'Hospital Record':
                    score += 0.3;
                    break;
                case 'Family Memory':
                    score += 0.2;
                    break;
                case 'Approximate':
                    score += 0.1;
                    break;
            }
        }
        
        return score;
    }
    
    private calculateVerificationScore(answers: Record<string, any>): number {
        if (Object.keys(answers).length === 0) return 0;
        
        let totalScore = 0;
        let totalWeight = 0;
        
        if (answers.physical_match) {
            totalScore += (answers.physical_match / 10) * 0.5;
            totalWeight += 0.5;
        }
        
        if (answers.event_accuracy) {
            totalScore += (answers.event_accuracy / 10) * 0.5;
            totalWeight += 0.5;
        }
        
        // Include insight verification scores
        Object.entries(answers).forEach(([key, value]) => {
            if (key.startsWith('insight_') && typeof value === 'number') {
                totalScore += (value / 10) * 0.3;
                totalWeight += 0.3;
            }
        });
        
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }
    
    private calculateOverallConfidence(
        categoryScores: Record<string, number>
    ): number {
        let weightedSum = 0;
        let totalWeight = 0;
        
        Object.entries(this.confidenceWeights).forEach(([category, weight]) => {
            if (categoryScores[category] > 0) {
                weightedSum += categoryScores[category] * weight;
                totalWeight += weight;
            }
        });
        
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
    
    private updateBirthData(
        result: AnalysisResult,
        groupedAnswers: Record<string, Record<string, any>>
    ): void {
        // Update physical characteristics
        if (Object.keys(groupedAnswers.physical).length > 0) {
            result.updatedBirthData.physical_characteristics = {
                ...result.updatedBirthData.physical_characteristics,
                ...groupedAnswers.physical
            };
        }
        
        // Update life events
        if (Object.keys(groupedAnswers.events).length > 0) {
            const newEvents = Object.entries(groupedAnswers.events).map(([type, date]) => ({
                type: type.replace('_date', ''),
                date: date as string,
                description: this.getEventDescription(type),
                confidence: this.calculateEventConfidence(type)
            }));
            
            result.updatedBirthData.life_events = [
                ...(result.updatedBirthData.life_events || []),
                ...newEvents
            ];
        }
        
        // Update verification scores
        if (Object.keys(groupedAnswers.verification).length > 0) {
            result.updatedBirthData.verification_scores = {
                ...result.updatedBirthData.verification_scores,
                ...groupedAnswers.verification
            };
        }
        
        // Update birth time certainty
        if (groupedAnswers.timing.birth_certainty) {
            result.updatedBirthData.certainty = 
                (groupedAnswers.timing.birth_certainty as number) / 10;
        }
        
        // Update birth time source
        if (groupedAnswers.timing.birth_source) {
            result.updatedBirthData.source = 
                groupedAnswers.timing.birth_source.toLowerCase().replace(' ', '_') as
                    'birth_certificate' | 'hospital_record' | 'family_memory' | 'approximate';
        }
    }
    
    private getEventDescription(type: string): string {
        const descriptions: Record<string, string> = {
            career_change: 'Career change or significant promotion',
            relationship_milestone: 'Significant relationship event',
            // Add more event descriptions as needed
        };
        
        return descriptions[type] || type;
    }
    
    private calculateEventConfidence(type: string): number {
        const confidences: Record<string, number> = {
            career_change: 0.8,
            relationship_milestone: 0.7,
            // Add more event confidences as needed
        };
        
        return confidences[type] || 0.6;
    }
    
    private generateInsights(
        result: AnalysisResult,
        groupedAnswers: Record<string, Record<string, any>>
    ): void {
        // Generate physical insights
        if (Object.keys(groupedAnswers.physical).length > 0) {
            this.generatePhysicalInsights(result, groupedAnswers.physical);
        }
        
        // Generate event insights
        if (Object.keys(groupedAnswers.events).length > 0) {
            this.generateEventInsights(result, groupedAnswers.events);
        }
        
        // Generate timing insights
        if (Object.keys(groupedAnswers.timing).length > 0) {
            this.generateTimingInsights(result, groupedAnswers.timing);
        }
    }
    
    private generatePhysicalInsights(
        result: AnalysisResult,
        physicalAnswers: Record<string, any>
    ): void {
        if (physicalAnswers.height && physicalAnswers.build) {
            result.insights.push({
                type: 'correlation',
                description: 'Physical characteristics show strong correlation with birth time',
                confidence: 0.75,
                relatedElements: [
                    { type: 'planet', id: 'ascendant', significance: 0.8 },
                    { type: 'planet', id: 'mars', significance: 0.6 }
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
    }
    
    private generateEventInsights(
        result: AnalysisResult,
        eventAnswers: Record<string, any>
    ): void {
        if (Object.keys(eventAnswers).length > 0) {
            result.insights.push({
                type: 'pattern',
                description: 'Life events pattern suggests strong planetary influences',
                confidence: 0.7,
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
    }
    
    private generateTimingInsights(
        result: AnalysisResult,
        timingAnswers: Record<string, any>
    ): void {
        if (timingAnswers.birth_certainty && timingAnswers.birth_certainty > 7) {
            result.insights.push({
                type: 'prediction',
                description: 'High birth time certainty increases prediction accuracy',
                confidence: 0.85,
                relatedElements: [
                    { type: 'house', id: 'first_house', significance: 0.9 },
                    { type: 'aspect', id: 'ascendant_ruler', significance: 0.85 }
                ],
                visualCues: [
                    {
                        type: 'annotation',
                        elements: ['first_house', 'ascendant_ruler'],
                        style: { color: '#3F51B5', thickness: 2 }
                    }
                ]
            });
        }
    }
    
    private generateRecommendations(result: AnalysisResult): void {
        const { updatedConfidence } = result;
        
        // Add recommendations based on confidence scores
        if (updatedConfidence.components.physical_appearance < 0.6) {
            result.recommendations.push(
                'Consider providing more detailed physical characteristics to improve accuracy'
            );
        }
        
        if (updatedConfidence.components.event_correlations < 0.6) {
            result.recommendations.push(
                'Adding more life events would help validate the birth time'
            );
        }
        
        if (updatedConfidence.components.birth_time_accuracy < 0.7) {
            result.recommendations.push(
                'Try to obtain official birth records to increase birth time certainty'
            );
        }
        
        // Add general recommendations
        if (updatedConfidence.overall < 0.8) {
            result.recommendations.push(
                'Overall confidence could be improved by verifying more life events and physical characteristics'
            );
        }
    }
} 