import { EventBus } from './modules.js';
import { format, parse } from 'date-fns';

export class ApiClient {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
        this.errorHandlers = [];
    }

    onError(callback) {
        this.errorHandlers.push(callback);
        return () => {
            this.errorHandlers = this.errorHandlers.filter(handler => handler !== callback);
        };
    }

    transformChartData(rawChartData) {
        if (!rawChartData) return null;
        
        return {
            ascendant: rawChartData.ascendant || 0,
            planetaryPositions: Object.fromEntries(
                Object.entries(rawChartData.planetary_positions || {}).map(([planet, data]) => [
                    planet.toUpperCase(),
                    { ...data, longitude: data.longitude || 0 }
                ])
            ),
            houses: rawChartData.houses || {}
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            if (this.eventBus) {
                this.eventBus.emit('loading:start');
            }
            const response = await fetch(url, {
                ...defaultOptions,
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                this.errorHandlers.forEach(handler => handler(new Error(error.message || 'API request failed')));
                if (this.eventBus) {
                    this.eventBus.emit('error', new Error(error.message || 'API request failed'));
                }
                throw new Error(error.message || 'API request failed');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            this.errorHandlers.forEach(handler => handler(error));
            if (this.eventBus) {
                this.eventBus.emit('error', error);
            }
            throw error;
        } finally {
            if (this.eventBus) {
                this.eventBus.emit('loading:end');
            }
        }
    }

    async geocodeLocation(location) {
        try {
            const response = await this.request('/geocode', {
                method: 'POST',
                body: JSON.stringify({ location })
            });
            return response;
        } catch (error) {
            console.error('Geocoding error:', error);
            throw error;
        }
    }

    // Helper function to convert date and time formats
    formatBirthData(data) {
        try {
            // Parse the MM/DD/YYYY date and format to DD/MM/YYYY
            const parsedDate = parse(data.birthDate, 'MM/dd/yyyy', new Date());
            const formattedDate = format(parsedDate, 'dd/MM/yyyy');

            // Convert time to 24-hour format
            let formattedTime = data.birthTime;
            if (data.birthTime.includes(' ')) {
                // Handle 12-hour format (e.g., "2:30 PM")
                const [time, period] = data.birthTime.split(' ');
                const [hours, minutes] = time.split(':');
                let hour24 = parseInt(hours);
                
                if (period.toUpperCase() === 'PM' && hour24 !== 12) {
                    hour24 += 12;
                } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
                    hour24 = 0;
                }

                formattedTime = `${hour24.toString().padStart(2, '0')}:${minutes}`;
            } else if (data.birthTime.includes(':')) {
                // Handle 24-hour format (e.g., "14:30")
                const [hours, minutes] = data.birthTime.split(':');
                formattedTime = `${hours.padStart(2, '0')}:${minutes}`;
            } else {
                throw new Error('Invalid time format');
            }

            return {
                ...data,
                birthDate: formattedDate,
                birthTime: formattedTime
            };
        } catch (error) {
            console.error('Date/time formatting error:', error);
            throw new Error(`Invalid date or time format: ${error.message}`);
        }
    }

    async calculateBirthTime(data) {
        try {
            if (!data.birthData || !data.birthData.birthDate || !data.birthData.birthTime || !data.birthData.birthPlace) {
                throw new Error('Invalid birth data: All fields are required');
            }

            const response = await this.request('/rectification/analyze', {
                method: 'POST',
                body: JSON.stringify({
                    birthData: {
                        birthDate: data.birthData.birthDate,
                        birthTime: data.birthData.birthTime,
                        birthPlace: data.birthData.birthPlace
                    },
                    stage: data.stage || 'preliminary',
                    responses: data.responses,
                    currentConfidence: data.currentConfidence
                })
            });

            if (response.status === 'success' && response.chart_data) {
                return {
                    ...response,
                    chart_data: this.transformChartData(response.chart_data)
                };
            }

            return response;
        } catch (error) {
            console.error('Birth time calculation error:', error);
            throw new Error(`Birth time calculation failed: ${error.message}`);
        }
    }

    async getAstronomicalData(date, location) {
        return this.request('/astronomical-data', {
            method: 'POST',
            body: JSON.stringify({ date, location })
        });
    }

    async validateEvent(event) {
        try {
            if (!event.date || !event.description) {
                throw new Error('Invalid event data: Date and description are required');
            }

            const formattedEvent = {
                ...event,
                date: format(new Date(event.date), 'yyyy-MM-dd')
            };

            // Mock response for development
            return {
                isValid: true,
                confidence: 90,
                significance: 'high'
            };
        } catch (error) {
            console.error('Event validation error:', error);
            throw new Error(`Event validation failed: ${error.message}`);
        }
    }

    async generateQuestionnaire(data) {
        try {
            const response = await this.request('/questionnaire', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            return response;
        } catch (error) {
            console.error('Questionnaire generation error:', error);
            throw error;
        }
    }

    async getRefinedTime(data) {
        return this.request('/refine-time', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getInterpretation(chartData) {
        return this.request('/interpret', {
            method: 'POST',
            body: JSON.stringify(chartData)
        });
    }

    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }

    onLoading(callback) {
        this.eventBus.on('loading:start', callback);
    }

    onLoadingComplete(callback) {
        this.eventBus.on('loading:end', callback);
    }
}

/**
 * Base API service for making HTTP requests
 */
export const apiService = {
    /**
     * Submit questionnaire data
     * @param {Object} data - Questionnaire responses
     * @returns {Promise<Object>} Analysis results
     */
    async submitQuestionnaire(data) {
        // Mock API response for now
        return {
            status: 'success',
            results: {
                confidence_score: 0.85,
                suggested_adjustments: [
                    { type: 'time_shift', value: '+2:30' },
                    { type: 'confidence_range', value: '±15 minutes' }
                ],
                analysis_notes: 'Strong correlation with reported life events'
            }
        };
    },

    /**
     * Process life events data
     * @param {Array} events - Array of life events
     * @returns {Promise<Object>} Processing results
     */
    async processLifeEvents(events) {
        // Mock API response for now
        return {
            status: 'success',
            results: {
                event_correlations: events.map(event => ({
                    ...event,
                    astrological_significance: 'high',
                    confidence_score: 0.9
                })),
                overall_confidence: 0.88
            }
        };
    },

    /**
     * Reset current workflow state
     * @returns {Promise<void>}
     */
    async resetWorkflow() {
        // Mock API response for now
        return { status: 'success' };
    }
};
