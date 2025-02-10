// Workflow Orchestration Module
// Implements the dual-agent workflow for birth time rectification

import { CONFIG } from './config.js';
import { ApiClient, EventBus } from './modules.js';

export class WorkflowOrchestrator {
    constructor() {
        this.currentStep = 1;
        this.birthData = null;
        this.astronomicalData = null;
        this.questionnaire = null;
        this.refinedTime = null;
        this.api = new ApiClient();
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                if (!this.birthData) return false;
                return Boolean(
                    this.birthData.birthDate && 
                    this.birthData.approximateTime && 
                    this.birthData.location
                );
            case 2:
                if (!this.astronomicalData) return false;
                return Boolean(this.astronomicalData.planets);
            case 3:
                if (!this.questionnaire) return false;
                return Object.values(this.questionnaire).every(v => v !== null);
            default:
                return false;
        }
    }

    async processBirthData(birthData) {
        try {
            this.birthData = birthData;
            EventBus.emit('calculation-progress', 10);

            // Step 1: Validate and geocode location
            const geocodingResponse = await this.api.geocodeLocation(birthData.location);
            if (!geocodingResponse || !geocodingResponse.coordinates) {
                throw new Error('Location validation failed');
            }
            EventBus.emit('calculation-progress', 25);

            // Step 2: Fetch astronomical data
            const astronomicalResponse = await this.api.getAstronomicalData({
                date: birthData.birthDate,
                time: birthData.approximateTime,
                coordinates: geocodingResponse.coordinates
            });
            
            if (!astronomicalResponse || !astronomicalResponse.data) {
                throw new Error('Failed to fetch astronomical data');
            }
            
            this.astronomicalData = astronomicalResponse.data.astronomicalData;
            EventBus.emit('calculation-progress', 40);

            // Step 3: Validate life events
            if (!this.validateLifeEvents(birthData.events)) {
                throw new Error('Life events validation failed');
            }
            EventBus.emit('calculation-progress', 55);

            // Step 4: Generate questionnaire
            this.questionnaire = await this.generateQuestionnaire();
            EventBus.emit('calculation-progress', 70);

            // Step 5: Calculate initial birth time
            const initialTime = await this.calculateInitialTime();
            EventBus.emit('calculation-progress', 85);

            // Final step: Refine birth time
            this.refinedTime = await this.refineBirthTime(initialTime);
            EventBus.emit('calculation-progress', 100);

            return {
                success: true,
                data: {
                    refinedTime: this.refinedTime,
                    astronomicalData: this.astronomicalData,
                    questionnaire: this.questionnaire
                }
            };
        } catch (error) {
            console.error('Workflow error:', error);
            throw error;
        }
    }

    moveToNextStep() {
        if (this.validateCurrentStep()) {
            this.currentStep++;
            return true;
        }
        return false;
    }

    moveToPreviousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            return true;
        }
        return false;
    }

    reset() {
        this.currentStep = 1;
        this.birthData = null;
        this.astronomicalData = null;
        this.questionnaire = null;
        this.refinedTime = null;
    }

    validateLifeEvents(events) {
        return events && events.length > 0;
    }

    async generateQuestionnaire() {
        // Simplified questionnaire generation
        return {
            q1: null,
            q2: null,
            q3: null
        };
    }

    async calculateInitialTime() {
        // Simplified initial time calculation
        return this.birthData.approximateTime;
    }

    async refineBirthTime(initialTime) {
        // Simplified birth time refinement
        return initialTime;
    }
}

export class WorkflowController {
    constructor() {
        this.steps = [
            'collectBirthInfo',
            'processAstronomicalData',
            'analyzeLifeEvents',
            'generateQuestionnaire',
            'calculateTime'
        ];
        this.currentStepIndex = 0;
    }

    async agent1Process(formData) {
        try {
            const birthInfo = await this.collectBirthInfo(formData);
            const events = this.extractEvents(formData);
            const eventsAnalysis = await this.analyzeEvents(events);
            const preliminaryPackage = await this.preparePreliminaryPackage(eventsAnalysis);
            
            return {
                birthDate: birthInfo.birthDate,
                birthTime: birthInfo.birthTime,
                birthPlace: birthInfo.birthPlace,
                uncertainty: birthInfo.uncertainty,
                events: events,
                analysis: preliminaryPackage
            };
        } catch (error) {
            console.error('Agent 1 workflow error:', error);
            throw error;
        }
    }

    async agent2Process(initialData) {
        try {
            await this.simulateProcessing();
            const patterns = await this.analyzePatterns(initialData);
            const questionnaireResults = await this.processQuestionnaire();
            const processedResults = await this.processResults(patterns, questionnaireResults);
            
            const validationResult = await this.validateResults();
            if (!validationResult.isValid) {
                throw new Error(validationResult.error || 'Validation failed');
            }

            return {
                success: true,
                refinedTime: this.generateRandomTime(),
                patterns,
                questionnaireResults,
                processedResults
            };
        } catch (error) {
            console.error('Agent 2 processing failed:', error);
            throw error;
        }
    }

    async collectBirthInfo(formData) {
        await this.simulateProcessing();
        return {
            birthDate: formData.get('birthDate'),
            birthTime: formData.get('approximateTime'),
            birthPlace: formData.get('birthPlace'),
            uncertainty: formData.get('timeUncertainty'),
        };
    }

    extractEvents(formData) {
        const events = [];
        const dates = formData.getAll('eventDate[]');
        const types = formData.getAll('eventType[]');
        const descriptions = formData.getAll('eventDescription[]');
        
        for (let i = 0; i < dates.length; i++) {
            events.push({
                date: dates[i],
                type: types[i],
                description: descriptions[i]
            });
        }
        
        return events;
    }

    generateRandomTime() {
        const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
        const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    async simulateProcessing() {
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    async analyzeEvents(events) {
        await this.simulateProcessing();
        return { events, analysis: 'Preliminary analysis complete' };
    }

    async preparePreliminaryPackage(analysis) {
        await this.simulateProcessing();
        return { ...analysis, prepared: true };
    }

    async analyzePatterns(data) {
        await this.simulateProcessing();
        return { patterns: ['pattern1', 'pattern2'] };
    }

    async processQuestionnaire() {
        await this.simulateProcessing();
        return { answers: ['answer1', 'answer2'] };
    }

    async processResults(patterns, questionnaire) {
        await this.simulateProcessing();
        return { processed: true };
    }

    async validateResults() {
        await this.simulateProcessing();
        return { isValid: true };
    }
}
