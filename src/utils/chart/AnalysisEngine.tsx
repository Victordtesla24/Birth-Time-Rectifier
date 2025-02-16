/**
 * Consolidated Analysis Engine Module
 * Combines comprehensive analysis, chart analysis, and rectification functionality
 */

import { calculateAyanamsa } from '../../shared/utils/astroUtils';
import { calculateDivisionalCharts } from '../../shared/utils/divisionalCharts';
import { logger } from '../../shared/utils/logger';
import { apiService } from '../services/api';
import { eventBus } from '../services/eventBus';

export class AnalysisEngine {
    constructor(birthData) {
        this.birthData = birthData;
        this.analysisResults = null;
        this.rectificationResults = null;
        this.currentStep = 'initial';
        this.questionnaireResponses = null;
        this.lifeEvents = null;
    }

    // Analysis Methods
    async analyze() {
        try {
            // Step 1: Calculate basic planetary positions
            const positions = await this.calculatePlanetaryPositions();
            
            // Step 2: Generate divisional charts
            const divisionalCharts = await this.generateDivisionalCharts(positions);
            
            // Step 3: Analyze planetary strengths and aspects
            const strengthAnalysis = this.analyzePlanetaryStrengths(positions);
            const aspectAnalysis = this.analyzePlanetaryAspects(positions);
            
            // Step 4: Analyze houses and sensitive points
            const houseAnalysis = this.analyzeHouses(positions);
            const sensitivePoints = this.analyzeSensitivePoints(positions);
            
            // Step 5: Generate comprehensive analysis
            this.analysisResults = {
                birth_data: this.birthData,
                planetary_positions: positions,
                divisional_charts: divisionalCharts,
                strength_analysis: strengthAnalysis,
                aspect_analysis: aspectAnalysis,
                house_analysis: houseAnalysis,
                sensitive_points: sensitivePoints,
                timestamp: new Date().toISOString()
            };
            
            return this.analysisResults;
            
        } catch (error) {
            logger.error('Analysis error:', error);
            throw error;
        }
    }

    // Rectification Methods
    async startRectification() {
        try {
            // Validate birth data
            const validationResult = await apiService.validateBirthData(this.birthData);
            if (!validationResult.isValid) {
                throw new Error(validationResult.errors.join(', '));
            }

            // Perform initial analysis
            await this.analyze();

            // Generate questionnaire
            const questionnaire = this.generateQuestionnaire();

            this.currentStep = 'questionnaire';
            eventBus.emit('rectification-step-changed', this.currentStep);

            return {
                analysisResults: this.analysisResults,
                questionnaire
            };
        } catch (error) {
            logger.error('Error starting rectification:', error);
            throw error;
        }
    }

    async processQuestionnaireResponses(responses) {
        try {
            this.questionnaireResponses = responses;

            // Analyze responses
            const responseAnalysis = this.analyzeResponses(responses);

            // Update analysis with questionnaire insights
            this.analysisResults = {
                ...this.analysisResults,
                questionnaire_analysis: responseAnalysis
            };

            this.currentStep = 'life_events';
            eventBus.emit('rectification-step-changed', this.currentStep);

            return this.analysisResults;
        } catch (error) {
            logger.error('Error processing questionnaire:', error);
            throw error;
        }
    }

    async processLifeEvents(events) {
        try {
            this.lifeEvents = events;

            // Analyze life events
            const eventsAnalysis = await this.analyzeLifeEvents(events);

            // Update analysis with life events insights
            this.analysisResults = {
                ...this.analysisResults,
                life_events_analysis: eventsAnalysis
            };

            // Perform rectification
            const rectificationResult = await this.rectify(events);

            this.currentStep = 'results';
            eventBus.emit('rectification-step-changed', this.currentStep);

            return rectificationResult;
        } catch (error) {
            logger.error('Error processing life events:', error);
            throw error;
        }
    }

    async rectify(eventData) {
        try {
            if (!this.analysisResults) {
                await this.analyze();
            }

            // Perform birth time rectification
            this.rectificationResults = await this.rectifyBirthTime(
                this.birthData,
                eventData
            );

            // If confidence is high enough, update birth time
            if (this.rectificationResults.confidence >= 0.85) {
                this.birthData.birthTime = this.rectificationResults.rectifiedTime;
                
                // Re-run analysis with rectified time
                await this.analyze();
            }

            return {
                ...this.rectificationResults,
                analysisResults: this.analysisResults
            };
        } catch (error) {
            logger.error('Rectification error:', error);
            throw error;
        }
    }

