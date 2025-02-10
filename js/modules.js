import { ApiManager } from './apiManager.js';
import { ApiClient } from './api.js';
import { eventBus } from './eventBus.js';
import { VisualizationManager } from './visualization.js';

// Define color constants
const COLORS = {
    primary: '#4A90E2',
    success: '#2ECC71',
    error: '#E74C3C'
};

// Export configuration
const CONFIG = {
    chartSize: 600,
    centerX: 300,
    centerY: 300,
    particleCount: 100,
    loadingSpeed: 5
};

export {
    COLORS,
    CONFIG,
    ApiManager,
    ApiClient,
    eventBus as EventBus,
    VisualizationManager as Visualizer
};
