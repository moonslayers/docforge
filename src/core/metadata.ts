import type { ProjectConfig, CaseData } from '../types/index.js';

/**
 * Combina la metadata del proyecto con la del caso.
 * La metadata del caso tiene prioridad sobre la del proyecto.
 * 
 * @returns Un objeto plano con todos los valores combinados
 */
export function buildFrontmatter(
  projectConfig: ProjectConfig,
  caseData: CaseData
): Record<string, unknown> {
  const caseMeta = caseData.frontmatter || {};

  return {
    // Del proyecto
    project_name: projectConfig.name || 'docforge',
    project_full_name: projectConfig.full_name || projectConfig.name || 'docforge',
    project_description: projectConfig.description || '',
    project_version: projectConfig.version || '1.0.0',
    company_name: projectConfig.company?.name || '',
    company_logo: projectConfig.company?.logo || '',

    // Del caso (con fallback al proyecto)
    title: caseMeta.case_title || `${projectConfig.name} — Manual`,
    version: caseMeta.case_version || projectConfig.version || '1.0',
    date: caseMeta.case_date || new Date().toISOString().split('T')[0],
    author: caseMeta.case_author || projectConfig.pdf?.author || 'Equipo de Documentación',
    status: caseMeta.case_status || projectConfig.pdf?.status || 'Borrador',
    description: caseMeta.case_description || '',

    // Colores del proyecto
    brand_colors: projectConfig.brand || {},

    // Incluir todo el frontmatter del caso
    ...caseMeta,
  };
}
