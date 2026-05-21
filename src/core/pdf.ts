import { existsSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mdToPdf } from 'md-to-pdf';
import type { PdfResult, ProjectConfig } from '../types/index.js';
import type { CaseSections, SectionInfo } from './section-loader.js';
import { buildBrandCSS } from './template.js';
import { replacePlaceholders } from './placeholders.js';
import { buildFrontmatter } from './metadata.js';

function parseMargin(marginStr: string): { top: string; right: string; bottom: string; left: string } {
  const parts = marginStr.split(/\s+/);
  const [top = '20mm', right = '15mm', bottom = '20mm', left = '15mm'] = parts;
  return { top, right, bottom, left };
}

/**
 * Genera un anchor único para una sección usando su jerarquía + título.
 * Ej: order [1, 1], title "Requisitos" → "1-1-requisitos"
 */
function buildAnchor(section: { order: number[]; title: string }): string {
  const prefix = section.order.join('-');
  const slug = section.title
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${prefix}-${slug}`;
}

/**
 * Determina si una sección debe comenzar en una página nueva.
 *
 * Orden de precedencia:
 * 1. frontmatter.page_break = true  → fuerza page break
 * 2. frontmatter.page_break = false → suprime page break
 * 3. section.depth está en page_break_levels (default: [1]) → page break
 * 4. Sino → no page break
 */
function shouldBreakBefore(section: SectionInfo, projectConfig: ProjectConfig): boolean {
  // 1. Override explícito por frontmatter
  const fmPageBreak = section.frontmatter?.['page_break'];
  if (fmPageBreak === true) return true;
  if (fmPageBreak === false) return false;

  // 2. Configuración por niveles
  const breakLevels = projectConfig.pdf?.page_break_levels ?? [1];
  return breakLevels.includes(section.depth);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', '..');
const TEMPLATES_DIR = join(ROOT, 'templates');
const DEFAULT_CSS = join(TEMPLATES_DIR, 'pdf-style.css');

/**
 * Genera el HTML de la portada automática.
 * Se usa cuando no existe cover.md en el caso.
 */
function generateCoverHtml(
  projectConfig: ProjectConfig,
  caseMeta: Record<string, unknown>,
  caseName: string
): string {
  const title = (caseMeta.case_title as string) || caseName;
  const subtitle = (caseMeta.manual_subtitle as string) || 'Manual de Usuario';
  const version = (caseMeta.case_version as string) || projectConfig.version || '1.0';
  const date = (caseMeta.case_date as string) || new Date().toISOString().split('T')[0];
  const author = (caseMeta.case_author as string) || projectConfig.pdf?.author || 'Equipo de Documentación';
  const status = (caseMeta.case_status as string) || projectConfig.pdf?.status || 'Borrador';

  return `<div class="cover-page">

<h1>${projectConfig.full_name || projectConfig.name}</h1>

<p class="subtitle">${subtitle}</p>

<h1>${title}</h1>

<p class="meta">
  Versión: ${version} | Fecha: ${date} | Estado: ${status}<br>
  ${author}
</p>

</div>

<div style="page-break-before: always;"></div>`;
}

/**
 * Genera el índice a partir de los títulos de las secciones.
 */
function generateTocHtml(sections: SectionInfo[]): string {
  if (sections.length === 0) return '';

  let toc = '<div class="toc">\n\n## Índice\n\n';
  
  for (const section of sections) {
    const level = section.depth;
    const numberStr = section.order.join('.');
    const anchor = buildAnchor(section);
    toc += `<p class="toc-level-${level}"><a href="#${anchor}">${numberStr}. ${section.title}</a></p>\n`;
  }

  toc += '\n</div>\n\n<div style="page-break-before: always;"></div>\n\n';
  return toc;
}

/**
 * Extrae los metadatos del caso desde las secciones.
 * Prioridad: cover frontmatter > primera sección frontmatter > defaults
 */
function extractCaseMetadata(sections: CaseSections): Record<string, unknown> {
  const coverMeta = sections.cover?.frontmatter || {};
  const firstSectionMeta = sections.sections[0]?.frontmatter || {};

  return { ...firstSectionMeta, ...coverMeta };
}

/**
 * Genera un PDF a partir de un caso multi-archivo.
 * 
 * @param projectConfig - Configuración del proyecto
 * @param caseSections - Secciones del caso (cover + NN-*.md)
 * @param options - Opciones de generación
 * @returns Resultado de la generación del PDF
 */
export async function generatePdf(
  projectConfig: ProjectConfig,
  caseSections: CaseSections,
  options: { output?: string; css?: string } = {}
): Promise<PdfResult> {
  const caseDir = caseSections.caseDir;
  const caseName = basename(caseDir);

  try {
    // 1. Extraer metadatos del caso
    const caseMeta = extractCaseMetadata(caseSections);
    buildFrontmatter(projectConfig, { frontmatter: caseMeta, content: '', raw: '', path: '' });

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

    // 4. Construir el contenido completo del PDF
    let fullContent = '';

    // 4a. Portada
    if (caseSections.cover) {
      // Usar cover.md personalizado
      fullContent += replacePlaceholders(caseSections.cover.content, projectConfig, caseMeta);
      fullContent += '\n\n<div style="page-break-before: always;"></div>\n\n';
    } else {
      // Generar portada automática
      fullContent += generateCoverHtml(projectConfig, caseMeta, caseName);
    }

    // 4b. Índice generado automáticamente
    fullContent += generateTocHtml(caseSections.sections);

    // 4c. Secciones con saltos de página inteligentes
    for (let i = 0; i < caseSections.sections.length; i++) {
      const section = caseSections.sections[i];
      let sectionContent = section.content;

      // Prepender numbering jerárquico al primer heading ## (si no lo tiene ya)
      const numbering = section.order.join('.');
      sectionContent = sectionContent.replace(
        /^(##\s+)(.*)$/m,
        (match, headingMark, headingText) => {
          // Evitar duplicar si ya tiene el numbering
          if (headingText.startsWith(numbering + ' ')) return match;
          return `${headingMark}${numbering} ${headingText}`;
        }
      );

      // Aplicar placeholders al contenido de la sección
      sectionContent = replacePlaceholders(sectionContent, projectConfig, caseMeta);

      fullContent += sectionContent;

      // Salto de página condicional: solo si la SIGUIENTE sección debe empezar en página nueva
      if (i < caseSections.sections.length - 1) {
        const nextSection = caseSections.sections[i + 1];
        if (shouldBreakBefore(nextSection, projectConfig)) {
          fullContent += '\n\n<div style="page-break-before: always;"></div>\n\n';
        }
      }
    }

    // 5. Generar CSS con brand colors
    const brandCSS = buildBrandCSS(projectConfig.brand);

    // 6. Convertir a PDF
    const pdf = await mdToPdf(
      { content: fullContent },
      {
        dest: outputPath,
        basedir: caseDir,
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
  cases: CaseSections[],
  options: { output?: string; css?: string } = {}
): Promise<PdfResult[]> {
  const results: PdfResult[] = [];

  for (const caseSections of cases) {
    console.log(`  📄 Generando: ${basename(caseSections.caseDir)}...`);
    const result = await generatePdf(projectConfig, caseSections, options);
    results.push(result);

    if (result.success) {
      console.log(`     ✅ ${result.filename}`);
    } else {
      console.error(`     ❌ ${result.error}`);
    }
  }

  return results;
}
