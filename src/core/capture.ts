/**
 * docforge — Capture Orchestration
 *
 * Coordina la detección de archivos HTML en un caso, la llamada al
 * renderizador Puppeteer y el guardado de las imágenes resultantes.
 */

import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { captureElement } from './renderer.js';
import { ensureDir } from '../utils/fs.js';
import { resolveCasePaths } from './resolver.js';

import { logger } from '../utils/logger.js';
import type { RenderResult } from '../types/index.js';

/**
 * Renderiza todos los archivos HTML de un caso a imágenes PNG.
 *
 * @param caseDir - Ruta absoluta al directorio del caso
 * @param options - Opciones de renderizado (padding, scale, bgColor, css, strict, debug)
 * @returns Array de resultados de renderizado
 */
export async function renderCaseHtmls(
  caseDir: string,
  options?: { padding?: string; scale?: number; bgColor?: string; css?: string; strict?: boolean; debug?: boolean }
): Promise<RenderResult[]> {
  const htmlDir = join(caseDir, 'html');

  if (!existsSync(htmlDir)) {
    return [];
  }

  const files = readdirSync(htmlDir);
  const htmlFiles = files.filter(f => f.endsWith('.html') || f.endsWith('.htm'));

  if (htmlFiles.length === 0) {
    return [];
  }

  const imagesDir = join(caseDir, 'images');
  ensureDir(imagesDir);

  const results: RenderResult[] = [];

  for (const file of htmlFiles) {
    const htmlFilePath = join(htmlDir, file);
    const baseName = basename(file, extname(file));
    const imageFileName = `${baseName}.png`;
    const imageFilePath = join(imagesDir, imageFileName);

    try {
      const captureResult = await captureElement(htmlFilePath, {
        padding: options?.padding,
        scale: options?.scale,
        bgColor: options?.bgColor,
        css: options?.css,
        strict: options?.strict,
      });

      writeFileSync(imageFilePath, captureResult.buffer);

      if (captureResult.warnings.length > 0) {
        for (const warning of captureResult.warnings) {
          logger.warn(`📄 html/${file} → ⚠️  ${warning}`);
        }
      }

      let logMessage = `📄 html/${file} → ✅ images/${imageFileName}`;
      if (captureResult.width && captureResult.height) {
        logMessage += ` (${captureResult.width}x${captureResult.height}px)`;
      }
      logger.info(logMessage);

      results.push({
        htmlFile: htmlFilePath,
        imageFile: imageFilePath,
        success: true,
        dimensions: {
          width: captureResult.width,
          height: captureResult.height,
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`📄 html/${file} → ❌ ${errorMessage}`);

      results.push({
        htmlFile: htmlFilePath,
        imageFile: '',
        success: false,
        error: errorMessage,
      });
    }
  }

  return results;
}

/**
 * Renderiza todos los casos de un proyecto (o un caso específico) a imágenes PNG.
 *
 * @param projectNameOrPath - Nombre o ruta del proyecto
 * @param caseName - Nombre del caso específico (opcional)
 * @param options - Opciones de renderizado y configuración
 * @returns Array de resultados agrupados por nombre de caso
 */
export async function renderProjectCases(
  projectNameOrPath: string,
  caseName?: string,
  options?: { padding?: string; scale?: number; bgColor?: string; css?: string; strict?: boolean; all?: boolean; projectsDir?: string; debug?: boolean }
): Promise<{ caseName: string; results: RenderResult[] }[]> {
  const { casePaths } = resolveCasePaths(projectNameOrPath, caseName);

  const groupedResults: { caseName: string; results: RenderResult[] }[] = [];
  let totalFilesFound = 0;

  for (const casePath of casePaths) {
    const name = basename(casePath);
    const results = await renderCaseHtmls(casePath, options);

    for (const result of results) {
      if (!result.success && result.error) {
        logger.error(`[${name}] ${result.error}`);
      }
    }

    if (results.length > 0) {
      totalFilesFound += results.length;
    }

    groupedResults.push({ caseName: name, results });
  }

  if (totalFilesFound === 0) {
    logger.info('No se encontraron archivos HTML en los casos procesados.');
  }

  return groupedResults;
}
