import { WorkflowOrchestrator } from './workflow.js';
import { AnimationController, ApiClient, VisualizationManager, CONFIG, utils, EventBus } from './modules.js';

// Form validation utilities
const validateBirthData = (formData) => {
    const errors = [];
    if (!formData) {
        return ['Form data is required'];
    }

    const requiredFields = ['birthDate', 'approximateTime', 'birthPlace'];
    
    for (const field of requiredFields) {
        if (!formData.get(field)) {
            errors.push(`${field} is required`);
        }
    }
    
    return errors;
};

// Dummy implementation for testing UI/UX interactions
class FormManager {
    constructor() {
        this.hoverStates = {};
        this.errorMessages = {};
        this.loading = false;
        this.currentStep = 1;
        this.totalSteps = 3;
        this.loadingProgress = 0;
        this.isValid = false;
        // Assume ApiClient is imported from modules.js
        this.api = new ApiClient();
        // Listen to EventBus for progress updates
        EventBus.on('calculation-progress', (progress) => {
            this.loadingProgress = progress / 100;
        });
        
        // Add form submit handler
        const form = document.getElementById('rectificationForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                try {
                    await this.submitForm(formData);
                } catch (error) {
                    const errorMessage = document.querySelector('.error-message');
                    if (errorMessage) {
                        errorMessage.style.display = 'block';
                        errorMessage.textContent = error.message;
                    }
                }
            });
        }
    }

    draw() {
        if (global.rect) global.rect(10, 10, 100, 50);
        if (global.text) global.text('Form', 20, 20);
        if (global.circle) global.circle(50, 50, 20);
        if (global.line) global.line(0, 0, 30, 30);
        if (global.rotate) global.rotate(0.5);
        // draw any error messages
        Object.keys(this.errorMessages).forEach(field => {
            if (global.text) global.text('Error: ' + this.errorMessages[field], 30, 30);
        });
    }

    setHoverState(element, state) {
        this.hoverStates[element] = state;
        if (global.fill) global.fill(state ? '#FF0000' : '#000000');
    }

    toggleCalendar() {
        if (global.rect) global.rect(0, 0, 50, 20);
        if (global.text) global.text('Calendar', 60, 60);
    }

    toggleClock() {
        if (global.circle) global.circle(100, 100, 30);
        if (global.line) global.line(100, 100, 120, 120);
    }

    startLoading() {
        this.loading = true;
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }
        if (global.circle) global.circle(150, 150, 40);
        if (global.rotate) global.rotate(0.75);
    }

    stopLoading() {
        this.loading = false;
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }

    showError(field, message) {
        this.errorMessages[field] = message;
        if (global.text) global.text('Error: ' + message, 0, 0);
    }

    // New method to validate required fields (dummy implementation)
    validateCurrentStep() {
        const birthDateElem = document.querySelector('[name="birthDate"]');
        if (!birthDateElem) return true;
        return birthDateElem.value.trim().length > 0;
    }

    // New method to handle navigation between steps
    navigate(direction) {
        if (direction === 'next') {
            if (this.validateCurrentStep()) {
                this.currentStep++;
            }
        } else if (direction === 'prev') {
            if (this.currentStep > 1) {
                this.currentStep--;
            }
        }
    }

    // New method to add an event card
    addEventCard() {
        const container = document.getElementById('eventsContainer');
        if (container) {
            const card = document.createElement('div');
            card.className = 'eventCard';
            // Create a remove button and attach click handler to remove the card
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-event';
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => {
                card.remove();
            });
            card.appendChild(removeBtn);
            container.appendChild(card);
        }
    }

    // Updated method to update progress bar
    updateProgress() {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const progress = Math.floor((this.currentStep / this.totalSteps) * 100);
            progressBar.style = progressBar.style || {};
            progressBar.style.width = `${progress}%`;
        }
    }

    // Add a validate method to FormManager
    validate(formData) {
        const errors = validateBirthData(formData);
        this.isValid = errors.length === 0;
        this.errorMessages = errors;
        return errors;
    }

    // Add a handleError method to FormManager
    handleError(error) {
        this.errors = this.errors || {};
        this.errors.submission = error.message;
    }

    // Updated method to update submitForm method
    async submitForm(formData) {
        try {
            const errors = this.validate(formData);
            if (errors.length > 0) {
                const errorMessage = document.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = errors.join(', ');
                }
                throw new Error('Form validation failed');
            }

            this.startLoading();
            const response = await this.api.submitBirthData({
                birthDate: formData.get('birthDate'),
                approximateTime: formData.get('approximateTime'),
                birthPlace: formData.get('birthPlace'),
                timeUncertainty: formData.get('timeUncertainty')
            });

            this.stopLoading();
            return response;
        } catch (error) {
            this.stopLoading();
            const errorMessage = document.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.style.display = 'block';
                errorMessage.textContent = error.message;
            }
            throw error;
        }
    }
}

export { FormManager };
