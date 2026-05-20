#!/usr/bin/env node

/**
 * docforge — CLI Entry Point
 * 
 * Uso:
 *   docforge generate [project] [options]    Generar PDF(s)
 *   docforge init <project-name> [options]    Crear nuevo proyecto
 *   docforge list [projects|cases] [project]  Listar proyectos/casos
 *   docforge config [action] [key] [value]    Gestionar configuración global
 */

import { Command } from 'commander';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve, relative } from 'node:path';
import { loadProjectConfig, listProjects, listProjectCases, loadGlobalConfig, saveGlobalConfig, resolveProjectsDir } from './core/config.js';
import { resolveCasePaths, loadCaseByPath, parseProjectCaseNotation } from './core/resolver.js';
import { generatePdf, generateAllPdfs } from './core/pdf.js';

import { logger } from './utils/logger.js';
import { detectProjectFromCwd } from './core/detect.js';
import type { DocforgeGlobalConfig } from './types/index.js';
import type { CaseSections } from './core/section-loader.js';
import { getAgentTemplate } from './core/agent-template.js';

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
);

function showRelativePath(absPath: string): string {
  const rel = relative(process.cwd(), absPath);
  return rel.startsWith('.') ? rel : `./${rel}`;
}

const program = new Command();

program
  .name('docforge')
  .description('Generador de documentación multi-proyecto — PDF desde Markdown')
  .version(packageJson.version, '-v, --version', 'Mostrar versión');

// ─── Comando: generate ───────────────────────────────────────

