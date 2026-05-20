import type { BrandColors } from '../types/index.js';

/**
 * Mapa de colores institucionales a variables CSS personalizadas.
 */
const COLOR_MAP: Record<string, string> = {
  primary: '--color-primary',
  secondary: '--color-secondary',
  accent: '--color-accent',
  text: '--color-text',
  border: '--color-border',
  success: '--color-success',
  warning: '--color-warning',
  danger: '--color-danger',
};

/**
 * Colores por defecto cuando no se especifican en la configuración.
 */
const DEFAULT_COLORS: BrandColors = {
  primary: '#1a365d',
  secondary: '#2b6cb0',
  accent: '#e2e8f0',
  text: '#2d3748',
  border: '#cbd5e0',
};

/**
 * Genera un string CSS con variables `:root` a partir de
 * los colores institucionales del proyecto.
 * 
 * @param brandColors - Colores institucionales del proyecto
 * @returns String CSS con las variables definidas
 */
export function buildBrandCSS(brandColors?: BrandColors | null): string {
  const colors = brandColors && Object.keys(brandColors).length > 0
    ? brandColors
    : DEFAULT_COLORS;

  let css = ':root {\n';
  for (const [key, varName] of Object.entries(COLOR_MAP)) {
    if (colors[key]) {
      css += `  ${varName}: ${colors[key]};\n`;
    }
  }
  css += '}\n';

  return css;
}
