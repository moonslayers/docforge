# 🔨 docforge

**Generador de documentación multi-proyecto** — PDF desde Markdown con portada, índice y saltos de página automáticos.

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

Genera PDFs a partir de las secciones Markdown.

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

**¿Qué genera `init`?**
- `project.yml` — Configuración del proyecto (colores, empresa, PDF defaults)
- `AGENTS.md` — Guía para agentes de IA con instrucciones de cómo crear documentación
- `casos/` — Carpeta lista para agregar secciones

---

### `docforge list [projects|cases]`

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
     ¿El CWD contiene archivos .md?
       ├─ Sí → busca project.yml hacia arriba y genera solo ese caso
       └─ No → muestra error con ayuda
```

```bash
cd projects/credilink
docforge generate     # Detecta credilink, genera todo

cd projects/credilink/casos/mi-caso
docforge generate     # Detecta caso específico
```

---

## 🤖 AGENTS.md — Instrucciones para agentes de IA

Al hacer `docforge init`, se genera automáticamente un `AGENTS.md` dentro del proyecto con instrucciones para que un agente de IA (Claude, Gemini, etc.) pueda crear documentación.

El nombre del archivo es configurable:

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

```bash
docforge config init
```

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
        ├── cover.md            ← Opcional. Portada personalizada.
        ├── 01-primer-paso.md   ← Secciones con prefijo numérico (NN-*.md)
        ├── 02-segundo-paso.md
        ├── 03-tercer-paso.md
        └── images/             ← Capturas de pantalla
```

El prefijo numérico de 2 dígitos define el orden de las secciones en el PDF.

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

## 📝 Formato de secciones (`NN-*.md`)

Cada archivo de sección es **Markdown puro** (sin HTML), con frontmatter YAML opcional:

```markdown
---
case_title: "Liquidar Anticipadamente con Gastos de Cobranza"
case_version: "1.0"
case_date: "2026-05-20"
case_author: "Equipo de Documentación"
case_status: "Final"
case_description: "Proceso para liquidar anticipadamente un crédito..."
manual_subtitle: "Manual de Usuario"
---

## Requisitos Previos

- El crédito **no debe tener ningún convenio activo** al iniciar el proceso.
- Tener acceso al módulo de **Estados de Cuenta**.
```

Reglas:
- El **primer `##`** de cada archivo se usa como título en el índice automático
- Los frontmatter de cover.md y la primera sección proveen metadatos (título, versión, etc.)
- No necesitas portada, índice ni saltos de página — docforge lo genera solo

### Portada personalizada (`cover.md`, opcional)

Si **no existe** `cover.md`, docforge genera una portada automática.
Si quieres una portada personalizada, créala:

```markdown
---
case_title: "Mi Título"
---

# {{project_full_name}}

<p class="subtitle">Mi portada</p>

Versión: {{case_version}}
```

### Placeholders disponibles

| Placeholder | Fuente | Ejemplo |
|---|---|---|
| `{{project_full_name}}` | `project.yml → full_name` | "CrediLink — Sistema de Gestión" |
| `{{project_name}}` | `project.yml → name` | "CrediLink" |
| `{{project_version}}` | `project.yml → version` | "2.0.0" |
| `{{company_name}}` | `project.yml → company.name` | "Gobierno de BC" |
| `{{case_title}}` | Frontmatter de cover.md o 1ra sección | "Liquidar Anticipadamente" |
| `{{case_version}}` | Frontmatter | "1.0" |
| `{{case_date}}` | Frontmatter | "2026-05-20" |
| `{{case_author}}` | Frontmatter | "Equipo de Documentación" |
| `{{case_status}}` | Frontmatter | "Borrador" |
| `{{case_description}}` | Frontmatter | "Proceso para..." |
| `{{manual_subtitle}}` | Frontmatter | "Manual de Usuario" |

---

## 🧹 Linter

```bash
npm run lint        → eslint src/
npm run lint:fix    → eslint src/ --fix
npm run check       → tsc --noEmit && eslint src/
```

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
| ESLint + typescript-eslint | Linter |

---

## 🔒 Privacidad

La carpeta `projects/` está en `.gitignore` para que **no se suba a GitHub**.
Solo el código de la herramienta (`docforge/`) se comparte en el repositorio.
Los datos de cada proyecto se mantienen localmente.

---

## 📄 Licencia

MIT
