/**
 * docforge — Auto-detección de proyecto y caso desde el CWD
 * 
 * Permite ejecutar `docforge generate` sin argumentos cuando
 * el usuario está parado dentro de la carpeta de un proyecto o caso.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';


/**
 * Resultado de la detección de proyecto/caso desde el CWD.
 */
export interface DetectedContext {
  /** Nombre del proyecto detectado */
  projectName: string;
  /** Ruta base del proyecto (donde está el project.yml) */
  projectPath: string;
  /** Nombre del caso específico (si se detectó uno) */
  caseName?: string;
  /** Ruta del caso específico (si se detectó uno) */
  casePath?: string;
}

/**
 * Busca hacia arriba desde el CWD para encontrar la carpeta
 * raíz del proyecto (donde está project.yml).
 * 
 * @param startDir Directorio desde donde empezar la búsqueda (default: CWD)
 * @returns Ruta absoluta al directorio que contiene project.yml, o null
 */
export function findProjectRoot(startDir?: string): string | null {
  let current = startDir ? resolve(startDir) : process.cwd();
  
  // Buscar hasta 10 niveles hacia arriba
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(current, 'project.yml'))) {
      return current;
    }
    
    // Subir un nivel
    const parent = dirname(current);
    if (parent === current) {
      break; // Llegamos a la raíz del sistema
    }
    current = parent;
  }
  
  return null;
}

/**
 * Detecta si el CWD actual está dentro de un proyecto y opcionalmente
 * dentro de un caso específico.
 * 
 * Lógica:
 * 1. Buscar project.yml hacia arriba desde el CWD
 * 2. Si se encuentra, el nombre del proyecto es el nombre de esa carpeta
 * 3. Si además el CWD contiene manual-usuario.md, es un caso específico
 * 
 * @returns Contexto detectado, o null si no se encontró nada
 */
export function detectProjectFromCwd(): DetectedContext | null {
  const cwd = process.cwd();
  
  // 1. Buscar project.yml hacia arriba
  const projectPath = findProjectRoot(cwd);
  if (!projectPath) {
    return null;
  }
  
  const projectName = basename(projectPath);
  const result: DetectedContext = {
    projectName,
    projectPath,
  };
  
  // 2. Verificar si el CWD contiene un manual-usuario.md (estamos dentro de un caso)
  if (existsSync(join(cwd, 'manual-usuario.md'))) {
    // Determinar el nombre del caso
    // El caso puede estar directamente en el CWD, o el CWD puede ser la carpeta del caso
    const caseName = basename(cwd);
    
    // Verificar si el CWD es efectivamente una subcarpeta de casos/
    const casosPath = join(projectPath, 'casos');
    if (cwd.startsWith(casosPath) || cwd.startsWith(join(projectPath, 'casos'))) {
      result.caseName = caseName;
      result.casePath = cwd;
    }
  }
  
  return result;
}

/**
 * Lee el nombre del proyecto desde project.yml
 */
export function readProjectName(projectPath: string): string | null {
  try {
    const yamlContent = readFileSync(join(projectPath, 'project.yml'), 'utf-8');
    const match = yamlContent.match(/^name:\s*"?([^"\n]+)"?\s*$/m);
    return match ? match[1].trim() : basename(projectPath);
  } catch {
    return basename(projectPath);
  }
}
