// Directory Structure Definition
export const PROJECT_STRUCTURE = {
  src: {
    // Core application directories
    __tests__: {
      unit: 'Unit tests for individual components and functions',
      integration: 'Integration tests between components',
      e2e: 'End-to-end workflow tests',
      mocks: 'Mock data and functions for testing'
    },
    
    // Type definitions
    types: {
      shared: 'Shared type definitions used across the application',
      frontend: 'Frontend-specific type definitions',
      backend: 'Backend-specific type definitions',
      index: 'Root type exports'
    },
    
    // Utility functions
    utils: {
      chart: 'Chart-related utility functions',
      validation: 'Data validation utilities',
      date: 'Date manipulation utilities',
      index: 'Root utility exports'
    },
    
    // Services
    services: {
      api: 'API service definitions and implementations',
      chart: 'Chart generation and manipulation services',
      workflow: 'Workflow management services',
      index: 'Root service exports'
    },
    
    // React Components
    components: {
      chart: 'Chart visualization components',
      rectification: 'Birth time rectification components',
      shared: 'Shared/common components',
      index: 'Root component exports'
    },
    
    // Constants and Configuration
    constants: {
      chart: 'Chart-related constants',
      validation: 'Validation rules and constants',
      api: 'API endpoints and configurations',
      index: 'Root constant exports'
    },
    
    // Styles
    styles: {
      components: 'Component-specific styles',
      pages: 'Page-level styles',
      themes: 'Theme definitions and configurations'
    },
    
    // Next.js Pages
    pages: {
      api: 'API route handlers',
      _app: 'Next.js app configuration',
      _document: 'Next.js document configuration',
      index: 'Main application page'
    }
  }
};

// Export paths for easy access
export const PATHS = {
  TESTS: 'src/__tests__',
  TYPES: 'src/types',
  UTILS: 'src/utils',
  SERVICES: 'src/services',
  COMPONENTS: 'src/components',
  CONSTANTS: 'src/constants',
  STYLES: 'src/styles',
  PAGES: 'src/pages'
} as const;

// Export module groups for consolidated exports
export const MODULE_EXPORTS = {
  // Components
  CHART_COMPONENTS: [
    'BirthChartVisualization',
    'ChartRenderer',
    'ChartControls',
    'ChartInsights'
  ],
  
  // Types
  CORE_TYPES: [
    'ChartData',
    'ChartOptions',
    'ChartEvent'
  ],
  
  ENTITY_TYPES: [
    'Planet',
    'House',
    'Aspect'
  ],
  
  METRIC_TYPES: [
    'ConfidenceMetrics',
    'PlanetaryStrength',
    'AspectHarmony',
    'HouseBalance',
    'YogaStrength'
  ],
  
  // Services
  FRONTEND_SERVICES: [
    'visualizationService',
    'chartService',
    'themeService',
    'localizationService'
  ],
  
  BACKEND_SERVICES: [
    'workflowService',
    'sketchService',
    'apiService',
    'eventBus'
  ]
} as const;

// Export consolidated paths for module resolution
export const MODULE_PATHS = {
  TYPES: {
    SHARED: '@/types/shared',
    FRONTEND: '@/types/frontend',
    BACKEND: '@/types/backend'
  },
  
  COMPONENTS: {
    CHART: '@/components/chart',
    RECTIFICATION: '@/components/rectification',
    SHARED: '@/components/shared'
  },
  
  SERVICES: {
    API: '@/services/api',
    CHART: '@/services/chart',
    WORKFLOW: '@/services/workflow'
  }
} as const; 