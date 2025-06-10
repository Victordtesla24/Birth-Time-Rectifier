type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'unit' | 'integration' | 'e2e';

class Logger {
  private static instance: Logger;
  private isTestEnvironment: boolean;

  private constructor() {
    this.isTestEnvironment = process.env.NODE_ENV === 'test';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(level: LogLevel, message: string, ...args: any[]): void {
    if (this.isTestEnvironment) {
      console.log(`[${level.toUpperCase()}] ${message}`, ...args);
      return;
    }

    switch (level) {
      case 'debug':
        console.debug(message, ...args);
        break;
      case 'info':
        console.info(message, ...args);
        break;
      case 'warn':
        console.warn(message, ...args);
        break;
      case 'error':
        console.error(message, ...args);
        break;
      default:
        console.log(`[${level.toUpperCase()}] ${message}`, ...args);
    }
  }
}

export const logger = Logger.getInstance();
export const testLogger = (level: LogLevel, message: string, ...args: any[]) => {
  logger.log(level, message, ...args);
}; 