---
case_title: "Instalar y Usar docforge"
manual_subtitle: "Manual de Usuario"
---

## Crear un Caso de Uso

### Estructura de un caso

Cada caso de uso vive dentro de `casos/` con su propia carpeta:

```
mi-proyecto/casos/mi-caso/
├── cover.md                  ← Portada personalizada (opcional)
├── 01-requisitos.md          ← Sección 1
├── 02-paso-1.md              ← Sección 2
├── 03-paso-2.md              ← Sección 3
└── images/
    ├── pantalla-1.png        ← Capturas de pantalla
    └── pantalla-2.png
```

### Crear las carpetas

```bash
cd mi-proyecto
mkdir -p casos/mi-caso/images
```

### Crear la primera sección

`casos/mi-caso/01-requisitos.md`:

```markdown
---
case_title: "Mi Caso de Uso"
case_version: "1.0"
case_date: "2026-05-20"
case_author: "Equipo"
case_status: "Borrador"
---

## Requisitos Previos

- Tener acceso al sistema
- Tener permisos de administrador
```

El **primer `##`** de cada archivo se usa como título en el índice automático del PDF.

### Portada personalizada (opcional)

`casos/mi-caso/cover.md`:

```markdown
---
case_title: "Mi Caso de Uso"
---

# {{project_full_name}}

<p class="subtitle">Manual de Usuario</p>

Versión: {{case_version}}
```

Los placeholders `{{variable}}` se reemplazan automáticamente al generar el PDF con los valores de `project.yml` y del frontmatter.

### Placeholders disponibles

| Placeholder | Fuente | Ejemplo |
|---|---|---|
| `{{project_full_name}}` | `project.yml → full_name` | "Mi Proyecto" |
| `{{project_name}}` | `project.yml → name` | "mi-proyecto" |
| `{{project_version}}` | `project.yml → version` | "1.0.0" |
| `{{company_name}}` | `project.yml → company.name` | "Mi Empresa" |
| `{{case_title}}` | Frontmatter | "Mi Caso de Uso" |
| `{{case_version}}` | Frontmatter | "1.0" |
| `{{case_date}}` | Frontmatter | "2026-05-20" |
| `{{case_author}}` | Frontmatter | "Equipo" |
| `{{case_status}}` | Frontmatter | "Borrador" |

### Agregar imágenes

Coloca las capturas de pantalla en `images/` y refiérelas con ruta relativa:

```markdown
![Pantalla de configuración](./images/pantalla-1.png)
```
