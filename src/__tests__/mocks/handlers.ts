import { http, HttpResponse } from 'msw';
import { mockChartData } from '../fixtures/mockChartData';

export const handlers = [
  // Calculate birth time
  http.post('/api/calculate-birth-time', async ({ request }) => {
    const data = await request.json();
    
    if (!data.date || !data.location || !data.answers) {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'Missing required fields',
      });
    }

    return HttpResponse.json({
      birthTime: '14:30',
      confidence: 0.85,
      chartData: mockChartData,
    });
  }),

  // Get location suggestions
  http.get('/api/location-search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query) {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'Query parameter is required',
      });
    }

    return HttpResponse.json([
      {
        id: 1,
        name: 'New York, NY, USA',
        latitude: 40.7128,
        longitude: -74.0060,
      },
      {
        id: 2,
        name: 'Los Angeles, CA, USA',
        latitude: 34.0522,
        longitude: -118.2437,
      },
    ]);
  }),

  // Generate PDF report
  http.post('/api/generate-report', async ({ request }) => {
    const data = await request.json();
    
    if (!data.chartData || !data.birthTime) {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'Missing required data',
      });
    }

    return HttpResponse.json({
      reportUrl: 'https://example.com/report.pdf',
    });
  }),

  // Save calculation results
  http.post('/api/save-results', async ({ request }) => {
    const data = await request.json();
    
    if (!data.chartData || !data.birthTime || !data.confidence) {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'Missing required data',
      });
    }

    return HttpResponse.json({
      id: '123456',
      savedAt: new Date().toISOString(),
    });
  }),

  // Get saved calculation
  http.get('/api/calculations/:id', ({ params }) => {
    const { id } = params;

    if (id === '123456') {
      return HttpResponse.json({
        birthTime: '14:30',
        confidence: 0.85,
        chartData: mockChartData,
        savedAt: '2024-02-20T14:30:00Z',
      });
    }

    return new HttpResponse(null, {
      status: 404,
      statusText: 'Calculation not found',
    });
  }),

  http.get('/api/birth-chart', () => {
    return HttpResponse.json({
      success: true,
      data: {
        planets: [
          { name: 'Sun', position: 0, house: 1 },
          { name: 'Moon', position: 30, house: 2 },
          { name: 'Mars', position: 60, house: 3 },
          { name: 'Mercury', position: 90, house: 4 },
          { name: 'Jupiter', position: 120, house: 5 },
          { name: 'Venus', position: 150, house: 6 },
          { name: 'Saturn', position: 180, house: 7 },
          { name: 'Rahu', position: 210, house: 8 },
          { name: 'Ketu', position: 240, house: 9 },
        ],
        houses: [
          { number: 1, position: 0 },
          { number: 2, position: 30 },
          { number: 3, position: 60 },
          { number: 4, position: 90 },
          { number: 5, position: 120 },
          { number: 6, position: 150 },
          { number: 7, position: 180 },
          { number: 8, position: 210 },
          { number: 9, position: 240 },
          { number: 10, position: 270 },
          { number: 11, position: 300 },
          { number: 12, position: 330 },
        ],
      },
    });
  }),

  http.post('/api/rectify-birth-time', () => {
    return HttpResponse.json({
      success: true,
      data: {
        rectifiedTime: '12:30:00',
        confidence: 0.85,
        adjustmentMinutes: 15,
      },
    });
  }),

  http.get('/api/chart-insights', () => {
    return HttpResponse.json({
      success: true,
      data: {
        aspects: [
          { planet1: 'Sun', planet2: 'Moon', type: 'conjunction', orb: 2 },
          { planet1: 'Mars', planet2: 'Venus', type: 'square', orb: 1 },
          { planet1: 'Jupiter', planet2: 'Saturn', type: 'opposition', orb: 3 },
        ],
        strengths: [
          { planet: 'Sun', value: 8.5 },
          { planet: 'Moon', value: 7.2 },
          { planet: 'Mars', value: 6.8 },
        ],
        interpretations: [
          'The Sun-Moon conjunction indicates strong vitality and emotional harmony.',
          'Mars square Venus suggests dynamic tension in relationships and creative endeavors.',
          'Jupiter opposite Saturn represents a balance between expansion and limitation.',
        ],
      },
    });
  }),

  http.post('/api/questionnaire', () => {
    return HttpResponse.json({
      success: true,
      data: {
        score: 85,
        recommendations: [
          'Consider refining birth time between 12:15 and 12:45',
          'Focus on major life events for better accuracy',
          'Review physical appearance correlations',
        ],
      },
    });
  }),
]; 