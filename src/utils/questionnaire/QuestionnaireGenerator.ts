import type { ConfidenceData, MLInsight } from '../chart/types/visualization';
import type { BirthData } from '../../backend/models/birth_data';

export interface Question {
    id: string;
    type: 'multiple_choice' | 'date' | 'time' | 'text' | 'boolean' | 'scale';
    text: string;
    options?: string[];
    min?: number;
    max?: number;
    required: boolean;
    confidence: number;
    category: 'physical' | 'events' | 'personality' | 'timing' | 'verification';
    followUp?: string[];
}

export interface QuestionnaireSection {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    priority: number;
    confidence: number;
}

export class QuestionnaireGenerator {
    private confidenceThresholds = {
        high: 0.8,
        medium: 0.6,
        low: 0.4
    };
    
    private questionBank: Record<string, Question[]> = {
        physical: [
            {
                id: 'height',
                type: 'scale',
                text: 'What is your height?',
                min: 140,
                max: 220,
                required: true,
                confidence: 0.7,
                category: 'physical'
            },
            {
                id: 'build',
                type: 'multiple_choice',
                text: 'Which best describes your build?',
                options: ['Slim', 'Athletic', 'Medium', 'Well-built', 'Heavy'],
                required: true,
                confidence: 0.8,
                category: 'physical'
            },
            {
                id: 'complexion',
                type: 'multiple_choice',
                text: 'What is your natural complexion?',
                options: ['Fair', 'Medium', 'Olive', 'Dark', 'Reddish'],
                required: true,
                confidence: 0.75,
                category: 'physical'
            }
        ],
        events: [
            {
                id: 'career_change',
                type: 'date',
                text: 'When did you last change careers or get a significant promotion?',
                required: false,
                confidence: 0.65,
                category: 'events'
            },
            {
                id: 'relationship_milestone',
                type: 'date',
                text: 'When did you experience a significant relationship milestone?',
                required: false,
                confidence: 0.7,
                category: 'events'
            }
        ],
        timing: [
            {
                id: 'birth_certainty',
                type: 'scale',
                text: 'How certain are you about your recorded birth time?',
                min: 1,
                max: 10,
                required: true,
                confidence: 0.9,
                category: 'timing'
            },
            {
                id: 'birth_source',
                type: 'multiple_choice',
                text: 'What is the source of your birth time?',
                options: ['Birth Certificate', 'Hospital Record', 'Family Memory', 'Approximate'],
                required: true,
                confidence: 0.85,
                category: 'timing'
            }
        ],
        verification: [
            {
                id: 'physical_match',
                type: 'scale',
                text: 'How well do the physical descriptions match you?',
                min: 1,
                max: 10,
                required: true,
                confidence: 0.75,
                category: 'verification'
            },
            {
                id: 'event_accuracy',
                type: 'scale',
                text: 'How accurately do the predicted life events match your experience?',
                min: 1,
                max: 10,
                required: true,
                confidence: 0.8,
                category: 'verification'
            }
        ]
    };
    
    public generateQuestionnaire(
        confidence: ConfidenceData,
        birthData: BirthData,
        insights: MLInsight[]
    ): QuestionnaireSection[] {
        const sections: QuestionnaireSection[] = [];
        
        // Generate sections based on confidence metrics
        if (this.needsPhysicalVerification(confidence)) {
            sections.push(this.generatePhysicalSection(confidence));
        }
        
        if (this.needsEventVerification(confidence)) {
            sections.push(this.generateEventSection(confidence, insights));
        }
        
        if (this.needsTimingVerification(confidence)) {
            sections.push(this.generateTimingSection(confidence));
        }
        
        // Add verification section if we have initial data
        if (birthData && Object.keys(birthData).length > 0) {
            sections.push(this.generateVerificationSection(confidence));
        }
        
        // Sort sections by priority
        return sections.sort((a, b) => b.priority - a.priority);
    }
    
    private needsPhysicalVerification(confidence: ConfidenceData): boolean {
        const physicalScore = confidence.components['physical_appearance'] || 0;
        return physicalScore < this.confidenceThresholds.high;
    }
    
    private needsEventVerification(confidence: ConfidenceData): boolean {
        const eventScore = confidence.components['event_correlations'] || 0;
        return eventScore < this.confidenceThresholds.high;
    }
    
    private needsTimingVerification(confidence: ConfidenceData): boolean {
        return confidence.overall < this.confidenceThresholds.high;
    }
    
    private generatePhysicalSection(confidence: ConfidenceData): QuestionnaireSection {
        const physicalScore = confidence.components['physical_appearance'] || 0;
        
        return {
            id: 'physical_verification',
            title: 'Physical Characteristics',
            description: 'Please verify your physical characteristics to improve birth time accuracy.',
            questions: this.questionBank.physical.filter(q => q.confidence > physicalScore),
            priority: this.calculatePriority(physicalScore),
            confidence: physicalScore
        };
    }
    
    private generateEventSection(confidence: ConfidenceData, insights: MLInsight[]): QuestionnaireSection {
        const eventScore = confidence.components['event_correlations'] || 0;
        
        // Add insight-specific questions
        const insightQuestions = this.generateInsightQuestions(insights);
        
        return {
            id: 'event_verification',
            title: 'Life Events',
            description: 'Please provide details about significant life events to enhance accuracy.',
            questions: [...this.questionBank.events, ...insightQuestions].filter(q => q.confidence > eventScore),
            priority: this.calculatePriority(eventScore),
            confidence: eventScore
        };
    }
    
    private generateTimingSection(confidence: ConfidenceData): QuestionnaireSection {
        return {
            id: 'timing_verification',
            title: 'Birth Time Verification',
            description: 'Please provide additional details about your birth time recording.',
            questions: this.questionBank.timing,
            priority: this.calculatePriority(confidence.overall),
            confidence: confidence.overall
        };
    }
    
    private generateVerificationSection(confidence: ConfidenceData): QuestionnaireSection {
        return {
            id: 'final_verification',
            title: 'Final Verification',
            description: 'Please verify the accuracy of the analysis results.',
            questions: this.questionBank.verification,
            priority: 1, // Always lowest priority
            confidence: confidence.overall
        };
    }
    
    private generateInsightQuestions(insights: MLInsight[]): Question[] {
        return insights.map(insight => ({
            id: `insight_${insight.type}`,
            type: 'scale',
            text: `How accurate is this observation: ${insight.description}?`,
            min: 1,
            max: 10,
            required: true,
            confidence: insight.confidence,
            category: 'verification'
        }));
    }
    
    private calculatePriority(confidence: number): number {
        if (confidence < this.confidenceThresholds.low) return 4;
        if (confidence < this.confidenceThresholds.medium) return 3;
        if (confidence < this.confidenceThresholds.high) return 2;
        return 1;
    }
} 