    // Questionnaire Generation
    generateQuestionnaire() {
        const { sensitive_points, strength_analysis } = this.analysisResults;
        const questions = [];

        // Generate questions based on planetary positions
        const planetaryQuestions = this._generatePlanetaryQuestions(this.analysisResults.planetary_positions);
        questions.push(...planetaryQuestions);

        // Generate questions based on divisional charts
        const divisionalQuestions = this._generateDivisionalChartQuestions(this.analysisResults.divisional_charts);
        questions.push(...divisionalQuestions);

        // Generate questions based on dasha periods
        const dashaQuestions = this._generateDashaQuestions(this.analysisResults.dasha_analysis);
        questions.push(...dashaQuestions);

        return {
            id: `questionnaire_${Date.now()}`,
            sections: [
                {
                    id: 'physical_traits',
                    title: 'Physical Characteristics',
                    questions: this._generatePhysicalTraitQuestions(sensitive_points)
                },
                {
                    id: 'life_events',
                    title: 'Life Events',
                    questions: questions.filter(q => q.category === 'life_events')
                },
                {
                    id: 'personality',
                    title: 'Personality Traits',
                    questions: questions.filter(q => q.category === 'personality')
                }
            ],
            metadata: {
                generated_at: new Date().toISOString(),
                version: '2.1',
                chart_analysis: this.analysisResults.chart_summary
            }
        };
    }

    _generatePhysicalTraitQuestions(sensitive_points) {
        return sensitive_points.map(point => ({
            id: `physical_${point.id}`,
            type: 'select',
            category: 'physical',
            text: `Select your ${point.trait_type}:`,
            options: point.possible_traits.map(trait => ({
                value: trait.id,
                label: trait.description
            })),
            weight: point.significance
        }));
    }

    _generatePlanetaryQuestions(positions) {
        const questions = [];
        
        // Check for zodiac sign changes
        const sunMoonChanges = this._checkSunMoonSignChanges(positions);
        if (sunMoonChanges.length > 0) {
            questions.push(...sunMoonChanges.map(change => ({
                id: `sign_change_${change.planet}`,
                type: 'select',
                category: 'personality',
                text: `Select the description that best matches your nature:`,
                options: change.combinations.map(combo => ({
                    value: combo.id,
                    label: combo.description
                })),
                weight: 1.0
            })));
        }

        // Check Ascendant changes
        const ascendantChanges = this._checkAscendantChanges(positions);
        if (ascendantChanges.length > 0) {
            questions.push({
                id: 'ascendant_traits',
                type: 'multi_select',
                category: 'personality',
                text: 'Select all traits that match your personality:',
                options: [
                    { value: 'psychological', label: ascendantChanges.psychological },
                    { value: 'appearance', label: ascendantChanges.appearance },
                    { value: 'interests', label: ascendantChanges.interests },
                    { value: 'values', label: ascendantChanges.values }
                ],
                weight: 1.0
            });
        }

        // Generate event-based questions
        const eventQuestions = Object.entries(positions).map(([planet, position]) => ({
            id: `planetary_${planet}`,
            type: 'boolean',
            category: 'life_events',
            text: this._getPlanetaryQuestionText(planet, position),
            options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
            ],
            followUp: {
                condition: 'yes',
                question: {
                    type: 'select',
                    text: 'When did this occur?',
                    options: this._generateTimeframeOptions()
                }
            },
            weight: this._getPlanetaryWeight(planet)
        }));
        questions.push(...eventQuestions);

