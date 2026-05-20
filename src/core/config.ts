import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import yaml from 'js-yaml';
import type { ProjectConfig, DocforgeGlobalConfig } from '../types/index.js';

/**
 * Busca y carga la configuración de un proyecto.
 * 
 * Estrategia de búsqueda:
 * 1. Si es una ruta absoluta, busca project.yml ahí
 * 2. Si es un nombre, busca en ./projects/<nombre>/project.yml
 * 3. Relativo al CWD
 */
export function loadProjectConfig(projectNameOrPath: string, projectsDir?: string): ProjectConfig {
  const searchPaths = resolveSearchPaths(projectNameOrPath, projectsDir);
  
  for (const configPath of searchPaths) {
    if (existsSync(configPath)) {
      return parseProjectFile(configPath);
    }
  }

  throw new Error(
    `No se encontró project.yml para "${projectNameOrPath}".\n` +
    `Buscado en:\n${searchPaths.map(p => `  - ${p}`).join('\n')}`
  );
}

/**
 * Resuelve las posibles rutas donde buscar project.yml
 */
function resolveSearchPaths(projectNameOrPath: string, projectsDir?: string): string[] {
  const cwd = process.cwd();
  const paths: string[] = [];

  // Si es ruta absoluta o relativa con /
  if (projectNameOrPath.includes('/') || projectNameOrPath.startsWith('.')) {
    paths.push(resolve(cwd, projectNameOrPath, 'project.yml'));
  }

  // Si es un nombre simple, buscar en projects/
  const baseProjectsDir = resolveProjectsDir(projectsDir);

  paths.push(join(baseProjectsDir, projectNameOrPath, 'project.yml'));

  // También buscar sin projects/ prefix
  paths.push(join(cwd, projectNameOrPath, 'project.yml'));

  return paths;
}

/**
 * Parsea un archivo project.yml y retorna la configuración tipada
 */
function parseProjectFile(filePath: string): ProjectConfig {
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = yaml.load(raw) as Record<string, unknown>;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Archivo inválido: ${filePath}. Debe contener un objeto YAML.`);
  }

  const config = parsed as unknown as ProjectConfig;

  if (!config.name) {
    throw new Error(`Archivo inválido: ${filePath}. Falta el campo requerido "name".`);
  }

  // Agregar basePath para referencia
  config.basePath = filePath.replace(/\/project\.ya?ml$/, '');

  return config;
}

/**
 * Lista todos los proyectos disponibles en el directorio projects/
 */
export function listProjects(projectsDir?: string): string[] {
  const baseDir = resolveProjectsDir(projectsDir);

  if (!existsSync(baseDir)) {
    return [];
  }

  return readdirSync(baseDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .filter(entry => existsSync(join(baseDir, entry.name, 'project.yml')))
    .map(entry => entry.name);
}

/**
 * Lista los casos de un proyecto
 */
export function listProjectCases(projectName: string, projectsDir?: string): string[] {
  const config = loadProjectConfig(projectName, projectsDir);
  
  if (!config.basePath) return [];

  const casosDir = join(config.basePath, 'casos');
  
  if (!existsSync(casosDir)) {
    return [];
  }

  return readdirSync(casosDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

// ─── Configuración Global ─────────────────────────────────────

/**
 * Ruta al archivo de configuración global de docforge.
 * Sigue el estándar XDG: ~/.config/docforge/config.json
 */
function getGlobalConfigPath(): string {
  // Respetar XDG_CONFIG_HOME si está definida
  const configHome = process.env.XDG_CONFIG_HOME 
    || join(homedir(), '.config');
  
  return join(configHome, 'docforge', 'config.json');
}

/**
 * Carga la configuración global desde ~/.config/docforge/config.json.
 * Si no existe el archivo, retorna un objeto vacío.
 */
export function loadGlobalConfig(): DocforgeGlobalConfig {
  const configPath = getGlobalConfigPath();
  
  try {
    if (existsSync(configPath)) {
      const raw = readFileSync(configPath, 'utf-8');
      return JSON.parse(raw) as DocforgeGlobalConfig;
    }
  } catch (err) {
    // Si el archivo está corrupto, ignorar silenciosamente
    console.warn(`⚠️  Archivo de configuración inválido: ${configPath}`);
  }
  
  return {};
}

/**
 * Guarda la configuración global en ~/.config/docforge/config.json.
 */
export function saveGlobalConfig(config: DocforgeGlobalConfig): void {
  const configPath = getGlobalConfigPath();
  const configDir = dirname(configPath);
  
  // Asegurar que el directorio existe
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Resuelve el directorio de proyectos con esta prioridad:
 * 1. CLI flag --projects-dir
 * 2. Variable de entorno DOCFORGE_PROJECTS_DIR
 * 3. Archivo ~/.config/docforge/config.json → projectsDir
 * 4. Default: ./projects (relativo al CWD)
 * 
 * @param cliDir - Valor pasado por --projects-dir (undefined si no se usó)
 * @returns La ruta resuelta del directorio de proyectos
 */
export function resolveProjectsDir(cliDir?: string): string {
  // 1. CLI flag tiene máxima prioridad
  if (cliDir) {
    return resolve(process.cwd(), cliDir);
  }
  
  // 2. Variable de entorno
  const envDir = process.env.DOCFORGE_PROJECTS_DIR;
  if (envDir) {
    return resolve(envDir);
  }
  
  // 3. Archivo de configuración global
  const globalConfig = loadGlobalConfig();
  if (globalConfig.projectsDir) {
    return resolve(globalConfig.projectsDir);
  }
  
  // 4. Default
  return resolve(process.cwd(), 'projects');
}
