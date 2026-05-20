/**
 * docforge — Template del AGENTS.md
 * 
 * Este archivo contiene el contenido del AGENTS.md que se genera
 * automáticamente dentro de cada proyecto al hacer `docforge init`.
 * El AGENTS.md sirve como guía para agentes de IA que trabajen
 * en la documentación del proyecto.
 */

export function getAgentTemplate(config: {
  projectName: string;
  agentFileName: string;
}): string {
  return `# 👋 ¡Hola! Soy tu asistente de documentación

Bienvenido a la documentación de **${config.projectName}**.

Este archivo te guiará para crear manuales de usuario y casos de uso
con el formato correcto, usando las herramientas disponibles.

---

## 📁 Estructura del proyecto

Así está organizado este proyecto:

\`\`\`
${config.projectName}/
├── project.yml           ← Configuración del proyecto (colores, empresa, etc.)
├── ${config.agentFileName}         ← Este archivo (instrucciones para ti)
└── casos/                ← Aquí viven los manuales de usuario
    └── <nombre-del-caso>/
        ├── manual-usuario.md   ← El manual en Markdown
        └── images/             ← Capturas de pantalla
\`\`\`

---

## 🆕 Cómo crear un nuevo caso de uso

Sigue estos pasos:

1. **Crea la carpeta del caso** dentro de \`casos/\`:

   \`\`\`bash
   mkdir -p casos/nombre-del-caso/images
   \`\`\`

2. **Crea el archivo \`manual-usuario.md\`** con el siguiente formato.

3. **Agrega las capturas de pantalla** en la carpeta \`images/\`.

4. **Genera el PDF** ejecutando:

   \`\`\`bash
   docforge generate
   \`\`\`

   *(Si estás parado dentro de la carpeta del proyecto, docforge detecta automáticamente qué generar)*

---

## 📝 Formato del \`manual-usuario.md\`

### Frontmatter YAML (obligatorio al inicio)

Todo \`manual-usuario.md\` debe empezar con frontmatter YAML entre \`---\`:

\`\`\`yaml
---
case_title: "Nombre del Caso"
case_version: "1.0"
case_date: "2026-05-20"
case_author: "Equipo de Documentación"
case_status: "Borrador"
case_description: "Breve descripción del caso de uso"
manual_subtitle: "Manual de Usuario"
---
\`\`\`

### Campos del frontmatter

| Campo | Requerido | Descripción |
|---|---|---|
| \`case_title\` | ✅ Sí | Título del caso de uso |
| \`case_version\` | ✅ Sí | Versión del documento (ej: "1.0") |
| \`case_date\` | ✅ Sí | Fecha en formato YYYY-MM-DD |
| \`case_author\` | ✅ Sí | Autor o equipo responsable |
| \`case_status\` | ✅ Sí | Estado: "Borrador", "Revisión", "Final" |
| \`case_description\` | No | Descripción breve del caso |
| \`manual_subtitle\` | No | Subtítulo del manual (default: "Manual de Usuario") |

### Placeholders disponibles

Usa \`{{variable}}\` en el markdown. Se reemplazan automáticamente al generar el PDF:

| Placeholder | De dónde viene | Ejemplo |
|---|---|---|
| \`{{project_full_name}}\` | \`project.yml → full_name\` | "CrediLink — Sistema de Gestión" |
| \`{{project_name}}\` | \`project.yml → name\` | "CrediLink" |
| \`{{project_version}}\` | \`project.yml → version\` | "2.0.0" |
| \`{{company_name}}\` | \`project.yml → company.name\` | "Gobierno de BC" |
| \`{{case_title}}\` | Frontmatter del caso | "Liquidar Anticipadamente" |
| \`{{case_version}}\` | Frontmatter del caso | "1.0" |
| \`{{case_date}}\` | Frontmatter del caso | "2026-05-20" |
| \`{{case_author}}\` | Frontmatter del caso | "Equipo de Documentación" |
| \`{{case_status}}\` | Frontmatter del caso | "Borrador" |
| \`{{case_description}}\` | Frontmatter del caso | "Proceso para..." |
| \`{{manual_subtitle}}\` | Frontmatter del caso | "Manual de Usuario" |

### Clases CSS disponibles para el PDF

Puedes usar estas clases en tu markdown para dar formato al PDF:

| Clase / Elemento | Dónde usarlo | Efecto |
|---|---|---|
| \`<div class="cover-page">\` | Portada | Centra el contenido y fuerza salto de página después |
| \`<p class="subtitle">\` | Dentro de cover-page | Subtítulo en uppercase y espaciado |
| \`<p class="meta">\` | Dentro de cover-page | Metadatos con opacidad reducida |
| \`<div class="page-break">\` | Entre secciones | Fuerza un salto de página |
| \`<div class="toc">\` | Índice | Estilo para tabla de contenidos |
| \`blockquote\` | Notas importantes | Borde izquierdo con color secundario |
| \`blockquote > strong\` | Advertencias | Si el blockquote contiene negritas, se muestra como advertencia (borde naranja) |
| \`hr\` | Separadores | Línea horizontal delgada |

### Buenas prácticas para documentar

1. **Portada**: Siempre usa \`<div class="cover-page">\` al inicio con \`# {{project_full_name}}\` como título principal.

2. **Índice**: Después de la portada, incluye un índice numerado de las secciones.

3. **Estructura por pasos**: Para manuales de usuario, cada paso debe tener:
   - Un título con \`## Paso N: Descripción\`
   - Texto explicativo del paso
   - Captura de pantalla relevante

4. **Imágenes**: Refereencia las imágenes con rutas relativas:
   \`\`\`markdown
   ![Descripción de la imagen](./images/nombre-archivo.png)
   \`\`\`

5. **Saltos de página**: Usa \`<div style="page-break-before: always;"></div>\` entre secciones largas.

6. **Notas importantes**: Usa blockquote para información crítica:
   \`\`\`markdown
   > ⚠️ **IMPORTANTE:** Este es un detalle crítico.
   \`\`\`

7. **Convención de nombres**:
   - Carpeta del caso: kebab-case (ej: \`liquidar-anticipadamente\`)
   - Archivo: \`manual-usuario.md\` (obligatorio)
   - Imágenes: \`paso-N-descripcion.png\` (ej: \`paso-3-crear-convenio.png\`)

---

## 🎨 Configuración visual del PDF

Los colores y estilos del PDF se configuran en \`project.yml\`:

\`\`\`yaml
pdf:
  author: "Equipo de Documentación"
  status: "Borrador"
  page_size: A4
  margins: "20mm 15mm 20mm 15mm"

brand:
  primary: "#1a365d"      # Color principal (títulos, encabezados de tabla)
  secondary: "#2b6cb0"    # Color secundario (subtítulos, bordes de blockquote)
  accent: "#e2e8f0"       # Fondo de bloques y filas pares de tabla
  text: "#2d3748"         # Color del texto body
  border: "#cbd5e0"       # Color de bordes
  success: "#276749"      # Verde (operaciones exitosas)
  warning: "#c05621"      # Naranja (advertencias)
  danger: "#c53030"       # Rojo (errores)
\`\`\`

---

## ▶️ Comandos disponibles

Para generar el PDF de tu documentación:

\`\`\`bash
# Estando dentro de la carpeta del proyecto (detecta automáticamente)
docforge generate

# Generar un caso específico por nombre
docforge generate ${config.projectName} --case nombre-del-caso

# Generar todos los casos del proyecto
docforge generate ${config.projectName} --all

# Ver los proyectos disponibles
docforge list projects

# Ver los casos de este proyecto
docforge list cases ${config.projectName}
\`\`\`

---

## ✅ Ejemplo completo

\`\`\`markdown
---
case_title: "Hacer algo importante"
case_version: "1.0"
case_date: "2026-05-20"
case_author: "Equipo de Documentación"
case_status: "Final"
case_description: "Proceso para hacer algo importante en el sistema"
---

<div class="cover-page">

# {{project_full_name}}

<p class="subtitle">{{manual_subtitle}}</p>

# Hacer algo importante

<p class="meta">
  Versión: {{case_version}} | Fecha: {{case_date}} | Estado: {{case_status}}<br>
  {{case_author}}
</p>

</div>

## Requisitos Previos

- Tener acceso al sistema
- Tener permisos de administrador

## Paso 1: Primero haz esto

Explicación del paso...

![Paso 1](./images/paso-1-hacer-algo.png)

## Notas

> ⚠️ **IMPORTANTE:** Asegúrate de tener permisos antes de empezar.
\`\`\`

---

¡Manos a la obra! Crea documentación clara y útil. 🚀
`;
}
