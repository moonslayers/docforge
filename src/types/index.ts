/**
 * docforge — Tipos y estructuras de datos centrales
 *
 * Este archivo define todas las interfaces utilizadas
 * por los módulos de docforge para garantizar consistencia
 * de tipos en toda la aplicación.
 */

// ─── Brand / Colores Institucionales ──────────────────────────

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  border: string;
  success?: string;
  warning?: string;
  danger?: string;
  [key: string]: string | undefined;
}

// ─── PDF Defaults ─────────────────────────────────────────────

export interface PdfDefaults {
  author?: string;
  status?: string;
  page_size?: string;
  margins?: string;
  font_size?: string;
  line_height?: number;
  /** Niveles jerárquicos que inician en página nueva.
   *  Default: [1] (solo nivel 1 tiene page break).
   *  Ej: [1, 2] para que nivel 1 y 2 tengan page break.
   *  Cada sección puede sobrescribir con page_break: true/false en frontmatter. */
  page_break_levels?: number[];
}

// ─── Tech Stack ───────────────────────────────────────────────

export interface TechStack {
  framework?: string;
  ui_framework?: string;
  charts?: string;
  maps?: string;
  pdf_generation?: string;
  excel?: string;
  date_handling?: string;
  testing?: string;
  linting?: string;
  [key: string]: string | undefined;
}

// ─── Portal ───────────────────────────────────────────────────

export interface Portal {
  name: string;
  path: string;
  description?: string;
}

// ─── Auth ─────────────────────────────────────────────────────

export interface AuthConfig {
  provider: string;
  type: string;
  description?: string;
}

// ─── Project Config (desde project.yml) ───────────────────────

export interface ProjectConfig {
  name: string;
  full_name?: string;
  description?: string;
  version?: string;

  company?: {
    name?: string;
    logo?: string;
  };

  tech_stack?: TechStack;
  portals?: Record<string, Portal>;
  auth?: AuthConfig;

  pdf?: PdfDefaults;
  brand?: BrandColors;

  /** Directorio base del proyecto (se asigna en runtime) */
  basePath?: string;

  /** Permite cualquier otra propiedad adicional */
  [key: string]: unknown;
}

// ─── Case Data (desde manual-usuario.md) ──────────────────────

export interface CaseMetadata {
  case_title?: string;
  case_version?: string;
  case_date?: string;
  case_author?: string;
  case_status?: string;
  case_description?: string;
  manual_subtitle?: string;

  /** Cualquier otra propiedad del frontmatter YAML */
  [key: string]: unknown;
}

export interface CaseData {
  /** Metadatos extraídos del frontmatter */
  frontmatter: CaseMetadata;

  /** Contenido markdown SIN frontmatter */
  content: string;

  /** Archivo completo (frontmatter + contenido) en bruto */
  raw: string;

  /** Ruta absoluta al archivo manual-usuario.md */
  path: string;
}

// ─── Document Generation Options ──────────────────────────────

export interface GenerateOptions {
  /** Nombre o ruta del proyecto */
  project: string;

  /** Nombre del caso (omitir para generar todos) */
  case?: string;

  /** Ruta de salida del PDF (default: junto al .md) */
  output?: string;

  /** Ruta a CSS personalizado */
  css?: string;

  /** Directorio donde buscar proyectos */
  projectsDir?: string;

  /** Modo verbose */
  verbose?: boolean;

  /** No eliminar archivos temporales */
  debug?: boolean;
}

// ─── Init Options ─────────────────────────────────────────────

export interface InitOptions {
  /** Nombre del nuevo proyecto */
  name: string;

  /** Ruta donde crear el proyecto (default: ./projects/<name>) */
  path?: string;

  /** Si es un proyecto existente, copiar estructura */
  template?: string;
}

// ─── PDF Generation Result ───────────────────────────────────

export interface PdfResult {
  /** Ruta absoluta al archivo PDF generado */
  filename: string;

  /** Tamaño del archivo en bytes */
  size?: number;

  /** Si la generación fue exitosa */
  success: boolean;

  /** Mensaje de error si falló */
  error?: string;
}

// ─── Logger Levels ────────────────────────────────────────────

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

// ─── CLI Commands ─────────────────────────────────────────────

export type CliCommand = 'generate' | 'init' | 'list';

// ─── Global Config (desde ~/.config/docforge/config.json) ─────

export interface DocforgeGlobalConfig {
  /** Directorio donde buscar proyectos */
  projectsDir?: string;

  /** Proyecto por defecto */
  defaultProject?: string;

  /** Tema de la UI (futuro) */
  theme?: string;

  /** Permite propiedades adicionales */
  [key: string]: unknown;
}
