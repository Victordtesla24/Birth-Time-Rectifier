export interface BirthData {
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    timezone: string;
    certainty: number;
    source: 'birth_certificate' | 'hospital_record' | 'family_memory' | 'approximate';
    physical_characteristics?: {
        height?: number;
        build?: string;
        complexion?: string;
        [key: string]: any;
    };
    life_events?: Array<{
        type: string;
        date: string;
        description: string;
        confidence: number;
    }>;
    verification_scores?: {
        physical_match?: number;
        event_accuracy?: number;
        overall_confidence?: number;
    };
} 