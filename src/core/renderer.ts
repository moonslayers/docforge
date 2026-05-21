/**
 * docforge — HTML Element Renderer
 *
 * Utiliza Puppeteer para capturar screenshots de elementos HTML
 * individuales (divs) con padding configurable.
 */

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

// ─── Types ──────────────────────────────────────────────────────

export interface CaptureElementOptions {
  /** Padding alrededor del elemento. CSS-like: "20px", "10px 20px", "10px 5px 15px 20px". Default: "20px" */
  padding?: string;
  /** Device scale factor. Default: 2 (retina) */
  scale?: number;
  /** Color de fondo. Default: "white" */
  bgColor?: string;
  /** Ruta a archivo CSS externo para inyectar */
  css?: string;
  /** Si true, falla cuando se encuentran múltiples divs. Default: false (advierte + captura el primero) */
  strict?: boolean;
}

export interface CaptureElementResult {
  /** Buffer de la imagen PNG */
  buffer: Buffer;
  /** Ancho de la imagen capturada en píxeles */
  width: number;
  /** Alto de la imagen capturada en píxeles */
  height: number;
  /** Advertencias encontradas durante la captura */
  warnings: string[];
}

// ─── Chromium Resolution ───────────────────────────────────────

async function resolveChromiumExecutablePath(): Promise<string> {
  // 1. Try puppeteer (full install)
  try {
    const puppeteer = await import('puppeteer');
    const ep = (puppeteer as any).executablePath;
    if (typeof ep === 'function') {
      return ep();
    }
  } catch {
    // Not installed, continue
  }

  // 2. Try puppeteer-core with known paths
  const candidates = [
    // Puppeteer cache in project
    join(process.cwd(), 'node_modules', 'puppeteer', '.local-chromium'),
    // Home cache
    join(homedir(), '.cache', 'puppeteer'),
    // Common Linux paths
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
  ];

  for (const dir of candidates) {
    if (existsSync(dir)) {
      try {
        // Look for chrome/chromium binary inside
        const entries = readdirSync(dir, { recursive: true, encoding: 'utf-8' });
        const chromeEntry = entries.find((e: string) =>
          /chrome[^/]*$|chromium[^/]*$/.test(e) && !e.includes('_.mount')
        );
        if (chromeEntry) return join(dir, chromeEntry);
      } catch {
        continue;
      }
    }
  }

  throw new Error(
    'No se encontró Chromium. Asegúrate de tener puppeteer instalado:\n' +
    '  npm install puppeteer\n\n' +
    'O instala Chromium en tu sistema.'
  );
}

// ─── Padding Parser ────────────────────────────────────────────

function parsePadding(paddingStr: string): { top: number; right: number; bottom: number; left: number } {
  const parts = paddingStr.trim().split(/\s+/);
  const toPx = (val: string): number => {
    if (val.endsWith('px')) return parseFloat(val);
    if (val.endsWith('%')) return 0;
    return parseFloat(val) || 0;
  };

  switch (parts.length) {
    case 1: { const p = toPx(parts[0]); return { top: p, right: p, bottom: p, left: p }; }
    case 2: return { top: toPx(parts[0]), right: toPx(parts[1]), bottom: toPx(parts[0]), left: toPx(parts[1]) };
    case 3: return { top: toPx(parts[0]), right: toPx(parts[1]), bottom: toPx(parts[2]), left: toPx(parts[1]) };
    case 4: return { top: toPx(parts[0]), right: toPx(parts[1]), bottom: toPx(parts[2]), left: toPx(parts[3]) };
    default: return { top: 20, right: 20, bottom: 20, left: 20 };
  }
}

// ─── Main Export ────────────────────────────────────────────────

/**
 * Captura un screenshot del primer elemento <div> en un archivo HTML.
 *
 * @param htmlPath - Ruta absoluta al archivo HTML
 * @param options - Opciones de captura (padding, escala, color de fondo, css, strict)
 * @returns Buffer PNG y dimensiones de la imagen capturada
 */
export async function captureElement(
  htmlPath: string,
  options?: CaptureElementOptions
): Promise<CaptureElementResult> {
  const opts = {
    padding: options?.padding ?? '20px',
    scale: options?.scale ?? 2,
    bgColor: options?.bgColor ?? 'white',
    css: options?.css,
    strict: options?.strict ?? false,
  };

  const warnings: string[] = [];

  // Resolve Chromium
  const executablePath = await resolveChromiumExecutablePath();

  // Dynamic import of puppeteer-core
  const { launch } = await import('puppeteer-core');

  const browser = await launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });
    await page.setContent(''); // reset

    // Navigate to the HTML file
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait a bit for any async rendering
    await new Promise(r => setTimeout(r, 500));

    // Inject external CSS if provided
    if (opts.css) {
      const { readFileSync, existsSync } = await import('node:fs');
      if (existsSync(opts.css)) {
        const cssContent = readFileSync(opts.css, 'utf-8');
        await page.addStyleTag({ content: cssContent });
      } else {
        warnings.push(`Archivo CSS no encontrado: ${opts.css}`);
      }
    }

    // Set background color
    await page.evaluate((color) => {
      document.body.style.backgroundColor = color;
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    }, opts.bgColor);

    // Find all div elements
    const divCount = await page.evaluate(() => {
      return document.querySelectorAll('div').length;
    });

    if (divCount === 0) {
      // Try any visible root element as fallback
      const elementCount = await page.evaluate(() => {
        return document.body.children.length;
      });

      if (elementCount === 0) {
        throw new Error(
          `No se encontró ningún elemento raíz visible en: ${htmlPath}\n` +
          `El archivo debe contener al menos un <div> con contenido visible.`
        );
      }

      warnings.push(
        `No se encontraron <div> en ${htmlPath}. Se capturará el primer elemento hijo de <body>.`
      );
    } else if (divCount > 1) {
      if (opts.strict) {
        throw new Error(
          `El archivo ${htmlPath} contiene ${divCount} elementos <div>. ` +
          `Usa --strict para evitar esta verificación o corrige el HTML para tener exactamente 1 div.`
        );
      }
      warnings.push(
        `Se encontraron ${divCount} <div> en ${htmlPath}. Capturando el primero.`
      );
    }

    // Get the element to capture (first child of body if no divs, first div otherwise)
    const elementHandle = await page.evaluateHandle(() => {
      const divs = document.querySelectorAll('div');
      if (divs.length > 0) return divs[0];
      // Fallback: first child of body
      return document.body.firstElementChild;
    });

    if (!elementHandle.asElement()) {
      throw new Error(`No se pudo seleccionar el elemento a capturar en: ${htmlPath}`);
    }

    // Get bounding box
    const bBox = await elementHandle.asElement()!.boundingBox();

    if (!bBox || bBox.width === 0 || bBox.height === 0) {
      throw new Error(
        `El elemento a capturar en ${htmlPath} no tiene dimensiones visibles.\n` +
        `Asegúrate de que tenga width/height definidos o contenido visible.`
      );
    }

    // Parse padding
    const padding = parsePadding(opts.padding);

    // Calculate clip region with padding
    const clip = {
      x: Math.max(0, bBox.x - padding.left),
      y: Math.max(0, bBox.y - padding.top),
      width: bBox.width + padding.left + padding.right,
      height: bBox.height + padding.top + padding.bottom,
    };

    // Take screenshot
    const buffer = await page.screenshot({
      clip,
      type: 'png',
    }) as Buffer;

    return {
      buffer,
      width: clip.width,
      height: clip.height,
      warnings,
    };
  } finally {
    await browser.close();
  }
}
