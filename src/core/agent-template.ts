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
en formato Markdown puro. No necesitas HTML — docforge genera la portada,
el índice y los saltos de página automáticamente.

---

## 📁 Estructura del proyecto

Así está organizado este proyecto:

\`\`\`
${config.projectName}/
├── project.yml           ← Configuración del proyecto (colores, empresa, etc.)
├── ${config.agentFileName}         ← Este archivo (instrucciones para ti)
└── casos/                ← Aquí viven los manuales de usuario
    └── <nombre-del-caso>/
        ├── cover.md            ← Opcional. Portada personalizada.
        ├── 01-primer-paso.md   ← Secciones con prefijo numérico
        ├── 02-segundo-paso.md
        └── images/             ← Capturas de pantalla
\`\`\`

---

## 🆕 Cómo crear un nuevo caso de uso

Sigue estos pasos:

1. **Crea la carpeta del caso** dentro de \`casos/\`:

   \`\`\`bash
   mkdir -p casos/nombre-del-caso/images
   \`\`\`

2. **Crea las secciones** como archivos \`NN-nombre.md\`:

   \`\`\`bash
   touch casos/nombre-del-caso/01-introduccion.md
   touch casos/nombre-del-caso/02-paso-1.md
   touch casos/nombre-del-caso/03-paso-2.md
   \`\`\`

   El prefijo numérico de 2 dígitos define el orden de las secciones.

3. **Agrega las capturas de pantalla** en la carpeta \`images/\`.

4. **Genera el PDF** ejecutando:

   \`\`\`bash
   docforge generate
   \`\`\`

   *(Si estás parado dentro de la carpeta del proyecto o del caso, lo detecta automáticamente)*

---

## 📝 Formato de secciones (\`NN-nombre.md\`)

Cada archivo de sección es Markdown puro, **sin HTML**:

\`\`\`markdown
## Requisitos Previos

Antes de empezar necesitas:
- Tener acceso al sistema
- Tener permisos de administrador

## Paso 1: Hacer algo importante

Explica el paso con claridad...

![Descripción de la imagen](./images/paso-1.png)
\`\`\`

### Reglas del formato:

- ✅ El **primer \`##\`** de cada archivo se usa como título en el índice
- ✅ Los \`###\` y \`#\` no se usan para el índice (solo \`##\`)
- ✅ Las imágenes van con ruta relativa: \`![texto](./images/archivo.png)\`
- ✅ No necesitas portada, ni índice, ni saltos de página — todo lo genera docforge

---

## 🎴 Portada personalizada (\`cover.md\`, opcional)

Si **no existe** \`cover.md\`, docforge genera una portada automática
con el nombre del proyecto, título, versión y fecha.

Si **quieres una portada personalizada**, crea \`cover.md\`:

\`\`\`markdown
---
case_title: "Mi Título Personalizado"
---

# {{project_full_name}}

<p class="subtitle">Subtítulo de mi portada</p>

Versión: {{case_version}}
\`\`\`

Puedes usar Markdown normal o HTML ligero en la portada.

---

## 🔤 Placeholders disponibles

Usa \`{{variable}}\` en el contenido. Se reemplazan automáticamente al generar el PDF:

| Placeholder | Fuente | Ejemplo |
|---|---|---|
| \`{{project_full_name}}\` | \`project.yml → full_name\` | "CrediLink — Sistema de Gestión" |
| \`{{project_name}}\` | \`project.yml → name\` | "CrediLink" |
| \`{{project_version}}\` | \`project.yml → version\` | "2.0.0" |
| \`{{company_name}}\` | \`project.yml → company.name\` | "Gobierno de BC" |
| \`{{case_title}}\` | Frontmatter de cover.md o 1ra sección | "Liquidar Anticipadamente" |
| \`{{case_version}}\` | Frontmatter | "1.0" |
| \`{{case_date}}\` | Frontmatter | "2026-05-20" |
| \`{{case_author}}\` | Frontmatter | "Equipo de Documentación" |
| \`{{case_status}}\` | Frontmatter | "Borrador" |

---

## 🎨 Configuración visual del PDF

Los colores y estilos se configuran en \`project.yml\`:

\`\`\`yaml
pdf:
  author: "Equipo de Documentación"
  status: "Borrador"
  page_size: A4
  margins: "20mm 15mm 20mm 15mm"

brand:
  primary: "#1a365d"      # Títulos y encabezados de tabla
  secondary: "#2b6cb0"    # Subtítulos, blockquotes
  accent: "#e2e8f0"       # Fondos
  text: "#2d3748"         # Texto body
  border: "#cbd5e0"       # Bordes
  success: "#276749"      # Verde
  warning: "#c05621"      # Naranja
  danger: "#c53030"       # Rojo
\`\`\`

---

## ✅ Buenas prácticas

1. **Un tema por sección**: Cada archivo \`NN-*.md\` debe cubrir un tema específico
2. **Títulos descriptivos**: El primer \`##\` de cada archivo es el que aparece en el índice
3. **Imágenes con contexto**: Nombra las imágenes descriptivamente (\`paso-3-crear-convenio.png\`)
4. **Notas importantes**: Usa Markdown estándar, no HTML
5. **Portada solo si es necesario**: La automática suele ser suficiente

---

## ▶️ Comandos disponibles

\`\`\`bash
# Estando dentro de la carpeta del proyecto (detecta automáticamente)
docforge generate

# Generar un caso específico
docforge generate ${config.projectName} --case nombre-del-caso

# Ver los proyectos disponibles
docforge list projects

# Ver los casos de este proyecto
docforge list cases ${config.projectName}
\`\`\`

---

## ✅ Ejemplo completo

\`\`\`
casos/mi-caso/
├── 01-requisitos.md
├── 02-paso-1-configurar.md
├── 03-paso-2-ejecutar.md
└── images/
    ├── paso-1-pantalla.png
    └── paso-2-resultado.png
\`\`\`

**01-requisitos.md:**
\`\`\`markdown
## Requisitos Previos

- Tener instalado el sistema
- Tener permisos de administrador
\`\`\`

**02-paso-1-configurar.md:**
\`\`\`markdown
## Paso 1: Configurar el sistema

Accede al menú de configuración...

![Pantalla de configuración](./images/paso-1-pantalla.png)
\`\`\`

Y al ejecutar \`docforge generate\`, obtienes un PDF con:
1. ✅ Portada automática con los datos del proyecto
2. ✅ Índice generado con "Requisitos Previos" y "Paso 1: Configurar el sistema"
3. ✅ Saltos de página entre cada sección
4. ✅ Colores institucionales desde \`project.yml\`

Sin escribir una sola línea de HTML. 🚀
`;
}
