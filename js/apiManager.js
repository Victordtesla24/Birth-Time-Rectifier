import { CONFIG } from './config.js';
import { ApiClient } from './api.js';

export class ApiManager {
    constructor() {
        this.apiClient = new ApiClient();
    }

    async processWithAgent1(data) {
        try {
            const response = await this.apiClient.calculateBirthTime(data);
            return { success: true, ...response };
        } catch (error) {
            throw new Error('Agent 1 processing failed: ' + error.message);
        }
    }

    async processWithAgent2(data) {
        try {
            const response = await this.apiClient.getRefinedTime(data);
            return { success: true, ...response };
        } catch (error) {
            throw new Error('Agent 2 processing failed: ' + error.message);
        }
    }

    formatChartData(data) {
        const { planets = [], houses = [], aspects = [] } = data;
        return {
            planets: planets.map(planet => ({
                ...planet,
                position: planet.position || 0
            })),
            houses: houses.map(house => ({
                ...house,
                position: house.position || 0
            })),
            aspects: aspects.map(aspect => ({
                ...aspect,
                type: aspect.type || 'conjunction'
            }))
        };
    }

    async processBirthData(data) {
        try {
            // Process with Agent 1
            const agent1Result = await this.processWithAgent1(data);
            
            // Process with Agent 2
            const agent2Result = await this.processWithAgent2(agent1Result);
            
            // Format chart data
            const chartData = this.formatChartData(agent2Result);
            
            return {
                success: true,
                chart: chartData
            };
        } catch (error) {
            throw new Error('Birth data processing failed: ' + error.message);
        }
    }
}
