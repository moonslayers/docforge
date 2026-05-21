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
        ├── 01-primer-paso.md   ← Sección nivel 1
        ├── 01.01-subpaso.md    ← Subsección nivel 2
        ├── 01.01.01-detalle.md ← Sub-subsección nivel 3
        ├── 02-segundo-paso.md  ← Sección nivel 1
        ├── html/               ← HTMLs para generar imágenes con docforge render
        └── images/             ← Capturas de pantalla e imágenes generadas
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
   touch casos/nombre-del-caso/01.01-requisitos.md
   touch casos/nombre-del-caso/01.02-paso-1.md
   touch casos/nombre-del-caso/02-configuracion.md
   \`\`\`

   - **Nivel 1**: \`NN-nombre.md\` (ej: \`01-introduccion.md\`)
   - **Nivel 2**: \`NN.NN-nombre.md\` (ej: \`01.01-requisitos.md\`)
   - **Nivel 3**: \`NN.NN.NN-nombre.md\` (ej: \`01.01.01-detalle.md\`)
   
    El prefijo numérico define el orden y la jerarquía. Los puntos (\`.\`) indican subniveles.

3. **Crea elementos visuales** como archivos HTML en la carpeta \`html/\`:

   \`\`\`bash
   mkdir -p casos/nombre-del-caso/html
   \`\`\`

   Cada archivo HTML debe contener **1 solo \`<div>\`** con el elemento visual
   (interfaz, diagrama, flujo, etc.). Pon el CSS inline o en una etiqueta \`<style>\`
   dentro del mismo archivo.

   Ejemplo \`html/diagrama-flujo.html\`:
   
   \`\`\`html
   <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; width: 600px;">
     <h3 style="color: #1a365d;">Flujo de Aprobación</h3>
     <ol>
       <li>Solicitud ingresada</li>
       <li>Revisión de documentos</li>
       <li>Aprobación del supervisor</li>
       <li>Notificación al solicitante</li>
     </ol>
   </div>
   \`\`\`

4. **Genera las imágenes** a partir de los HTMLs:

   \`\`\`bash
   docforge render
   \`\`\`

   Esto creará automáticamente \`images/diagrama-flujo.png\` con el screenshot
   del div, añadiendo un padding extra para que no quede al ras del borde.

5. **Agrega las imágenes** en tus secciones Markdown con rutas relativas:

   \`\`\`markdown
   ![Diagrama de flujo](./images/diagrama-flujo.png)
   \`\`\`

6. **Genera el PDF** ejecutando:

   \`\`\`bash
   docforge generate
   \`\`\`

   *(Si estás parado dentro de la carpeta del proyecto o del caso, lo detecta automáticamente)*

---

## 📝 Formato de secciones (\`NN-nombre.md\`)

Cada archivo de sección es Markdown puro opcionalmente con frontmatter YAML al inicio:

\`\`\`markdown
---
case_title: "Mi Título Personalizado para la Portada"
---

## Requisitos Previos

Antes de empezar necesitas:
- Tener acceso al sistema
- Tener permisos de administrador
\`\`\`

### Reglas del formato:

- ✅ El **primer \`##\`** de cada archivo se usa como título en el índice
- ✅ \`case_title\` en el frontmatter de la **primera sección** (01-*.md) define el título de la portada automática
- ✅ \`page_break: true/false\` en el frontmatter controla saltos de página por sección
- ✅ Si no hay \`case_title\` en ninguna sección, la portada usará el **nombre de la carpeta** del caso
- ✅ Los \`###\` y \`#\` no se usan para el índice (solo \`##\`)
- ✅ Las imágenes van con ruta relativa: \`![texto](./images/archivo.png)\`
- ✅ Para crear imágenes desde HTML, usa \`docforge render\`: crea HTMLs en \`html/\`, genera PNGs en \`images/\`
- ✅ No necesitas portada, ni índice, ni saltos de página — todo lo genera docforge

---

## 📂 Secciones jerárquicas (subniveles)

Puedes crear estructura jerárquica con subsecciones usando puntos en el prefijo numérico:

\`\`\`
casos/mi-manual/
├── 01-introduccion.md          ← "1. Introducción"
├── 01.01-requisitos.md         ← "1.1 Requisitos"
├── 01.01.01-windows.md         ← "1.1.1 Windows"
├── 01.02-instalacion.md        ← "1.2 Instalación"
├── 02-configuracion.md         ← "2. Configuración"
├── 02.01-basico.md             ← "2.1 Básico"
└── 02.01.01-red.md             ← "2.1.1 Red"
\`\`\`

### Reglas:

- **Nivel 1**: \`NN-nombre.md\` — capítulos principales
- **Nivel 2**: \`NN.NN-nombre.md\` — subsecciones
- **Nivel 3**: \`NN.NN.NN-nombre.md\` — sub-subsecciones
- **Máximo recomendado**: 3 niveles de profundidad

### ¿Qué genera automáticamente?

- ✅ **TOC jerárquico** con indentación por nivel
- ✅ **Numbering automático**: 1, 1.1, 1.1.1, 1.2, 2, 2.1...
- ✅ **Anclas únicas** para cada sección

---

## 📄 Control de saltos de página

Por defecto, solo las secciones de **nivel 1** (capítulos) inician en página nueva.
Las subsecciones fluyen de forma continua.

### Configuración global en \`project.yml\`

Puedes cambiar qué niveles tienen page break:

\`\`\`yaml
pdf:
  page_break_levels: [1]          # 🔷 DEFAULT: solo nivel 1
  # page_break_levels: [1, 2]     # Nivel 1 y 2 tienen page break
  # page_break_levels: [1, 2, 3]  # Todos los niveles (comportamiento antiguo)
\`\`\`

### Control por sección (frontmatter)

Puedes forzar o suprimir un page break en UNA sección específica:

\`\`\`markdown
---
page_break: true    # Fuerza page break antes de esta sección
---

## Mi Sección Especial

...
\`\`\`

\`\`\`markdown
---
page_break: false   # Suprime page break, aunque sea nivel 1
---

## Otra Sección

...
\`\`\`

### Resumen de precedencia:

| Prioridad | Regla | Origen |
|-----------|-------|--------|
| 1 (máxima) | \`page_break: true\` en frontmatter | Sección individual |
| 2 | \`page_break: false\` en frontmatter | Sección individual |
| 3 | Nivel está en \`page_break_levels\` | \`project.yml\` |
| 4 (default) | Solo nivel 1 | Built-in |

---

## 🎴 Portada automática

Cuando **no existe** \`cover.md\`, docforge genera una portada automática con:
1. **Nombre del proyecto** (desde \`project.yml\`)
2. **Subtítulo** ("Manual de Usuario")
3. **Título del caso** (desde \`case_title\` en el frontmatter, o el nombre de la carpeta si no se definió)

### Cómo controlar el título de la portada

Pon \`case_title\` en el frontmatter de tu **primera sección** (\`01-*.md\`):

\`\`\`markdown
---
case_title: "Liquidar Anticipadamente con Gastos de Cobranza"
---

## Lo que necesitas
...
\`\`\`

Si no pones \`case_title\`, la portada usará automáticamente el nombre de la carpeta del caso.

### Portada personalizada con \`cover.md\`

Si quieres una portada **completamente personalizada**, crea \`cover.md\` en la carpeta del caso:

\`\`\`markdown
---
case_title: "Mi Título Personalizado"
---

# {{project_full_name}}

<p class="subtitle">Subtítulo de mi portada</p>

Versión: {{case_version}}
\`\`\`

El \`cover.md\` reemplaza totalmente la portada automática. Puedes usar Markdown normal o HTML ligero.

---

## 🖼️ Generar imágenes desde HTML con \`docforge render\`

Puedes crear elementos visuales (interfaces, diagramas, flujos) como archivos HTML
y convertirlos automáticamente a imágenes PNG.

### Flujo recomendado

1. Crea un archivo HTML en \`casos/<nombre>/html/\` con **1 solo \`<div>\`** que contenga tu elemento visual
2. Ejecuta \`docforge render\` para convertirlo a PNG
3. Referencia la imagen generada en tus secciones Markdown

### Ejemplo

\`\`\`
casos/mi-manual/
├── html/
│   ├── interfaz-login.html     ← 1 div con la interfaz de login
│   └── diagrama-flujo.html     ← 1 div con el diagrama
├── images/
│   ├── interfaz-login.png      ← Generado por docforge render
│   └── diagrama-flujo.png      ← Generado por docforge render
├── 01-introduccion.md          ← Usa ![Login](./images/interfaz-login.png)
└── ...
\`\`\`

### Reglas del formato HTML

- ✅ **1 solo \`<div>\`** por archivo (si hay varios, se captura el primero)
- ✅ El CSS debe ir **inline** o en etiqueta \`<style>\` dentro del mismo HTML
- ✅ El div debe tener **dimensiones visibles** (width/height o contenido que las defina)
- ✅ El screenshot incluye **padding** (default 20px) para que no quede al ras del borde
- ⚠️ Los HTMLs con múltiples divs generan una advertencia (usa \`--strict\` para fallar)

### Recomendaciones para agentes

Cuando crees documentación para un proceso que incluya pasos visuales
(interfaces de sistema, formularios, diagramas de flujo, tablas de datos):

1. **Siempre que sea posible, crea el elemento visual como HTML** en \`html/\`
   en lugar de sugerir capturas de pantalla reales. Los HTMLs son:
   - Más rápidos de crear y modificar
   - Consistentes (mismos colores, fuentes, estilos)
   - No dependen de datos reales o entornos de prueba
   - Se ven profesionales en el PDF

2. **Usa los colores institucionales** del proyecto (definidos en \`project.yml → brand\`)
   para mantener consistencia visual.

3. **Nombra los archivos descriptivamente**: \`paso-3-formulario-creacion.html\`,
   \`tabla-resultados-busqueda.html\`, etc.

4. **Después de crear los HTMLs, ejecuta \`docforge render\`** para generar las imágenes,
   y luego \`docforge generate\` para producir el PDF final.

---

## 🔤 Placeholders disponibles

Usa \`{{variable}}\` en el contenido. Se reemplazan automáticamente al generar el PDF:

| Placeholder | Fuente | Ejemplo |
|---|---|---|
| \`{{project_full_name}}\` | \`project.yml → full_name\` | "CrediLink — Sistema de Gestión" |
| \`{{project_name}}\` | \`project.yml → name\` | "CrediLink" |
| \`{{project_version}}\` | \`project.yml → version\` | "2.0.0" |
| \`{{company_name}}\` | \`project.yml → company.name\` | "Gobierno de BC" |
| \`{{case_title}}\` | Frontmatter de cover.md o 1ra sección (01-*.md) | "Liquidar Anticipadamente" |
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
  page_break_levels: [1]       # ← NUEVO: niveles que inician página

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
3. **Usa subsecciones con moderación**: 2-3 niveles de profundidad es suficiente
4. **HTML antes que capturas reales**: Para elementos visuales, crea HTMLs en \`html/\` y genera imágenes con \`docforge render\`. Es más rápido, consistente y profesional que tomar screenshots reales.
5. **Imágenes con contexto**: Nombra las imágenes descriptivamente (\`paso-3-crear-convenio.png\`)
6. **Notas importantes**: Usa Markdown estándar, no HTML
7. **Portada solo si es necesario**: La automática suele ser suficiente

---

## ▶️ Comandos disponibles

\`\`\`bash
# Estando dentro de la carpeta del proyecto (detecta automáticamente)
docforge generate

# Generar un caso específico
docforge generate ${config.projectName} --case nombre-del-caso

# Renderizar HTMLs de un caso a imágenes PNG
docforge render ${config.projectName} --case nombre-del-caso

# Renderizar HTMLs de todos los casos del proyecto
docforge render ${config.projectName} --all

# Renderizar con padding personalizado
docforge render ${config.projectName}:nombre-del-caso --padding 30px

# Ver los proyectos disponibles
docforge list projects

# Ver los casos de este proyecto
docforge list cases ${config.projectName}
\`\`\`

---

## ✅ Ejemplo completo con subsecciones

\`\`\`
casos/mi-manual/
├── 01-requisitos.md
├── 01.01-windows.md
├── 01.02-macos.md
├── 02-configuracion.md
├── 02.01-basico.md
├── 02.02-avanzado.md
├── html/
│   └── pantalla-config.html       ← 1 div con la interfaz de configuración
└── images/
    ├── pantalla-inicio.png         ← Captura real (si es necesaria)
    └── pantalla-config.png         ← Generado con docforge render
\`\`\`

**01-requisitos.md:**
\`\`\`markdown
## Requisitos Previos

- Tener instalado el sistema
- Tener permisos de administrador
\`\`\`

**01.01-windows.md:**
\`\`\`markdown
## Requisitos para Windows

- Windows 10 o superior
- 8GB de RAM mínimo
\`\`\`

**02-configuracion.md:**
\`\`\`markdown
## Configuración del Sistema

Sigue estos pasos para configurar...
\`\`\`

**html/pantalla-config.html:**
\`\`\`html
<div style="background: #fff; border: 1px solid #cbd5e0; border-radius: 8px; padding: 24px; max-width: 600px; font-family: Arial, sans-serif;">
  <h3 style="color: #1a365d; margin-top: 0;">Configuración del Sistema</h3>
  <form>
    <label style="display: block; margin-bottom: 8px; color: #2d3748;">Servidor:</label>
    <input type="text" value="localhost:8080" style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; margin-bottom: 16px;">
    <label style="display: block; margin-bottom: 8px; color: #2d3748;">Puerto:</label>
    <input type="text" value="3306" style="width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; margin-bottom: 16px;">
    <button style="background: #1a365d; color: white; border: none; padding: 10px 24px; border-radius: 4px; cursor: pointer;">Conectar</button>
  </form>
</div>
\`\`\`

Luego ejecuta:

\`\`\`bash
docforge render     # Genera images/pantalla-config.png desde html/pantalla-config.html
docforge generate   # Genera el PDF con todas las imágenes incluidas
\`\`\`

Y obtienes un PDF con:
1. ✅ Portada automática
2. ✅ Índice jerárquico: 1, 1.1, 1.2, 2, 2.1, 2.2
3. ✅ Saltos de página solo entre capítulos (nivel 1)
4. ✅ Números de sección en los encabezados
5. ✅ Colores institucionales desde \`project.yml\`
6. ✅ Imágenes profesionales generadas desde HTML
`;
}
