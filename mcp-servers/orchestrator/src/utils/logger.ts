/**
 * Logger Utility
 * Provides structured logging for the orchestrator
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private level: LogLevel;
  private context: Record<string, any>;

  constructor(context: Record<string, any> = {}) {
    this.context = context;
    const envLevel = process.env.STARK_LOG_LEVEL?.toUpperCase() || 'INFO';
    this.level = LogLevel[envLevel as keyof typeof LogLevel] || LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = context ? ` ${JSON.stringify({ ...this.context, ...context })}` : '';
    return `[${timestamp}] [${levelName}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context);

    // MCP servers must write logs to stderr, not stdout
    // stdout is reserved for JSON-RPC protocol messages
    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.error(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        if (error) {
          console.error(error.stack);
        }
        break;
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  child(additionalContext: Record<string, any>): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Log proactive response events
   */
  proactive(message: string, context?: Record<string, any>): void {
    const proactiveContext = {
      ...context,
      eventType: 'proactive_response',
    };
    this.log(LogLevel.INFO, `[PROACTIVE] ${message}`, proactiveContext);
  }

  /**
   * Log pattern match events
   */
  patternMatch(message: string, context?: Record<string, any>): void {
    const patternContext = {
      ...context,
      eventType: 'pattern_match',
    };
    this.log(LogLevel.DEBUG, `[PATTERN] ${message}`, patternContext);
  }

  /**
   * Log confidence score events
   */
  confidence(message: string, context?: Record<string, any>): void {
    const confidenceContext = {
      ...context,
      eventType: 'confidence_score',
    };
    this.log(LogLevel.DEBUG, `[CONFIDENCE] ${message}`, confidenceContext);
  }

  /**
   * Log user feedback events
   */
  feedback(message: string, context?: Record<string, any>): void {
    const feedbackContext = {
      ...context,
      eventType: 'user_feedback',
    };
    this.log(LogLevel.INFO, `[FEEDBACK] ${message}`, feedbackContext);
  }
}

// Create default logger instance
export const logger = new Logger();

// Export factory function for creating contextual loggers
export function createLogger(context: Record<string, any>): Logger {
  return new Logger(context);
}

// Made with Bob
