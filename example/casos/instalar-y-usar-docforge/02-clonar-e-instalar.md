---
case_title: "Instalar y Usar docforge"
manual_subtitle: "Manual de Usuario"
---

## Clonar e Instalar docforge

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/anomalyco/docforge.git
cd docforge
```

### Paso 2: Instalar dependencias

```bash
npm install
```

Este comando descarga todas las dependencias necesarias definidas en `package.json`.

### Paso 3: Compilar el proyecto

```bash
npm run build
```

Compila el código TypeScript a JavaScript en la carpeta `dist/`.

### Paso 4: Instalación global (opcional)

Para poder usar `docforge` como comando desde cualquier ruta:

```bash
npm install -g .
```

Esto registra el comando `docforge` globalmente en tu sistema.

### Verificar la instalación

```bash
docforge --help
```

Deberías ver la lista de comandos disponibles.
