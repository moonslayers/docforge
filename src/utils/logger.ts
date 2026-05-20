import type { LogLevel } from '../types/index.js';

/**
 * Iconos para cada nivel de log.
 */
const ICONS: Record<LogLevel, string> = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  success: '✅',
  debug: '🔍',
};

/**
 * Logger simple con formato consistente para docforge.
 */
export const logger = {
  log(level: LogLevel, message: string, ...args: unknown[]): void {
    const icon = ICONS[level] || '';
    const prefix = level.toUpperCase();
    const timestamp = new Date().toISOString().split('T')[1]?.split('.')[0] || '';

    switch (level) {
      case 'error':
        console.error(`[${timestamp}] ${icon} ${prefix}: ${message}`, ...args);
        break;
      case 'warn':
        console.warn(`[${timestamp}] ${icon} ${prefix}: ${message}`, ...args);
        break;
      case 'debug':
        if (process.env.DEBUG) {
          console.debug(`[${timestamp}] ${icon} ${prefix}: ${message}`, ...args);
        }
        break;
      default:
        console.log(`  ${icon} ${message}`, ...args);
    }
  },

  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  },

  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  },

  error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args);
  },

  success(message: string, ...args: unknown[]): void {
    this.log('success', message, ...args);
  },

  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  },

  /**
   * Imprime una línea separadora.
   */
  separator(): void {
    console.log('═══════════════════════════════════════════════');
  },

  /**
   * Imprime el header de docforge.
   */
  header(): void {
    console.log('');
    this.separator();
    console.log('  docforge — Generador de Manuales PDF');
    this.separator();
    console.log('');
  },
};
