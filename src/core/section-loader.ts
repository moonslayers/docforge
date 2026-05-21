/**
 * docforge — Section Loader
 * 
 * Lee la nueva estructura multi-archivo de casos:
 * - cover.md: portada personalizada (opcional)
 * - NN-*.md: secciones ordenadas por prefijo numérico (ej: 01-requisitos.md)
 * 
 * Extrae automáticamente los títulos ## para generar el índice.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import matter from 'gray-matter';

/**
 * Información de una sección individual.
 */
export interface SectionInfo {
  /** Nombre del archivo (ej: "01-requisitos.md") */
  fileName: string;
  /** Ruta absoluta al archivo */
  filePath: string;
  /** Título extraído del primer ## del contenido */
  title: string;
  /** Contenido markdown sin frontmatter */
  content: string;
  /** Frontmatter YAML parseado (si tiene) */
  frontmatter: Record<string, unknown>;
  /** Jerarquía numérica derivada del prefijo del archivo.
   *  Ej: "01-intro.md" → [1], "01.01-sub.md" → [1, 1], "01.02.01-det.md" → [1, 2, 1] */
  order: number[];
  /** Profundidad/nivel jerárquico (order.length) */
  depth: number;
}

/**
 * Resultado de cargar un caso completo.
 */
export interface CaseSections {
  /** Portada personalizada (opcional) */
  cover: SectionInfo | null;
  /** Secciones ordenadas por prefijo numérico */
  sections: SectionInfo[];
  /** Directorio del caso */
  caseDir: string;
}

/**
 * Extrae el prefijo jerárquico de un nombre de archivo.
 * Ej: "01-intro.md" → [1]
 *     "01.01-sub.md" → [1, 1]
 *     "01.02.01-detalle.md" → [1, 2, 1]
 *     "cover.md" → [999]
 */
function extractOrder(fileName: string): number[] {
  const match = fileName.match(/^(\d+(?:\.\d+)*)/);
  if (!match) return [999];
  return match[1].split('.').map(Number);
}

/**
 * Extrae el primer título ## del contenido markdown.
 * Busca el primer `## texto` y devuelve el texto limpio.
 */
function extractTitle(content: string): string {
  const match = content.match(/^##\s+(.+)$/m);
  return match ? match[1].trim() : basename(content).replace('.md', '');
}

/**
 * Lee un archivo markdown y parsea su frontmatter.
 */
function readSectionFile(filePath: string, fileName: string): SectionInfo {
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = matter(raw);
  const order = extractOrder(fileName);

  return {
    fileName,
    filePath,
    title: parsed.data?.section_title as string || extractTitle(parsed.content),
    content: parsed.content,
    frontmatter: parsed.data as Record<string, unknown> || {},
    order,
    depth: order.length,
  };
}

/**
 * Lee la estructura multi-archivo de un caso.
 * 
 * @param caseDir - Ruta al directorio del caso
 * @returns Las secciones encontradas
 * @throws Error si no hay archivos .md en el directorio
 */
export function loadCaseSections(caseDir: string): CaseSections {
  if (!existsSync(caseDir)) {
    throw new Error(`El directorio del caso no existe: ${caseDir}`);
  }

  const files = readdirSync(caseDir)
    .filter(f => f.endsWith('.md'))
    .sort(); // Orden alfabético respeta prefijos numéricos

  if (files.length === 0) {
    throw new Error(
      `No se encontraron archivos .md en: ${caseDir}\n` +
      `Un caso debe contener al menos un archivo NN-nombre.md`
    );
  }

  let cover: SectionInfo | null = null;
  const sections: SectionInfo[] = [];

  for (const file of files) {
    const filePath = join(caseDir, file);

    if (file === 'cover.md') {
      cover = readSectionFile(filePath, file);
    } else {
      sections.push(readSectionFile(filePath, file));
    }
  }

  // Sort numérico por jerarquía para garantizar orden correcto
  // más robusto que el sort alfabético (tolera padding inconsistente)
  sections.sort((a, b) => {
    const maxLen = Math.max(a.order.length, b.order.length);
    for (let i = 0; i < maxLen; i++) {
      const aVal = a.order[i] ?? -1;
      const bVal = b.order[i] ?? -1;
      if (aVal !== bVal) return aVal - bVal;
    }
    return 0;
  });

  if (sections.length === 0) {
    throw new Error(
      `No se encontraron secciones (NN-*.md) en: ${caseDir}\n` +
      `Debe haber al menos un archivo como "01-introduccion.md"`
    );
  }

  return {
    cover,
    sections,
    caseDir,
  };
}
