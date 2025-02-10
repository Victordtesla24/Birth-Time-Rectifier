document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('rectification-form');
    const sections = document.querySelectorAll('.form-section');
    const progressBar = document.querySelector('.progress-bar');
    const resultSection = document.getElementById('result-section');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const resultContent = document.querySelector('.result-content');
    
    let currentStep = 1;
    const totalSteps = sections.length;
    
    // Initialize page transition
    const pageTransition = document.querySelector('.page-transition');
    pageTransition.classList.add('exit');
    
    // Update progress bar
    const updateProgress = () => {
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    };
    
    // Navigation between sections
    const showSection = (step) => {
        sections.forEach(section => {
            section.classList.remove('active');
            if (parseInt(section.dataset.step) === step) {
                section.classList.add('active');
            }
        });
        
        currentStep = step;
        updateProgress();
    };
    
    // Event listeners for navigation buttons
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                showSection(currentStep + 1);
            }
        });
    });
    
    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                showSection(currentStep - 1);
            }
        });
    });
    
    // Add event functionality
    const eventsContainer = document.getElementById('events-container');
    const addEventBtn = document.querySelector('.add-event-btn');
    
    addEventBtn.addEventListener('click', () => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.style.opacity = '0';
        eventCard.style.transform = 'translateY(20px)';
        
        eventCard.innerHTML = `
            <div class="form-group">
                <label for="event-type-${Date.now()}">Event Type</label>
                <select id="event-type-${Date.now()}" name="event-type" required>
                    <option value="">Select an event type</option>
                    <option value="relationship">Relationship</option>
                    <option value="career">Career</option>
                    <option value="health">Health</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label for="event-date-${Date.now()}">Event Date</label>
                <input type="date" id="event-date-${Date.now()}" name="event-date" required>
            </div>
            <div class="form-group">
                <label for="event-description-${Date.now()}">Description</label>
                <textarea id="event-description-${Date.now()}" name="event-description" rows="3" required></textarea>
            </div>
            <button type="button" class="btn secondary remove-event-btn">Remove Event</button>
        `;
        
        eventsContainer.appendChild(eventCard);
        
        // Animate the new event card
        requestAnimationFrame(() => {
            eventCard.style.opacity = '1';
            eventCard.style.transform = 'translateY(0)';
        });
        
        // Add remove event functionality
        const removeBtn = eventCard.querySelector('.remove-event-btn');
        removeBtn.addEventListener('click', () => {
            eventCard.style.opacity = '0';
            eventCard.style.transform = 'translateY(20px)';
            setTimeout(() => eventCard.remove(), 500);
        });
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        resultSection.style.display = 'block';
        loadingSpinner.style.display = 'block';
        resultContent.style.display = 'none';
        
        // Collect form data
        const formData = new FormData(form);
        const events = Array.from(eventsContainer.children).map(card => ({
            type: card.querySelector('select').value,
            date: card.querySelector('input[type="date"]').value,
            description: card.querySelector('textarea').value
        }));
        
        try {
            // Simulate API call (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update results
            document.getElementById('rectified-time').textContent = '3:45 PM';
            document.getElementById('confidence-level').textContent = 'Confidence Level: 85%';
            
            // Show results
            loadingSpinner.style.display = 'none';
            resultContent.style.display = 'block';
            
            // Scroll to results
            resultSection.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error calculating birth time:', error);
            alert('An error occurred while calculating the birth time. Please try again.');
        }
    });
    
    // Add tooltips
    const addTooltip = (element, text) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        element.addEventListener('mouseenter', () => {
            document.body.appendChild(tooltip);
            const rect = element.getBoundingClientRect();
            tooltip.style.top = `${rect.bottom + 10}px`;
            tooltip.style.left = `${rect.left}px`;
            requestAnimationFrame(() => tooltip.classList.add('show'));
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
            setTimeout(() => tooltip.remove(), 500);
        });
    };
    
    // Add tooltips to form elements
    document.querySelectorAll('input, select, textarea').forEach(element => {
        const label = element.previousElementSibling;
        if (label && label.tagName === 'LABEL') {
            addTooltip(element, `Enter your ${label.textContent.toLowerCase()}`);
        }
    });
}); 