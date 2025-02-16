/**
 * Consolidated Workflow Service Module
 * Combines workflow management and form handling functionality
 */

import { apiService } from './api';
import { eventBus } from './eventBus';
import { logger } from '../../shared/utils/logger';

export class WorkflowService {
    constructor() {
        this.currentStep = 'initial';
        this.workflowData = null;
        this.formValidators = new Map();
        this.formData = new Map();
    }

    // Workflow Management
    async startWorkflow(birthData) {
        try {
            // Validate birth data
            const validationResult = await this.validateBirthData(birthData);
            if (!validationResult.isValid) {
                throw new Error(validationResult.errors.join(', '));
            }

            // Start rectification process
            const response = await apiService.startRectification(birthData);
            
            this.workflowData = {
                ...response,
                birthData
            };

            this.currentStep = 'questionnaire';
            eventBus.emit('workflow-step-changed', this.currentStep);
            
            return this.workflowData;
        } catch (error) {
            logger.error('Error starting workflow:', error);
            throw error;
        }
    }

    async processLifeEvents(events) {
        try {
            const response = await apiService.analyzeLifeEvents(events);
            
            this.workflowData = {
                ...this.workflowData,
                lifeEvents: events,
                analysis: response
            };

            this.currentStep = 'analysis';
            eventBus.emit('workflow-step-changed', this.currentStep);
            
            return response;
        } catch (error) {
            logger.error('Error processing life events:', error);
            throw error;
        }
    }

    async submitQuestionnaire(responses) {
        try {
            const response = await apiService.submitQuestionnaire(responses);
            
            this.workflowData = {
                ...this.workflowData,
                questionnaireResponses: responses,
                results: response
            };

            this.currentStep = 'results';
            eventBus.emit('workflow-step-changed', this.currentStep);
            
            return response;
        } catch (error) {
            logger.error('Error submitting questionnaire:', error);
            throw error;
        }
    }

    // Form Management
    registerFormValidator(formId, validator) {
        this.formValidators.set(formId, validator);
    }

    unregisterFormValidator(formId) {
        this.formValidators.delete(formId);
    }

    validateForm(formId, formData) {
        const validator = this.formValidators.get(formId);
        if (!validator) {
            return { isValid: true, errors: [] };
        }

        return validator(formData);
    }

    validateBirthData(data) {
        const errors = [];
        
        // Birth Date validation
        if (!data.date) {
            errors.push('Birth date is required');
        } else {
            const date = new Date(data.date);
            if (isNaN(date.getTime())) {
                errors.push('Invalid birth date');
            }
        }

        // Birth Time validation
        if (!data.time) {
            errors.push('Birth time is required');
        } else {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(data.time)) {
                errors.push('Invalid birth time format (HH:MM)');
            }
        }

        // Location validation
        if (!data.location) {
            errors.push('Birth location is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validateLifeEvent(event) {
        const errors = [];

        if (!event.type) {
            errors.push('Event type is required');
        }

        if (!event.date) {
            errors.push('Event date is required');
        } else {
            const date = new Date(event.date);
            if (isNaN(date.getTime())) {
                errors.push('Invalid event date');
            }
        }

        if (!event.description) {
            errors.push('Event description is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Form Data Management
    setFormData(formId, data) {
        this.formData.set(formId, data);
        eventBus.emit('form-data-changed', { formId, data });
    }

    getFormData(formId) {
        return this.formData.get(formId);
    }

    clearFormData(formId) {
        this.formData.delete(formId);
        eventBus.emit('form-data-changed', { formId, data: null });
    }

    // Workflow State Management
    getCurrentStep() {
        return this.currentStep;
    }

    getWorkflowData() {
        return this.workflowData;
    }

    resetWorkflow() {
        this.currentStep = 'initial';
        this.workflowData = null;
        this.formData.clear();
        eventBus.emit('workflow-reset');
    }

    // Event Handlers
    onStepChange(callback) {
        return eventBus.on('workflow-step-changed', callback);
    }

    onFormDataChange(callback) {
        return eventBus.on('form-data-changed', callback);
    }

    onWorkflowReset(callback) {
        return eventBus.on('workflow-reset', callback);
    }
}

// Create and export singleton instance
export const workflowService = new WorkflowService(); 