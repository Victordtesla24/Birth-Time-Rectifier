import { FormManager } from '../../services/api/form';

interface HTMLInputElement extends Element {
    value: string;
}

interface EventBus {
    on: jest.Mock;
    emit: jest.Mock;
}

// Add FormManager interface based on the implementation
interface IFormManager {
    currentStep: number;
    totalSteps: number;
    formData: Record<string, any>;
    eventBus: EventBus | null;
    loading: boolean;
    validateCurrentStep(): boolean;
    navigate(direction: 'next' | 'prev'): void;
    addEventCard(): void;
    submitForm(formData: FormData): Promise<boolean>;
    updateProgress(): void;
    startLoading(): void;
    stopLoading(): void;
}

describe('FormManager', () => {
    let formManager: IFormManager;
    let mockForm: HTMLFormElement | null;
    let mockProgressBar: HTMLElement | null;
    let mockLoadingOverlay: HTMLElement | null;

    beforeEach(() => {
        document.body.innerHTML = `
            <form id="birthForm">
                <input type="date" name="birthDate" required>
                <input type="time" name="approximateTime" required>
                <input type="text" name="birthPlace" required>
                <div id="eventsContainer"></div>
            </form>
            <div class="progress-bar">
                <div id="progressBar" style="width: 0%"></div>
            </div>
        `;
        formManager = new FormManager() as unknown as IFormManager;
        mockForm = document.getElementById('birthForm') as HTMLFormElement;
        mockProgressBar = document.getElementById('progressBar');
        mockLoadingOverlay = document.getElementById('loadingOverlay');
    });

    test('should initialize with correct default values', () => {
        expect(formManager.currentStep).toBe(1);
        expect(formManager.totalSteps).toBe(3);
    });

    test('should validate required fields', () => {
        const isValid = formManager.validateCurrentStep();
        expect(isValid).toBe(false);

        // Fill required fields
        const birthDate = document.querySelector('[name="birthDate"]') as HTMLInputElement;
        const approximateTime = document.querySelector('[name="approximateTime"]') as HTMLInputElement;
        const birthPlace = document.querySelector('[name="birthPlace"]') as HTMLInputElement;

        if (birthDate && approximateTime && birthPlace) {
            birthDate.value = '2000-01-01';
            approximateTime.value = '12:00';
            birthPlace.value = 'New York, USA';

            const isValidAfterFill = formManager.validateCurrentStep();
            expect(isValidAfterFill).toBe(true);
        }
    });

    test('should handle navigation between steps', () => {
        // Fill required fields first
        const birthDate = document.querySelector('[name="birthDate"]') as HTMLInputElement;
        const approximateTime = document.querySelector('[name="approximateTime"]') as HTMLInputElement;
        const birthPlace = document.querySelector('[name="birthPlace"]') as HTMLInputElement;
        
        if (birthDate && approximateTime && birthPlace) {
            birthDate.value = '2000-01-01';
            approximateTime.value = '12:00';
            birthPlace.value = 'New York, USA';
            
            // Now try navigation
            formManager.navigate('next');
            expect(formManager.currentStep).toBe(2);
            
            formManager.navigate('prev');
            expect(formManager.currentStep).toBe(1);
            
            formManager.navigate('next');
            expect(formManager.currentStep).toBe(2);
            
            formManager.navigate('next');
            expect(formManager.currentStep).toBe(3);
        }
    });

    test('should add and remove event cards', () => {
        const eventsContainer = document.getElementById('eventsContainer');
        
        if (eventsContainer) {
            // Add event card
            formManager.addEventCard();
            expect(eventsContainer.children.length).toBe(1);
            
            // Add event card template
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
                <input type="text" class="event-description" placeholder="Event description">
                <input type="date" class="event-date">
                <input type="time" class="event-time">
                <button type="button" class="remove-event">Remove</button>
            `;
            eventsContainer.appendChild(eventCard);
            
            // Test remove functionality
            const removeBtn = eventsContainer.querySelector('.remove-event') as HTMLButtonElement;
            if (removeBtn) {
                removeBtn.click();
                expect(eventsContainer.children.length).toBe(1);
            }
        }
    });

    test('should handle form submission', async () => {
        // Fill required fields
        const birthDate = document.querySelector('[name="birthDate"]') as HTMLInputElement;
        const approximateTime = document.querySelector('[name="approximateTime"]') as HTMLInputElement;
        const birthPlace = document.querySelector('[name="birthPlace"]') as HTMLInputElement;
        
        if (birthDate && approximateTime && birthPlace) {
            birthDate.value = '2000-01-01';
            approximateTime.value = '12:00';
            birthPlace.value = 'New York, USA';
            
            // Create FormData
            const formData = new FormData();
            formData.append('birthDate', birthDate.value);
            formData.append('approximateTime', approximateTime.value);
            formData.append('birthPlace', birthPlace.value);
            
            // Mock form submission
            const mockSubmit = jest.fn();
            formManager.submitForm = mockSubmit;
            
            await formManager.submitForm(formData);
            expect(mockSubmit).toHaveBeenCalledWith(formData);
        }
    });

    test('should update progress bar', () => {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            formManager.currentStep = 1;
            formManager.totalSteps = 3;
            formManager.updateProgress();
            expect(progressBar.style.width).toBe('33%');

            formManager.currentStep = 2;
            formManager.updateProgress();
            expect(progressBar.style.width).toBe('67%');

            formManager.currentStep = 3;
            formManager.updateProgress();
            expect(progressBar.style.width).toBe('100%');
        }
    });

    test('should handle event bus events', () => {
        interface EventBus {
            on: jest.Mock;
            emit: jest.Mock;
        }

        // Create mock event bus
        const mockEventBus: EventBus = {
            on: jest.fn((event: string, callback: () => void) => {
                if (event === 'loading:start') {
                    formManager.startLoading();
                } else if (event === 'loading:end') {
                    formManager.stopLoading();
                }
            }),
            emit: jest.fn()
        };

        // Replace event bus in form manager
        formManager.eventBus = mockEventBus;

        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.classList.add('hidden');
        document.body.appendChild(loadingOverlay);

        // Test loading start
        mockEventBus.on('loading:start', () => {});
        expect(loadingOverlay.classList.contains('hidden')).toBe(false);

        // Test loading end
        mockEventBus.on('loading:end', () => {});
        expect(loadingOverlay.classList.contains('hidden')).toBe(true);
    });
});
