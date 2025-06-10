/**
 * Consolidated Event Bus Service Module
 * Implements a simple pub/sub pattern for application-wide events
 */

class EventBus {
    constructor() {
        this.listeners = new Map();
        this.onceListeners = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event once
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     * @returns {Function} Unsubscribe function
     */
    once(event, callback) {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, new Set());
        }
        this.onceListeners.get(event).add(callback);

        // Return unsubscribe function
        return () => this.off(event, callback, true);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     * @param {boolean} [isOnce=false] - Whether it's a once listener
     */
    off(event, callback, isOnce = false) {
        const listenerMap = isOnce ? this.onceListeners : this.listeners;
        if (listenerMap.has(event)) {
            listenerMap.get(event).delete(callback);
            if (listenerMap.get(event).size === 0) {
                listenerMap.delete(event);
            }
        }
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        // Regular listeners
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }

        // Once listeners
        if (this.onceListeners.has(event)) {
            const callbacks = Array.from(this.onceListeners.get(event));
            this.onceListeners.delete(event);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in once event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Clear all listeners for an event
     * @param {string} [event] - Event name. If not provided, clears all events.
     */
    clear(event) {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
        } else {
            this.listeners.clear();
            this.onceListeners.clear();
        }
    }

    /**
     * Get the number of listeners for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    listenerCount(event) {
        let count = 0;
        if (this.listeners.has(event)) {
            count += this.listeners.get(event).size;
        }
        if (this.onceListeners.has(event)) {
            count += this.onceListeners.get(event).size;
        }
        return count;
    }

    /**
     * Check if an event has any listeners
     * @param {string} event - Event name
     * @returns {boolean} Whether the event has listeners
     */
    hasListeners(event) {
        return this.listenerCount(event) > 0;
    }
}

// Create and export singleton instance
export const eventBus = new EventBus();

// Export class for testing purposes
export { EventBus }; 