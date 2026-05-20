# 🔨 docforge

**Generador de documentación multi-proyecto** — PDF desde Markdown con soporte multi-proyecto, autodetección desde el CWD y configuración global.

Creado a partir de `s2c`, migrado a **TypeScript** con arquitectura modular, CLI moderna y soporte para múltiples proyectos con configuración independiente.

---

## 📦 Instalación

```bash
# Local
cd docforge
npm install
npm run build

# Global (para usar docforge como comando desde cualquier ruta)
npm install -g .
```

---

## 🚀 Uso rápido

```bash
# Crear un proyecto nuevo (se crea en el directorio actual)
docforge init mi-proyecto

# Parado dentro de la carpeta del proyecto: genera todo automáticamente
cd mi-proyecto
docforge generate

# O especificando el proyecto desde cualquier ruta
docforge generate mi-proyecto --all
docforge generate mi-proyecto --case nombre-del-caso

# Sintaxis abreviada proyecto:caso
docforge generate mi-proyecto:nombre-del-caso

# Listar proyectos y casos
docforge list projects
docforge list cases mi-proyecto
```

---

## 🎮 Comandos

### `docforge generate [project]`

Genera PDFs a partir de los manuales Markdown.

| Sin argumentos | Con proyecto |
|---|---|
| ✅ **Autodetección**: si estás dentro de la carpeta de un proyecto o caso, lo detecta solo | `docforge generate credilink --all` |

**Flags:**

| Opción | Descripción |
|---|---|
| `-c, --case <name>` | Generar solo un caso específico |
| `-a, --all` | Generar todos los casos del proyecto |
| `-o, --output <dir>` | Directorio de salida para el PDF |
| `--css <path>` | Ruta a archivo CSS personalizado |
| `--projects-dir <dir>` | Directorio donde buscar proyectos |
| `--debug` | Modo debug con logs detallados |

**Ejemplos de autodetección:**

```bash
# Parado en la raíz del proyecto → genera todo
cd ~/projects/credilink
docforge generate

# Parado dentro de un caso → genera solo ese caso
cd ~/projects/credilink/casos/liquidar-anticipadamente
docforge generate
```

---

### `docforge init <name>`

Crea un nuevo proyecto en el **directorio actual** (tú decides dónde).

```bash
cd ~/Projects/Docs
docforge init credilink
# Crea: ~/Projects/Docs/credilink/
#   ├── project.yml           ← Configuración del proyecto
#   ├── AGENTS.md             ← Instrucciones para agentes de IA
#   └── casos/                ← Donde crear los manuales

cd ~/Documentos
docforge init otra-app
# Crea: ~/Documentos/otra-app/
```

**Flags:**

| Opción | Descripción |
|---|---|
| `-p, --path <dir>` | Ruta base alternativa (default: directorio actual) |
| `--template <ruta>` | Copiar estructura desde un proyecto existente |

**¿Qué genera `init`?**
- `project.yml` — Configuración del proyecto (colores, empresa, PDF defaults)
- `AGENTS.md` — Guía para agentes de IA con instrucciones de cómo crear documentación
- `casos/` — Carpeta lista para agregar casos de uso

---

### `docforge list [projects|cases]`

Lista proyectos disponibles o casos de un proyecto específico.

```bash
docforge list projects
docforge list cases credilink
```

---

### `docforge config [action]`

Gestiona la configuración global en `~/.config/docforge/config.json`.

```bash
# Ver configuración actual
docforge config show

# Inicializar configuración por defecto
docforge config init

# Cambiar el directorio de proyectos
docforge config set projectsDir /home/usuario/mis-proyectos

# Ver dónde resuelve projectsDir
docforge config path

# Configurar el nombre del archivo para agentes (default: AGENTS.md)
docforge config set agentFile CLAUDE.md
```

---

## 🧠 Autodetección desde el CWD

`docforge` detecta automáticamente el proyecto cuando ejecutas `generate` sin argumentos:

```
¿El CWD contiene project.yml?
  ├─ Sí → genera todos los casos de ese proyecto
  └─ No
     ¿El CWD contiene manual-usuario.md?
       ├─ Sí → busca project.yml hacia arriba y genera solo ese caso
       └─ No → muestra error con ayuda
```

Esto permite trabajar cómodamente desde la terminal:

```bash
cd projects/credilink
docforge generate     # Listo, ya detectó credilink

cd projects/credilink/casos/mi-caso
docforge generate     # Listo, detectó el caso específico
```

---

## 🤖 AGENTS.md — Instrucciones para agentes de IA

Al hacer `docforge init`, se genera automáticamente un `AGENTS.md` dentro del proyecto. Este archivo contiene todo lo que un agente de IA (Claude, Gemini, etc.) necesita saber para crear documentación:

- ✅ Cómo estructurar un caso de uso
- ✅ Formato del frontmatter YAML
- ✅ Placeholders disponibles (`{{project_full_name}}`, `{{case_title}}`, etc.)
- ✅ Clases CSS del PDF (`.cover-page`, `.subtitle`, `.page-break`, etc.)
- ✅ Buenas prácticas de documentación técnica
- ✅ Cómo generar el PDF con `docforge generate`

**El nombre del archivo es configurable:**

```bash
docforge config set agentFile CLAUDE.md
docforge config set agentFile GEMINI.md
```

Default: `AGENTS.md`

---

## ⚙️ Sistema de configuración global

docforge tiene **4 niveles de precedencia** para resolver el directorio de proyectos:

