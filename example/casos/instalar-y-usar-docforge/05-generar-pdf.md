---
case_title: "Instalar y Usar docforge"
manual_subtitle: "Manual de Usuario"
---

## Generar el PDF

### Autodetección desde el CWD

docforge detecta automáticamente el proyecto cuando ejecutas `generate` sin argumentos. **No necesitas especificar rutas**:

```bash
# Parado en la raíz del proyecto → genera todos los casos
cd ~/Documentos/mi-proyecto
docforge generate
```

```bash
# Parado dentro de un caso → genera solo ese caso
cd ~/Documentos/mi-proyecto/casos/mi-caso
docforge generate
```

### Generar casos específicos

```bash
# Generar todos los casos del proyecto
docforge generate mi-proyecto --all

# Generar un caso específico
docforge generate mi-proyecto --case mi-caso

# Sintaxis abreviada
docforge generate mi-proyecto:mi-caso
```

### Opciones adicionales

| Opción | Descripción |
|---|---|
| `-o, --output <dir>` | Directorio de salida para el PDF |
| `--css <path>` | Ruta a archivo CSS personalizado |
| `--debug` | Modo debug con logs detallados |

```bash
# Guardar el PDF en una carpeta específica
docforge generate mi-proyecto --all --output ~/Documentos/exportados

# Modo debug para ver logs detallados
docforge generate --debug
```

### ¿Qué genera el PDF?

El PDF resultante incluye:

1. **Portada** — Con los datos del proyecto (automática o personalizada)
2. **Índice** — Generado automáticamente con los `##` de cada sección
3. **Secciones** — Cada archivo `NN-*.md` en orden numérico
4. **Saltos de página** — Entre cada sección automáticamente
5. **Colores institucionales** — Definidos en `project.yml → brand`
6. **Imágenes** — Integradas con rutas relativas
