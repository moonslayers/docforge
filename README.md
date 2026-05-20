# 🔨 docforge

**Generador de documentación multi-proyecto** — PDF desde Markdown con soporte multi-proyecto.

Creado a partir de `s2c`, migrado a **TypeScript** con arquitectura modular, CLI moderna y soporte para múltiples proyectos con configuración independiente.

---

## 📦 Instalación

```bash
# Local (recomendado)
cd docforge
npm install
npm run build

# O global
npm install -g .
```

---

## 🚀 Uso

### Comandos principales

```bash
# Generar PDF para un caso específico
docforge generate credilink --case liquidar-anticipadamente

# Generar TODOS los casos de un proyecto
docforge generate credilink --all

# Sintaxis abreviada proyecto:caso
docforge generate credilink:liquidar-anticipadamente

# Inicializar un nuevo proyecto
docforge init mi-proyecto

# Listar proyectos disponibles
docforge list projects

# Listar casos de un proyecto
docforge list cases credilink
```

### Opciones de `generate`

| Opción | Descripción |
|---|---|
| `-c, --case <name>` | Caso específico a generar |
| `-a, --all` | Generar todos los casos del proyecto |
| `-o, --output <dir>` | Directorio de salida para el PDF |
| `--css <path>` | Ruta a archivo CSS personalizado |
| `--projects-dir <dir>` | Directorio donde buscar proyectos |
| `--debug` | Modo debug con logs detallados |

---

## 📁 Estructura del proyecto

```
docforge/                          # 🛠️ Tool (se sube a GitHub)
├── src/
│   ├── index.ts                   # Entry point + CLI
│   ├── types/
│   │   └── index.ts               # Interfaces TypeScript
│   ├── core/
│   │   ├── config.ts              # Carga project.yml
│   │   ├── metadata.ts            # Merge metadata proyecto + caso
│   │   ├── placeholders.ts        # Reemplazo {{variables}}
│   │   ├── template.ts            # CSS brand colors
│   │   ├── pdf.ts                 # Wrapper md-to-pdf
│   │   └── resolver.ts            # Resolución de rutas
│   └── utils/
│       ├── fs.ts                  # Helpers filesystem
│       └── logger.ts              # Logger formateado
├── templates/
│   └── pdf-style.css              # Estilos PDF default
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md

projects/                          # 📁 Datos (NO se sube a GitHub)
├── credilink/                     # Proyecto ejemplo
│   ├── project.yml                # Configuración del proyecto
│   └── casos/
│       └── liquidar-anticipadamente.../
│           ├── manual-usuario.md
│           └── images/
├── .gitkeep
└── ...
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
  primary: "#6a1c32"
  secondary: "#b17a45"
  accent: "#e2e8f0"
  text: "#2d3748"
  border: "#cbd5e0"
  success: "#276749"
  warning: "#c05621"
  danger: "#c53030"
```

---

## 📝 Formato de casos

Cada caso de uso vive en su propia carpeta dentro de `casos/` y debe contener:

- `manual-usuario.md` — Documentación en Markdown con frontmatter YAML
- `images/` — Capturas de pantalla (opcional)

### Frontmatter del manual

```yaml
---
case_title: "Liquidar Anticipadamente con Gastos de Cobranza"
case_version: "1.0"
case_date: "2026-05-20"
case_author: "Equipo de Documentación"
case_status: "Final"
case_description: "Proceso para liquidar anticipadamente un crédito..."
---
```

### Placeholders

Usa `{{variable}}` en el markdown para insertar valores dinámicos:

```markdown
# {{project_full_name}}

Versión: {{case_version}} | Fecha: {{case_date}}
```

Variables disponibles:
- `{{project_name}}`, `{{project_full_name}}`, `{{project_version}}`
- `{{company_name}}`
- `{{case_title}}`, `{{case_version}}`, `{{case_date}}`
- `{{case_author}}`, `{{case_status}}`, `{{case_description}}`
- Cualquier propiedad del frontmatter del caso

---

## 🛠️ Stack tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| TypeScript | 5.4+ | Lenguaje |
| Node.js | 18+ | Runtime |
| commander | 12.x | CLI |
| gray-matter | 4.x | Frontmatter YAML |
| md-to-pdf | 5.x | Conversión MD → PDF |
| js-yaml | 4.x | Parseo de YAML |
| Puppeteer | (bundled) | Renderizado PDF |

---

## 🔒 Privacidad

La carpeta `projects/` está en `.gitignore` para que **no se suba a GitHub**. 
Solo el código de la herramienta (`docforge/`) se comparte en el repositorio.
Los datos de cada proyecto se mantienen localmente.

---

## 📄 Licencia

MIT
