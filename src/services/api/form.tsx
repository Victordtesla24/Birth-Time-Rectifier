export class FormManager {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 3;
    this.formData = {};
    this.eventBus = null;
    this.loading = false;
  }

  validateCurrentStep() {
    const form = document.getElementById('birthForm');
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required]');
    return Array.from(inputs).every(input => input.value.trim() !== '');
  }

  navigate(direction) {
    if (direction === 'next' && this.currentStep < this.totalSteps) {
      if (this.validateCurrentStep()) {
        this.currentStep++;
        this.updateProgress();
      }
    } else if (direction === 'prev' && this.currentStep > 1) {
      this.currentStep--;
      this.updateProgress();
    }
  }

  addEventCard() {
    const eventsContainer = document.getElementById('eventsContainer');
    if (!eventsContainer) return;

    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    eventCard.innerHTML = `
      <input type="text" class="event-description" placeholder="Event description">
      <input type="date" class="event-date">
      <input type="time" class="event-time">
      <button type="button" class="remove-event">Remove</button>
    `;

    eventCard.querySelector('.remove-event').addEventListener('click', () => {
      eventCard.remove();
    });

    eventsContainer.appendChild(eventCard);
  }

  async submitForm(formData) {
    try {
      this.loading = true;
      this.startLoading();
      // Form submission logic would go here
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      this.stopLoading();
      this.loading = false;
    }
  }

  updateProgress() {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;
    
    const progress = Math.round((this.currentStep / this.totalSteps) * 100);
    const progressPercentage = `${progress}%`;
    
    // Use setAttribute for width to ensure compatibility
    progressBar.setAttribute('style', `width: ${progressPercentage}`);
    progressBar.setAttribute('aria-valuenow', progress.toString());
  }

  startLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.remove('hidden');
    }
  }

  stopLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }
}
