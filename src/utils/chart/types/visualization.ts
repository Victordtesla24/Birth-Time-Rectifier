export interface Colors {
    high: string;
    medium: string;
    low: string;
    background: string;
    highlight: string;
    text: string;
    interactive: string;
}

export interface Animation {
    progress: number;
    duration: number;
    startTime: number;
    transitions: Map<string, {
        start: number;
        end: number;
        startTime: number;
    }>;
}

export interface Zoom {
    level: number;
    min: number;
    max: number;
    target: number;
    smoothing: number;
}

export interface Pan {
    x: number;
    y: number;
    isDragging: boolean;
    lastX: number;
    lastY: number;
    momentum: { x: number; y: number };
}

export interface Tooltips {
    active: string | null;
    fadeIn: number;
    content: string;
    position: { x: number; y: number };
    isVisible: boolean;
}

export interface PlanetaryInfo {
    isVisible: boolean;
    planet: string | null;
    details: Record<string, any>;
    position: { x: number; y: number };
}

export interface A11y {
    announcements: Array<{
        message: string;
        timestamp: number;
        priority: 'high' | 'medium' | 'low';
    }>;
    lastUpdate: number;
    focusedElement: string | null;
    navigationMode: 'chart' | 'details' | 'planets';
    ariaLabels: Map<string, string>;
}

export interface ComparisonView {
    charts: Array<{
        id: string;
        data: ConfidenceData;
        position: { x: number; y: number };
        scale: number;
        isActive: boolean;
    }>;
    layout: 'horizontal' | 'vertical' | 'grid';
    spacing: number;
    syncZoom: boolean;
    syncPan: boolean;
}

export interface MLInsight {
    type: 'pattern' | 'correlation' | 'anomaly' | 'prediction';
    description: string;
    confidence: number;
    relatedElements: Array<{
        type: 'planet' | 'house' | 'aspect';
        id: string;
        significance: number;
    }>;
    visualCues: Array<{
        type: 'highlight' | 'connection' | 'annotation';
        elements: string[];
        style: {
            color?: string;
            opacity?: number;
            lineStyle?: 'solid' | 'dashed' | 'dotted';
            thickness?: number;
        };
    }>;
}

export interface ConfidenceData {
    overall: number;
    components: Record<string, number>;
    details?: Record<string, any>;
} 