import type { ProjectConfig, CaseMetadata } from '../types/index.js';

/**
 * Reemplaza placeholders {{variable}} en el contenido markdown
 * con valores combinados del proyecto y del caso.
 * 
 * Prioridad: caso > proyecto > valores por defecto
 */
export function replacePlaceholders(
  content: string,
  projectConfig: ProjectConfig,
  caseMeta: CaseMetadata
): string {
  const merged: Record<string, string> = {};

  // 1. Valores del proyecto
  merged.project_name = projectConfig.name || 'docforge';
  merged.project_full_name = projectConfig.full_name || projectConfig.name || 'docforge';
  merged.project_description = projectConfig.description || '';
  merged.project_version = projectConfig.version || '1.0.0';
  merged.company_name = projectConfig.company?.name || '';

  // 2. Valores del caso (con fallback al proyecto)
  merged.case_title = caseMeta.case_title || '';
  merged.case_version = caseMeta.case_version || projectConfig.version || '1.0';
  merged.case_date = caseMeta.case_date || new Date().toISOString().split('T')[0];
  merged.case_author = caseMeta.case_author || projectConfig.pdf?.author || 'Equipo de Documentación';
  merged.case_status = caseMeta.case_status || projectConfig.pdf?.status || 'Borrador';
  merged.case_description = caseMeta.case_description || '';

  // 3. Agregar propiedades adicionales del frontmatter del caso
  for (const [key, value] of Object.entries(caseMeta)) {
    if (typeof value === 'string' && !(key in merged)) {
      merged[key] = value;
    }
  }

  // 4. Ejecutar reemplazo en el contenido
  let result = content;
  for (const [key, value] of Object.entries(merged)) {
    const pattern = new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, 'g');
    result = result.replace(pattern, value);
  }

  return result;
}

/**
 * Escapa caracteres especiales en el nombre de la variable
 * para usarlo en una expresión regular.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
