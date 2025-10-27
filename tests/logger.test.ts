import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LogLevel } from '../src/logger.js';

describe('Logger', () => {
  let consoleDebugSpy: any;
  let consoleInfoSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('log levels', () => {
    it('should log at DEBUG level', () => {
      const logger = new Logger({ level: LogLevel.DEBUG });

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleDebugSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log at INFO level', () => {
      const logger = new Logger({ level: LogLevel.INFO });

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log at WARN level', () => {
      const logger = new Logger({ level: LogLevel.WARN });

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log at ERROR level', () => {
      const logger = new Logger({ level: LogLevel.ERROR });

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should not log at NONE level', () => {
      const logger = new Logger({ level: LogLevel.NONE });

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('formatting', () => {
    it('should include default prefix', () => {
      const logger = new Logger({ level: LogLevel.INFO });
      logger.info('test message');

      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toContain('[Transmutation]');
    });

    it('should include custom prefix', () => {
      const logger = new Logger({
        level: LogLevel.INFO,
        prefix: '[CustomPrefix]',
      });
      logger.info('test message');

      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toContain('[CustomPrefix]');
    });

    it('should include timestamps when enabled', () => {
      const logger = new Logger({
        level: LogLevel.INFO,
        timestamps: true,
      });
      logger.info('test message');

      const call = consoleInfoSpy.mock.calls[0][0];
      // Should start with ISO timestamp
      expect(call).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include log level', () => {
      const logger = new Logger({ level: LogLevel.INFO });
      logger.info('test message');

      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toContain('[INFO]');
    });
  });

  describe('level management', () => {
    it('should get and set log level', () => {
      const logger = new Logger({ level: LogLevel.WARN });

      expect(logger.getLevel()).toBe(LogLevel.WARN);

      logger.setLevel(LogLevel.DEBUG);
      expect(logger.getLevel()).toBe(LogLevel.DEBUG);
    });
  });

  describe('child logger', () => {
    it('should create child with combined prefix', () => {
      const parent = new Logger({
        level: LogLevel.INFO,
        prefix: '[Parent]',
      });
      const child = parent.child('Child');

      child.info('test message');

      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.mock.calls[0][0];
      expect(call).toContain('[Parent]:Child');
    });

    it('should inherit log level from parent', () => {
      const parent = new Logger({ level: LogLevel.ERROR });
      const child = parent.child('Child');

      child.info('should not log');
      child.error('should log');

      expect(consoleInfoSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('additional arguments', () => {
    it('should pass additional arguments to console', () => {
      const logger = new Logger({ level: LogLevel.INFO });
      const obj = { key: 'value' };
      const arr = [1, 2, 3];

      logger.info('message', obj, arr);

      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.anything(), obj, arr);
    });

    it('should include error object in error logs', () => {
      const logger = new Logger({ level: LogLevel.ERROR });
      const error = new Error('test error');

      logger.error('something failed', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.anything(), error);
    });
  });
});
