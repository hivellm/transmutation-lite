/**
 * Simple logging utility for Transmutation Lite
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  timestamps?: boolean;
}

/**
 * Logger class for debugging and monitoring
 */
export class Logger {
  private level: LogLevel;
  private prefix: string;
  private timestamps: boolean;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.WARN;
    this.prefix = options.prefix ?? '[Transmutation]';
    this.timestamps = options.timestamps ?? false;
  }

  /**
   * Set logging level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get current logging level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Format log message with prefix and timestamp
   */
  private format(level: string, message: string): string {
    const parts: string[] = [];

    if (this.timestamps) {
      parts.push(new Date().toISOString());
    }

    parts.push(this.prefix, `[${level}]`, message);

    return parts.join(' ');
  }

  /**
   * Log debug message
   */
  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.format('DEBUG', message), ...args);
    }
  }

  /**
   * Log info message
   */
  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.format('INFO', message), ...args);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.format('WARN', message), ...args);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.format('ERROR', message), error, ...args);
    }
  }

  /**
   * Create a child logger with a different prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      level: this.level,
      prefix: `${this.prefix}:${prefix}`,
      timestamps: this.timestamps,
    });
  }
}

/**
 * Default logger instance
 */
export const defaultLogger = new Logger({
  level: process.env.TRANSMUTATION_LOG_LEVEL
    ? parseInt(process.env.TRANSMUTATION_LOG_LEVEL, 10)
    : LogLevel.WARN,
  timestamps: process.env.TRANSMUTATION_LOG_TIMESTAMPS === 'true',
});
