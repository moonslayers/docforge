import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mdToPdf } from 'md-to-pdf';
import type { PdfResult, BrandColors, ProjectConfig, CaseData } from '../types/index.js';
import { buildBrandCSS } from './template.js';
import { replacePlaceholders } from './placeholders.js';
import { buildFrontmatter } from './metadata.js';

function parseMargin(marginStr: string): { top: string; right: string; bottom: string; left: string } {
  const parts = marginStr.split(/\s+/);
  const [top = '20mm', right = '15mm', bottom = '20mm', left = '15mm'] = parts;
  return { top, right, bottom, left };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', '..');
const TEMPLATES_DIR = join(ROOT, 'templates');
const DEFAULT_CSS = join(TEMPLATES_DIR, 'pdf-style.css');

/**
 * Genera un PDF a partir de un caso de uso.
 * 
 * @param projectConfig - Configuración del proyecto
 * @param caseData - Datos del caso (markdown + frontmatter)
 * @param options - Opciones de generación
 * @returns Resultado de la generación del PDF
 */
export async function generatePdf(
  projectConfig: ProjectConfig,
  caseData: CaseData,
  options: { output?: string; css?: string } = {}
): Promise<PdfResult> {
  const caseDir = dirname(caseData.path);
  const caseName = basename(caseDir);

  try {
    // 1. Construir metadata combinada
    const frontmatter = buildFrontmatter(projectConfig, caseData);

    // 2. Validar CSS
    const cssPath = options.css 
      ? resolve(options.css)
      : existsSync(DEFAULT_CSS) 
        ? DEFAULT_CSS 
        : null;

    // 3. Definir nombre de salida
    const outputName = `manual-${caseName}.pdf`;
    const outputPath = options.output 
      ? resolve(options.output, outputName)
      : join(caseDir, outputName);

    // 4. Reemplazar placeholders {{...}} en el contenido
    const finalContent = replacePlaceholders(caseData.raw, projectConfig, caseData.frontmatter);

    // 5. Generar CSS con brand colors
    const brandCSS = buildBrandCSS(projectConfig.brand);

    // 6. Convertir a PDF
    const pdf = await mdToPdf(
      { content: finalContent, path: caseData.path },
      {
        dest: outputPath,
        stylesheet: cssPath ? [cssPath] : undefined,
        css: brandCSS || undefined,
        pdf_options: {
          format: (projectConfig.pdf?.page_size as 'A4') || 'A4',
          margin: parseMargin(projectConfig.pdf?.margins || '20mm 15mm 20mm 15mm'),
          printBackground: true,
        },
        launch_options: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      }
    );

    const filename = pdf?.filename || outputPath;

    return {
      filename,
      success: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      filename: '',
      success: false,
      error: message,
    };
  }
}

/**
 * Genera PDFs para múltiples casos de un proyecto.
 */
export async function generateAllPdfs(
  projectConfig: ProjectConfig,
  cases: CaseData[],
  options: { output?: string; css?: string } = {}
): Promise<PdfResult[]> {
  const results: PdfResult[] = [];

  for (const caseData of cases) {
    console.log(`  📄 Generando: ${basename(dirname(caseData.path))}...`);
    const result = await generatePdf(projectConfig, caseData, options);
    results.push(result);

    if (result.success) {
      console.log(`     ✅ ${result.filename}`);
    } else {
      console.error(`     ❌ ${result.error}`);
    }
  }

  return results;
}

export { buildBrandCSS };
