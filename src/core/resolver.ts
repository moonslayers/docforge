import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, join, basename, dirname } from 'node:path';
import { loadProjectConfig } from './config.js';
import type { ProjectConfig, CaseData, CaseMetadata } from '../types/index.js';
import matter from 'gray-matter';

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
 * Carga los datos de un caso desde su directorio.
 * Busca manual-usuario.md dentro del directorio.
 */
export function loadCaseData(caseDir: string): CaseData {
  const manualPath = join(caseDir, 'manual-usuario.md');
  
  if (!existsSync(manualPath)) {
    throw new Error(
      `No se encontró manual-usuario.md en: ${caseDir}\n` +
      `Cada caso debe contener un archivo manual-usuario.md`
    );
  }

  const raw = readFileSync(manualPath, 'utf-8');
  const parsed = matter(raw);

  return {
    frontmatter: (parsed.data || {}) as CaseMetadata,
    content: parsed.content,
    raw,
    path: manualPath,
  };
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
