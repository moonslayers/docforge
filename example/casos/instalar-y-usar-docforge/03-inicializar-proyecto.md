---
case_title: "Instalar y Usar docforge"
manual_subtitle: "Manual de Usuario"
---

## Inicializar un Proyecto

### Crear un nuevo proyecto

`docforge init` crea la estructura base de un proyecto en el **directorio actual**:

```bash
mkdir ~/Documentos
cd ~/Documentos
docforge init mi-proyecto
```

Esto genera la siguiente estructura:

```
mi-proyecto/
├── project.yml    ← Configuración del proyecto
├── AGENTS.md      ← Instrucciones para agentes de IA
└── casos/         ← Carpeta para crear los manuales
```

### Configurar el proyecto

Edita `project.yml` para personalizar tu proyecto:

```yaml
name: "mi-proyecto"
full_name: "Mi Proyecto — Sistema de Gestión"
version: "1.0.0"

company:
  name: "Mi Empresa"

pdf:
  author: "Mi Nombre"
  status: "Borrador"

brand:
  primary: "#6a1c32"        # Color institucional
  secondary: "#b17a45"      # Color secundario
  accent: "#e2e8f0"         # Fondo de bloques
  text: "#2d3748"           # Color de texto
```

### Ver proyectos disponibles

```bash
docforge list projects
```

Lista todos los proyectos encontrados en el directorio de proyectos configurado.