program
  .command('generate')
  .description('Generar PDF(s) para un proyecto')
  .argument('[project]', 'Nombre del proyecto o ruta (ej: credilink, credilink:mi-caso)')
  .option('-c, --case <name>', 'Caso específico a generar')
  .option('-a, --all', 'Generar todos los casos del proyecto')
  .option('-o, --output <dir>', 'Directorio de salida para el PDF')
  .option('--css <path>', 'Ruta a archivo CSS personalizado')
  .option('--projects-dir <dir>', 'Directorio donde buscar proyectos (default: ./projects)')
  .option('--debug', 'Modo debug con logs detallados')
  .action(async (project: string | undefined, options: Record<string, unknown>) => {
    logger.header();

    const opts = options as {
      case?: string;
      all?: boolean;
      output?: string;
      css?: string;
      projectsDir?: string;
      debug?: boolean;
    };

    if (opts.debug) {
      process.env.DEBUG = 'true';
    }

    try {
      let resolvedProject = project;
      let resolvedCase = opts.case;

      // ── Sin argumentos: autodetección desde el CWD ──
      if (!resolvedProject) {
        const detected = detectProjectFromCwd();
        
        if (!detected) {
          logger.error('No se detectó un proyecto aquí.');
          logger.info('Asegúrate de estar dentro de la carpeta de un proyecto (con project.yml).');
          logger.info('');
          logger.info('Uso explícito:');
          logger.info('  docforge generate <proyecto> [--case <caso> | --all]');
          logger.info('');
          logger.info('Ejemplos:');
          logger.info('  docforge generate credilink --all');
          logger.info('  docforge generate credilink:liquidar-anticipadamente');
          process.exit(1);
        }

        resolvedProject = detected.projectPath;
        resolvedCase = detected.caseName || opts.case;

        logger.info(`📍 Detectado proyecto: ${detected.projectName}`);
        if (resolvedCase) logger.info(`📁 Detectado caso: ${resolvedCase}`);
      }

      // ── Soporte para sintaxis proyecto:caso ──
      if (resolvedProject && !resolvedCase) {
        const parsed = parseProjectCaseNotation(resolvedProject);
        if (parsed) {
          resolvedProject = parsed.project;
          resolvedCase = parsed.case;
        }
      }

      if (!resolvedProject) {
        logger.error('No se pudo resolver el proyecto.');
        process.exit(1);
      }

      const showProject = resolvedProject.includes('/') ? showRelativePath(resolvedProject) : resolvedProject;
      logger.info(`🔧 Proyecto: ${showProject}`);
      if (resolvedCase) logger.info(`📁 Caso: ${resolvedCase}`);

      const { project: projectConfig, casePaths } = resolveCasePaths(
        resolvedProject,
        resolvedCase
      );

      logger.success(`Proyecto "${projectConfig.name}" encontrado`);

      if (casePaths.length === 0) {
        logger.error('No se encontraron casos para generar.');
        process.exit(1);
      }

      if (resolvedCase) {
        // Generar un solo caso
        const caseSections = loadCaseByPath(casePaths[0]);
        const result = await generatePdf(projectConfig, caseSections, {
          output: opts.output,
          css: opts.css,
        });

        if (result.success) {
          logger.success(`PDF generado: ${showRelativePath(result.filename)}`);
        } else {
          logger.error(`Error: ${result.error || 'Error desconocido'}`);
          process.exit(1);
        }
      } else {
        // Generar todos los casos
        const cases: CaseSections[] = casePaths.map(path => loadCaseByPath(path));
        logger.info(`Generando ${cases.length} PDF(s)...`);

        const results = await generateAllPdfs(projectConfig, cases, {
          output: opts.output,
          css: opts.css,
        });

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        logger.separator();
        if (failCount === 0) {
          logger.success(`${successCount} PDF(s) generados correctamente`);
        } else {
          logger.warn(`${successCount} generados, ${failCount} fallos`);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const cleanMessage = message.replace(/\/home\/[^/\s]+\/[^\s]*/g, (match) => {
        try { return showRelativePath(match); } catch { return match; }
      });
      logger.error(cleanMessage);
      process.exit(1);
    }
  });

// ─── Comando: init ───────────────────────────────────────────

program
  .command('init')
  .description('Inicializar un nuevo proyecto en el directorio actual')
  .argument('<name>', 'Nombre del proyecto')
  .option('-p, --path <dir>', 'Ruta base donde crear el proyecto (default: directorio actual)')
  .option('--template <path>', 'Ruta a un proyecto existente para usar como template')
  .action((name: string, options: { path?: string; template?: string }) => {
    logger.header();

    // Crear proyecto en el CWD (el usuario decide dónde)
    const projectDir = options.path
      ? resolve(process.cwd(), options.path, name)
      : resolve(process.cwd(), name);

    const projectYml = join(projectDir, 'project.yml');
    const casosDir = join(projectDir, 'casos');

    if (existsSync(projectDir)) {
      logger.error(`El directorio ya existe: ${showRelativePath(projectDir)}`);
      process.exit(1);
    }

    // Crear estructura
    mkdirSync(casosDir, { recursive: true });

    // Si hay template, copiarlo
    if (options.template) {
      logger.info(`Copiando template desde: ${options.template}`);
      const templateConfig = loadProjectConfig(options.template);
      const templateYaml = `# ${templateConfig.name} → ${name}
# Adapta esta configuración a tu proyecto

name: "${name}"
full_name: "${name}"
description: ""
version: "1.0.0"

company:
  name: ""
  logo: ""

pdf:
  author: "Equipo de Documentación"
  status: "Borrador"
  page_size: A4
  margins: "20mm 15mm 20mm 15mm"
  font_size: "11pt"
  line_height: 1.6

brand:
  primary: "#1a365d"
  secondary: "#2b6cb0"
  accent: "#e2e8f0"
  text: "#2d3748"
  border: "#cbd5e0"
  success: "#276749"
  warning: "#c05621"
  danger: "#c53030"
`;
      writeFileSync(projectYml, templateYaml, 'utf-8');
      logger.success(`Template aplicado desde: ${options.template}`);
    } else {
      // Crear project.yml por defecto
      const defaultYaml = `name: "${name}"
full_name: "${name}"
description: ""
version: "1.0.0"

company:
  name: ""
  logo: ""

pdf:
  author: "Equipo de Documentación"
  status: "Borrador"
  page_size: A4
  margins: "20mm 15mm 20mm 15mm"

brand:
  primary: "#1a365d"
  secondary: "#2b6cb0"
  accent: "#e2e8f0"
  text: "#2d3748"
  border: "#cbd5e0"
`;
      writeFileSync(projectYml, defaultYaml, 'utf-8');
    }

    // ── Generar AGENTS.md dentro del proyecto ──
    const globalConfig = loadGlobalConfig();
    const agentFileName = (globalConfig.agentFile as string) || 'AGENTS.md';
    const agentContent = getAgentTemplate({
      projectName: name,
      agentFileName,
    });
    writeFileSync(join(projectDir, agentFileName), agentContent, 'utf-8');

    logger.success(`Proyecto "${name}" creado en:`);
    logger.info(`  ${showRelativePath(projectDir)}`);
    logger.info('');
    logger.info('Estructura creada:');
    logger.info(`  📁 ${showRelativePath(projectDir)}/`);
    logger.info(`  ├── project.yml`);
    logger.info(`  ├── ${agentFileName}  ← Instrucciones para agentes de IA`);
    logger.info(`  └── casos/`);
    logger.info('');
    logger.info('Para empezar:');
    logger.info(`  1. Edita project.yml con los datos de tu proyecto`);
    logger.info(`  2. Crea un caso: mkdir -p "${showRelativePath(join(projectDir, 'casos', 'mi-caso'))}"`);
    logger.info(`  3. Dentro del proyecto ejecuta: docforge generate`);
  });

// ─── Comando: list ───────────────────────────────────────────

program
  .command('list')
  .description('Listar proyectos o casos')
  .argument('[type]', 'Tipo: "projects" (default) o "cases <project>"')
  .argument('[project]', 'Nombre del proyecto (para listar casos)')
  .option('--projects-dir <dir>', 'Directorio donde buscar proyectos')
  .action((type: string | undefined, project: string | undefined, options: { projectsDir?: string }) => {
    const resourceType = type || 'projects';

    if (resourceType === 'projects') {
      const projects = listProjects(options.projectsDir);

      if (projects.length === 0) {
        logger.info('No hay proyectos disponibles.');
        logger.info('Crea uno con: docforge init <nombre>');
        return;
      }

      logger.info('Proyectos disponibles:');
      for (const proj of projects) {
        logger.info(`  📁 ${proj}`);
      }
    } else if (resourceType === 'cases') {
      const actualProject = project || (type === 'cases' ? undefined : type);

      if (!actualProject) {
        logger.error('Debes especificar un proyecto.');
        logger.info('Uso: docforge list cases <proyecto>');
        return;
      }

      const cases = listProjectCases(actualProject, options.projectsDir);

      if (cases.length === 0) {
        logger.info(`No hay casos en "${actualProject}".`);
        return;
      }

      logger.info(`Casos en "${actualProject}":`);
      for (const c of cases) {
        logger.info(`  📄 ${c}`);
      }
    } else {
      logger.error(`Tipo desconocido: "${resourceType}". Usa "projects" o "cases".`);
    }
  });

// ─── Comando: config ──────────────────────────────────────────

program
  .command('config')
  .description('Gestionar configuración global de docforge')
  .argument('[action]', 'Acción: "show" (default), "set", "init", "path"')
  .argument('[key]', 'Clave a configurar (ej: projectsDir)')
  .argument('[value]', 'Valor a asignar')
  .action((action: string | undefined, key: string | undefined, value: string | undefined) => {
    const cmd = action || 'show';
    
    switch (cmd) {
      case 'show':
      case 'get': {
        const config = loadGlobalConfig();
        logger.header();
        logger.info('Configuración global de docforge:');
        logger.info(`  📁 Archivo: ~/.config/docforge/config.json`);
        logger.info('');
        
        if (Object.keys(config).length === 0) {
          logger.info('  (sin configuración)');
        } else {
          for (const [k, v] of Object.entries(config)) {
            const displayVal = typeof v === 'string' && v.startsWith('/')
              ? showRelativePath(v)
              : v;
            logger.info(`  ${k}: ${displayVal}`);
          }
        }
        
        logger.info('');
        logger.info(`📂 projectsDir resuelto: ${showRelativePath(resolveProjectsDir())}`);
        break;
      }
      
      case 'set': {
        if (!key || !value) {
          logger.error('Uso: docforge config set <clave> <valor>');
          logger.info('Ej: docforge config set projectsDir /home/usuario/mis-projects');
          process.exit(1);
        }
        
        const config = loadGlobalConfig();
        (config as Record<string, unknown>)[key] = value;
        saveGlobalConfig(config);
        logger.success(`Configuración actualizada: ${key} = ${value}`);
        break;
      }
      
      case 'init': {
        const configPath = join(homedir(), '.config', 'docforge', 'config.json');
        
        if (existsSync(configPath)) {
          logger.warn('Ya existe configuración en:');
          logger.info(`  ${showRelativePath(configPath)}`);
          
          const config = loadGlobalConfig();
          logger.info('Configuración actual:');
          for (const [k, v] of Object.entries(config)) {
            const displayVal = typeof v === 'string' && v.startsWith('/')
              ? showRelativePath(v)
              : v;
            logger.info(`  ${k}: ${displayVal}`);
          }
          process.exit(0);
        }
        
        // Crear configuración por defecto
        const defaultConfig: DocforgeGlobalConfig = {
          projectsDir: resolve(process.cwd(), 'projects'),
        };
        
        saveGlobalConfig(defaultConfig);
        
        logger.success('Configuración global creada:');
        logger.info(`  📁 ${showRelativePath(configPath)}`);
        logger.info('');
        logger.info(`  projectsDir: ${showRelativePath(defaultConfig.projectsDir!)}`);
        logger.info('');
        logger.info('Para cambiarlo: docforge config set projectsDir <nueva-ruta>');
        break;
      }
      
      case 'path': {
        logger.info(`📂 projectsDir: ${showRelativePath(resolveProjectsDir())}`);
        break;
      }
      
      default:
        logger.error(`Acción desconocida: "${cmd}"`);
        logger.info('Acciones válidas: show, set, init, path');
    }
  });

// ─── Parsear argumentos ──────────────────────────────────────

program.parse(process.argv);

// Mostrar help si no hay argumentos
if (process.argv.length === 2) {
  program.help();
}
