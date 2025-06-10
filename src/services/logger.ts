type LogLevel = 'info' | 'error' | 'warn' | 'debug';

class Logger {
    private logToConsole(level: LogLevel, module: string, message: string, error?: Error) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`;
        
        if (error) {
            console[level](logMessage, error);
        } else {
            console[level](logMessage);
        }
    }

    info(module: string, message: string) {
        this.logToConsole('info', module, message);
    }

    error(module: string, message: string, error?: Error) {
        this.logToConsole('error', module, message, error);
    }

    warn(module: string, message: string) {
        this.logToConsole('warn', module, message);
    }

    debug(module: string, message: string) {
        this.logToConsole('debug', module, message);
    }
}

export const logger = new Logger(); 