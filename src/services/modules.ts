export const COLORS = {
    // Planet colors
    SUN: '#FFD700',
    MOON: '#C0C0C0',
    MERCURY: '#4169E1',
    VENUS: '#FF69B4',
    MARS: '#FF4500',
    JUPITER: '#9370DB',
    SATURN: '#8B4513',
    URANUS: '#00CED1',
    NEPTUNE: '#4B0082',
    PLUTO: '#2F4F4F',
    
    // Aspect colors
    CONJUNCTION: '#4CAF50',
    SEXTILE: '#2196F3',
    SQUARE: '#F44336',
    TRINE: '#9C27B0',
    OPPOSITION: '#FF9800',
    
    // House colors
    HOUSE_BORDER: '#666666',
    HOUSE_FILL: '#fafafa',
    HOUSE_TEXT: '#333333',
    
    // Chart colors
    CHART_BACKGROUND: '#ffffff',
    CHART_GRID: '#f5f5f5',
    CHART_BORDER: '#e0e0e0',
    HOUSE_STROKE: '#e0e0e0',
    PLANET_FILL: '#2196f3',
    PLANET_STROKE: '#1976d2',
    ASPECT_LINE: '#9e9e9e',
    SELECTED_ELEMENT: '#ff4081',
    TEXT_PRIMARY: '#000000',
    TEXT_SECONDARY: '#757575',
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    background: '#ffffff',
    text: '#000000',
};

export const CONFIG = {
    // Chart dimensions
    CHART_SIZE: 600,
    CHART_PADDING: 20,
    CHART_MARGIN: 40,
    
    // Animation settings
    ANIMATION_DURATION: 300,
    TRANSITION_DURATION: 300,
    
    // Zoom settings
    MIN_ZOOM: 0.5,
    MAX_ZOOM: 4,
    ZOOM_STEP: 0.2,
    
    // Aspect settings
    ASPECT_LINE_WIDTH: 1,
    ASPECT_OPACITY: 0.6,
    
    // Planet settings
    PLANET_RADIUS: 5,
    PLANET_STROKE_WIDTH: 2,
    PLANET_LABEL_OFFSET: 20,
    
    // House settings
    HOUSE_LINE_WIDTH: 1,
    HOUSE_NUMBER_RADIUS: 0.85,
    
    // Confidence thresholds
    CONFIDENCE_LOW: 0.3,
    CONFIDENCE_MEDIUM: 0.6,
    CONFIDENCE_HIGH: 0.8,
    CONFIDENCE_THRESHOLD: 0.8,
    
    // New aspect settings
    ASPECT_ORB: 5,
    HOUSE_STROKE_WIDTH: 1,
    animation: {
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    chart: {
        width: 800,
        height: 600,
        margin: {
            top: 20,
            right: 20,
            bottom: 30,
            left: 40,
        },
    },
    api: {
        baseUrl: process.env.REACT_APP_API_URL || '',
        endpoints: {
            birthChart: '/api/birth-chart',
            rectifyBirthTime: '/api/rectify-birth-time',
            chartInsights: '/api/chart-insights',
            questionnaire: '/api/questionnaire',
        },
    },
}; 