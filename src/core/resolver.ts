import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadProjectConfig } from './config.js';
import { loadCaseSections } from './section-loader.js';
import type { ProjectConfig } from '../types/index.js';
import type { CaseSections } from './section-loader.js';

/**
 * Resuelve la ruta de un caso basado en el nombre del proyecto
 * y el nombre del caso. Soporta estas sintaxis:
 * 
 * - "credilink:mi-caso" (proyecto:caso)
 * - "credilink" + "--case mi-caso" (proyecto + flag)
 * - "--path /ruta/al/caso" (ruta directa)
 */
export function resolveCasePaths(
  projectNameOrPath: string,
  caseName?: string
): { project: ProjectConfig; casePaths: string[] } {
  const projectConfig = loadProjectConfig(projectNameOrPath);
  
  if (!projectConfig.basePath) {
    throw new Error(`No se pudo determinar la ruta base del proyecto: ${projectNameOrPath}`);
  }

  const casosDir = join(projectConfig.basePath, 'casos');
  
  if (!existsSync(casosDir)) {
    throw new Error(`No se encontró el directorio de casos: ${casosDir}`);
  }

  let casePaths: string[];

  if (caseName) {
    const specificPath = join(casosDir, caseName);
    if (!existsSync(specificPath)) {
      throw new Error(
        `No se encontró el caso "${caseName}" en el proyecto "${projectConfig.name}".\n` +
        `Buscado en: ${specificPath}`
      );
    }
    casePaths = [specificPath];
  } else {
    casePaths = readdirSync(casosDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => join(casosDir, entry.name));
  }

  return { project: projectConfig, casePaths };
}

/**
 * Carga un caso usando el nuevo formato multi-archivo.
 * Reemplaza el antiguo loadCaseData que usaba manual-usuario.md.
 */
export function loadCaseByPath(caseDir: string): CaseSections {
  return loadCaseSections(caseDir);
}

/**
 * Intenta parsear un string "proyecto:caso" en sus componentes.
 */
export function parseProjectCaseNotation(input: string): { project: string; case?: string } | null {
  const colonIndex = input.indexOf(':');
  
  if (colonIndex === -1) {
    return null;
  }

  const project = input.slice(0, colonIndex);
  const caseName = input.slice(colonIndex + 1);

  if (!project || !caseName) {
    return null;
  }

  return { project, case: caseName };
}
