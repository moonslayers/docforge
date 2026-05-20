# docforge — Agent Guide

This file covers what the README and source code don't make obvious.

## Build & dev

- `npm run build` → `tsc`
- `npm run dev` → `tsc --watch`
- `npm run lint` → `eslint src/`
- `npm run lint:fix` → `eslint src/ --fix`
- `npm run check` → `tsc --noEmit && eslint src/`
- `npm run clean` → `rm -rf dist`
- ESM-only (`"type": "module"` in package.json); imports use `.js` extension in source
- No test runner yet

## Architecture

- `src/index.ts` — CLI entry; defines 4 commands (generate, init, list, config)
- Core modules under `src/core/`:

| Module | Responsibility |
| --- | --- |
| `config.ts` | Loads project.yml, global config from `~/.config/docforge/`, resolves projectsDir |
| `detect.ts` | Auto-detects project/case from CWD (walks up looking for project.yml) |
| `resolver.ts` | Resolves case paths, delegates to section-loader |
| `section-loader.ts` | Reads multi-file case format (cover.md + NN-*.md), extracts titles |
| `pdf.ts` | Generates PDF: auto-creates cover, TOC, page breaks; calls md-to-pdf |
| `placeholders.ts` | Replaces `{{variable}}` with project + case metadata |
| `metadata.ts` | Merges project config with case frontmatter |
| `template.ts` | Generates CSS `:root` variables from brand colors |
| `agent-template.ts` | Template for AGENTS.md generated inside user projects |

- All imports use `.js` extension (ESM + NodeNext module resolution)
- Entry produces `#!/usr/bin/env node` shebang in dist; `"bin": "./dist/index.js"`

## Case format (IMPORTANT)

The case format changed from a single `manual-usuario.md` to **multi-file**:

```md
casos/mi-caso/
├── cover.md            ← Optional. Custom cover page.
├── 01-seccion.md       ← Sections with numeric prefix (order)
├── 02-otra-seccion.md
└── images/
```

- `section-loader.ts` reads all `.md` files, orders by prefix, extracts `##` titles for TOC
- `pdf.ts` generates **cover** (auto or from cover.md), **TOC** (from section titles), **page breaks** automatically
- No HTML needed in sections — just pure Markdown
- Frontmatter YAML in cover.md or first section provides case metadata (case_title, case_version, etc.)

## Key flows

### `docforge generate` (no args)

1. `detectProjectFromCwd()` walks up from CWD looking for `project.yml` (max 10 levels)
2. If found, checks if CWD has `.md` files → specific case, else → entire project

### `docforge generate <project> --case <name>`

1. `resolveCasePaths()` → case directory
2. `loadCaseByPath()` → `loadCaseSections()` reads multi-file format
3. `generatePdf()` builds cover + TOC + sections → calls `mdToPdf()`

## Config resolution order

CLI `--projects-dir` > `DOCFORGE_PROJECTS_DIR` env var > `~/.config/docforge/config.json` > `./projects` (relative to CWD)

Global config path respects `XDG_CONFIG_HOME` if set, else `~/.config/docforge/config.json`

## Puppeteer

- Comes in via `md-to-pdf` (transitive dep)
- PDF generation passes `--no-sandbox` and `--disable-setuid-sandbox` automatically
- Debug mode: `--debug` flag sets `process.env.DEBUG = 'true'` (checked by logger)

## Conventions

- Case folders: kebab-case
- Section files: `NN-nombre-con-guiones.md` (2-digit prefix)
- Images: `paso-N-descripcion.png` inside `images/`
- Section titles: first `## Heading` is used for auto-TOC
- The frontmatter field `case_description` replaces the old `rawData.txt`

## What this tool is NOT

- `docforge init` generates an `AGENTS.md` **inside user projects** (as a template for documentation agents). That generated file is produced by `src/core/agent-template.ts` and is separate from this file.
- This repo has no GitHub Actions, no pre-commit hooks, no monorepo tooling.
