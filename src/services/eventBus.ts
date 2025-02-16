type EventHandler = (...args: any[]) => void;

export class EventBus {
    private events: Map<string, EventHandler[]>;

    constructor() {
        this.events = new Map();
    }

    on(event: string, callback: EventHandler) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(callback);

        // Return unsubscribe function
        return () => {
            const handlers = this.events.get(event);
            if (handlers) {
                const index = handlers.indexOf(callback);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        };
    }

    off(event: string, callback: EventHandler) {
        const handlers = this.events.get(event);
        if (handlers) {
            const index = handlers.indexOf(callback);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    emit(event: string, ...args: any[]) {
        const handlers = this.events.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(...args));
        }
    }

    clear() {
        this.events.clear();
    }
} 