        return questions;
    }

    _generateDivisionalChartQuestions(charts) {
        return Object.entries(charts).map(([chart, data]) => ({
            id: `divisional_${chart}`,
            type: 'select',
            category: 'life_events',
            text: this._getDivisionalChartQuestion(chart),
            options: this._getDivisionalChartOptions(chart, data),
            weight: this._getChartWeight(chart)
        }));
    }

    _generateDashaQuestions(dasha_analysis) {
        return dasha_analysis.major_periods.map(period => ({
            id: `dasha_${period.planet}`,
            type: 'multi_select',
            category: 'life_events',
            text: `During ${period.planet}'s period (${period.start_date} to ${period.end_date}), which events occurred?`,
            options: [
                { value: 'career', label: 'Career Changes' },
                { value: 'relationship', label: 'Relationship Events' },
                { value: 'education', label: 'Educational Milestones' },
                { value: 'health', label: 'Health Issues' },
                { value: 'residence', label: 'Residence Changes' },
                { value: 'spiritual', label: 'Spiritual Events' }
            ],
            weight: period.significance
        }));
    }

    _checkSunMoonSignChanges(positions) {
        const changes = [];
        ['Sun', 'Moon'].forEach(planet => {
            const signChange = this._calculateSignChange(positions[planet]);
            if (signChange) {
                changes.push({
                    planet,
                    combinations: this._getSignCombinations(signChange.from, signChange.to)
                });
            }
        });
        return changes;
    }

    _checkAscendantChanges(positions) {
        const ascendantChange = this._calculateAscendantChange(positions);
        if (!ascendantChange) return [];
        
        return {
            psychological: this._getAscendantTraits(ascendantChange, 'psychological'),
            appearance: this._getAscendantTraits(ascendantChange, 'appearance'),
            interests: this._getAscendantTraits(ascendantChange, 'interests'),
            values: this._getAscendantTraits(ascendantChange, 'values')
        };
    }

    _getPlanetaryQuestionText(planet, position) {
        const templates = {
            Sun: 'Did you experience significant recognition or authority changes?',
            Moon: 'Were there notable emotional or domestic changes?',
            Mars: 'Did you face any significant challenges or conflicts?',
            Mercury: 'Were there important communications or educational developments?',
            Jupiter: 'Did you experience expansion in knowledge or opportunities?',
            Venus: 'Were there significant relationships or artistic developments?',
            Saturn: 'Did you face major responsibilities or restrictions?',
            Rahu: 'Were there unexpected changes or new directions?',
            Ketu: 'Did you experience spiritual or transformative events?'
        };
        return templates[planet] || 'Did you experience significant changes?';
    }

    _generateTimeframeOptions() {
        return [
            { value: 'childhood', label: 'During childhood (0-12 years)' },
            { value: 'teenage', label: 'During teenage years (13-19)' },
            { value: 'early_adult', label: 'Early adulthood (20-28)' },
            { value: 'adult', label: 'Adulthood (29-45)' },
            { value: 'middle_age', label: 'Middle age (46-60)' },
            { value: 'senior', label: 'Senior years (60+)' }
        ];
    }

    _getPlanetaryWeight(planet) {
        const weights = {
            Sun: 0.9,
            Moon: 0.9,
            Mars: 0.7,
            Mercury: 0.6,
            Jupiter: 0.8,
            Venus: 0.7,
            Saturn: 0.8,
            Rahu: 0.6,
            Ketu: 0.6
        };
        return weights[planet] || 0.5;
    }

    // State Management
    getCurrentStep() {
        return this.currentStep;
    }

    getAnalysisResults() {
        return this.analysisResults;
    }

    getRectificationResults() {
        return this.rectificationResults;
    }

    // Event Handlers
    onStepChange(callback) {
        return eventBus.on('rectification-step-changed', callback);
    }

    async calculatePlanetaryPositions() {
        // Implementation of planetary position calculation
        return {
            // Placeholder for actual implementation
            planets: [],
            houses: [],
            ayanamsa: calculateAyanamsa(this.birthData.date)
        };
    }

    async generateDivisionalCharts(positions) {
        return calculateDivisionalCharts(positions);
    }

    analyzePlanetaryStrengths(positions) {
        return {
            // Placeholder for actual implementation
            dignities: this.calculateDignities(positions),
            shadbala: this.calculateShadbala(positions),
            ashtakavarga: this.calculateAshtakavarga(positions)
        };
    }

    analyzePlanetaryAspects(positions) {
        return {
            // Placeholder for actual implementation
            aspects: this.calculateAspects(positions),
            aspect_strengths: this.calculateAspectStrengths(positions)
        };
    }

    analyzeHouses(positions) {
        return {
            // Placeholder for actual implementation
            house_strengths: this.calculateHouseStrengths(positions),
            house_significations: this.calculateHouseSignifications(positions)
        };
    }

    analyzeSensitivePoints(positions) {
        return {
            // Placeholder for actual implementation
            critical_degrees: this.findCriticalDegrees(positions),
            sensitive_points: this.findSensitivePoints(positions),
            yogas: this.findYogas(positions)
        };
    }

    calculateDignities(positions) {
        // Implementation of dignity calculation
        return {};
    }

    calculateShadbala(positions) {
        // Implementation of shadbala calculation
        return {};
    }

    calculateAshtakavarga(positions) {
        // Implementation of ashtakavarga calculation
        return {};
    }

    calculateAspects(positions) {
        // Implementation of aspect calculation
        return [];
    }

    calculateAspectStrengths(positions) {
        // Implementation of aspect strength calculation
        return {};
    }

    calculateHouseStrengths(positions) {
        // Implementation of house strength calculation
        return {};
    }

    calculateHouseSignifications(positions) {
        // Implementation of house signification calculation
        return {};
    }

    findCriticalDegrees(positions) {
        // Implementation of critical degree detection
        return [];
    }

    findSensitivePoints(positions) {
        // Implementation of sensitive point detection
        return [];
    }

    findYogas(positions) {
        // Implementation of yoga detection
        return [];
    }

    async rectifyBirthTime(birthData, eventData) {
        // Implementation of birth time rectification
        return {
            rectifiedTime: birthData.time,
            confidence: 0.85,
            adjustmentMinutes: 0
        };
    }

    generateReport() {
        if (!this.analysisResults) {
            throw new Error('Analysis must be performed before generating report');
        }

        return {
            birth_details: {
                date: this.birthData.date,
                time: this.birthData.time,
                location: this.birthData.location
            },
            analysis: {
                planetary_positions: this.formatPlanetaryPositions(),
                house_analysis: this.formatHouseAnalysis(),
                strength_analysis: this.formatStrengthAnalysis(),
                sensitive_points: this.formatSensitivePoints()
            },
            recommendations: this.generateRecommendations(),
            timestamp: new Date().toISOString()
        };
    }

    formatPlanetaryPositions() {
        // Implementation of planetary position formatting
        return {};
    }

    formatHouseAnalysis() {
        // Implementation of house analysis formatting
        return {};
    }

    formatStrengthAnalysis() {
        // Implementation of strength analysis formatting
        return {};
    }

    formatSensitivePoints() {
        // Implementation of sensitive point formatting
        return {};
    }

    generateRecommendations() {
        // Implementation of recommendation generation
        return [];
    }
} 