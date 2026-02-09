/**
 * Logger Utility
 * 
 * Structured logging for the application.
 * In production, this could be replaced with Pino or similar.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const CURRENT_LEVEL: LogLevel =
    (process.env.LOG_LEVEL as LogLevel) ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL];
}

function formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

export const logger = {
    debug(message: string, context?: LogContext): void {
        if (shouldLog('debug')) {
            console.log(formatMessage('debug', message, context));
        }
    },

    info(message: string, context?: LogContext): void {
        if (shouldLog('info')) {
            console.info(formatMessage('info', message, context));
        }
    },

    warn(message: string, context?: LogContext): void {
        if (shouldLog('warn')) {
            console.warn(formatMessage('warn', message, context));
        }
    },

    error(message: string, context?: LogContext): void {
        if (shouldLog('error')) {
            console.error(formatMessage('error', message, context));
        }
    },

    /**
     * Log an error with stack trace.
     */
    exception(error: Error, context?: LogContext): void {
        this.error(error.message, {
            ...context,
            name: error.name,
            stack: error.stack,
        });
    },

    /**
     * Create a child logger with preset context.
     */
    child(baseContext: LogContext) {
        return {
            debug: (message: string, context?: LogContext) =>
                logger.debug(message, { ...baseContext, ...context }),
            info: (message: string, context?: LogContext) =>
                logger.info(message, { ...baseContext, ...context }),
            warn: (message: string, context?: LogContext) =>
                logger.warn(message, { ...baseContext, ...context }),
            error: (message: string, context?: LogContext) =>
                logger.error(message, { ...baseContext, ...context }),
            exception: (error: Error, context?: LogContext) =>
                logger.exception(error, { ...baseContext, ...context }),
        };
    },
};

// Pre-configured loggers for common use cases
export const chatLogger = logger.child({ service: 'chat' });
export const adminLogger = logger.child({ service: 'admin' });
export const dbLogger = logger.child({ service: 'database' });
