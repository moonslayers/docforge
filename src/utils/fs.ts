import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Asegura que un directorio existe, creándolo junto con
 * todos sus padres si es necesario.
 * 
 * @param dirPath - Ruta del directorio a asegurar
 */
export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Asegura que el directorio padre de un archivo existe.
 * 
 * @param filePath - Ruta del archivo cuyo directorio padre asegurar
 */
export function ensureDirForFile(filePath: string): void {
  ensureDir(dirname(filePath));
}

/**
 * Obtiene la fecha actual formateada como YYYY-MM-DD.
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Sanitiza un nombre de archivo: reemplaza caracteres
 * problemáticos y espacios.
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_.]/g, '')
    .replace(/-+/g, '-');
}