| Prioridad | Método | Ejemplo |
|---|---|---|
| 🥇 1. Flag CLI | `--projects-dir <ruta>` | `docforge generate --projects-dir ~/docs` |
| 🥈 2. Variable de entorno | `DOCFORGE_PROJECTS_DIR` | `export DOCFORGE_PROJECTS_DIR=~/docs` |
| 🥉 3. Archivo global | `~/.config/docforge/config.json` | `{ "projectsDir": "~/docs" }` |
| 4. Default | `./projects` relativo al CWD | |

El archivo de configuración global se crea con:

```bash
docforge config init
```

Y se almacena en `~/.config/docforge/config.json`:

```json
{
  "projectsDir": "/home/usuario/Projects",
  "agentFile": "AGENTS.md"
}
```

---

## 📁 Estructura de un proyecto

```
mi-proyecto/
├── project.yml                 ← Configuración (colores, empresa, PDF)
├── AGENTS.md                   ← Instrucciones para agentes de IA
└── casos/
    └── nombre-del-caso/
        ├── manual-usuario.md   ← Manual en Markdown + frontmatter YAML
        └── images/             ← Capturas de pantalla
```

---

## ⚙️ Configuración del proyecto (`project.yml`)

```yaml
name: CrediLink                          # Requerido
full_name: "CrediLink — Sistema de..."   # Opcional
description: "..."                       # Opcional
version: "2.0.0"                         # Opcional

company:
  name: "Gobierno de BC"
  logo: ""                               # Ruta al logo (opcional)

pdf:
  author: "Equipo de Documentación"
  status: "Borrador"
  page_size: A4
  margins: "20mm 15mm 20mm 15mm"
  font_size: "11pt"
  line_height: 1.6

brand:
  primary: "#6a1c32"        # Títulos y encabezados
  secondary: "#b17a45"      # Subtítulos y blockquotes
  accent: "#e2e8f0"         # Fondos de bloque
  text: "#2d3748"           # Texto principal
  border: "#cbd5e0"         # Bordes
  success: "#276749"        # Verde
  warning: "#c05621"        # Naranja
  danger: "#c53030"         # Rojo
```

---

## 📝 Formato de casos

### Frontmatter YAML (obligatorio al inicio de `manual-usuario.md`)

```yaml
---
case_title: "Liquidar Anticipadamente con Gastos de Cobranza"
case_version: "1.0"
case_date: "2026-05-20"
case_author: "Equipo de Documentación"
case_status: "Final"
case_description: "Proceso para liquidar anticipadamente un crédito..."
manual_subtitle: "Manual de Usuario"
---
```

### Placeholders disponibles

Usa `{{variable}}` en el markdown. Se reemplazan automáticamente al generar el PDF:

| Placeholder | Fuente | Ejemplo |
|---|---|---|
| `{{project_full_name}}` | `project.yml → full_name` | "CrediLink — Sistema de Gestión" |
| `{{project_name}}` | `project.yml → name` | "CrediLink" |
| `{{project_version}}` | `project.yml → version` | "2.0.0" |
| `{{company_name}}` | `project.yml → company.name` | "Gobierno de BC" |
| `{{case_title}}` | Frontmatter del caso | "Liquidar Anticipadamente" |
| `{{case_version}}` | Frontmatter del caso | "1.0" |
| `{{case_date}}` | Frontmatter del caso | "2026-05-20" |
| `{{case_author}}` | Frontmatter del caso | "Equipo de Documentación" |
| `{{case_status}}` | Frontmatter del caso | "Borrador" |
| `{{case_description}}` | Frontmatter del caso | "Proceso para..." |
| `{{manual_subtitle}}` | Frontmatter del caso | "Manual de Usuario" |

### Clases CSS para el PDF

| Clase | Uso |
|---|---|
| `<div class="cover-page">` | Portada centrada con salto de página |
| `<p class="subtitle">` | Subtítulo en portada (uppercase) |
| `<p class="meta">` | Metadatos (versión, fecha, autor) |
| `<div class="page-break">` | Salto de página explícito |
| `<div class="toc">` | Tabla de contenidos |
| `blockquote` | Notas importantes (borde izquierdo) |
| `blockquote > strong` | Advertencias (borde naranja) |

### Buenas prácticas

1. **Portada**: Usa `<div class="cover-page">` al inicio con `# {{project_full_name}}`
2. **Índice**: Después de la portada, incluye un índice numerado
3. **Pasos**: Cada paso con `## Paso N: Descripción`, texto explicativo + imagen
4. **Imágenes**: Referencia con `![Descripción](./images/archivo.png)`
5. **Saltos de página**: `<div style="page-break-before: always;"></div>` entre secciones
6. **Notas**: `> ⚠️ **IMPORTANTE:** texto` para advertencias

---

## 🛠️ Stack tecnológico

| Tecnología | Propósito |
|---|---|
| TypeScript 5.4+ | Lenguaje |
| Node.js 18+ | Runtime |
| commander 12.x | CLI |
| gray-matter 4.x | Frontmatter YAML en Markdown |
| js-yaml 4.x | Parseo de YAML |
| md-to-pdf 5.x | Conversión Markdown → PDF |
| Puppeteer | Renderizado de PDF |

---

## 🔒 Privacidad

La carpeta `projects/` está en `.gitignore` para que **no se suba a GitHub**.
Solo el código de la herramienta (`docforge/`) se comparte en el repositorio.
Los datos de cada proyecto se mantienen localmente.

El contenido de `projects/` se ignora, pero la carpeta vacía se mantiene en el repo mediante un `.gitkeep`.

---

## 📄 Licencia

MIT
