---
case_title: "Instalar y Usar docforge"
manual_subtitle: "Manual de Usuario"
---

## Comandos Adicionales

### Listar proyectos y casos

```bash
# Ver todos los proyectos disponibles
docforge list projects

# Ver los casos de un proyecto específico
docforge list cases mi-proyecto
```

### Gestionar configuración global

docforge guarda la configuración global en `~/.config/docforge/config.json`.

```bash
# Ver configuración actual
docforge config show

# Inicializar configuración por defecto
docforge config init

# Cambiar el directorio de proyectos
docforge config set projectsDir /home/usuario/mis-proyectos

# Configurar el nombre del archivo para agentes
docforge config set agentFile CLAUDE.md

# Ver dónde resuelve projectsDir
docforge config path
```

### Sistema de resolución de proyectos

docforge tiene **4 niveles de precedencia** para encontrar el directorio de proyectos:

| Prioridad | Método | Ejemplo |
|---|---|---|
| 1 | Flag CLI | `--projects-dir ~/docs` |
| 2 | Variable de entorno | `export DOCFORGE_PROJECTS_DIR=~/docs` |
| 3 | Archivo global | `~/.config/docforge/config.json` |
| 4 | Default | `./projects` relativo al CWD |

### Linter y verificación de código

```bash
# Verificar estilo de código
npm run lint

# Corregir estilo automáticamente
npm run lint:fix

# Verificar tipos de TypeScript
npm run check
```
