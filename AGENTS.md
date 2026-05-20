# docforge — Agent Guide

This file covers what the README and source code don't make obvious.

## Build & dev

- `npm run build` → `tsc` (no bundler, no lint, no test step)
- `npm run dev` → `tsc --watch`
- ESM-only (`"type": "module"` in package.json); imports use `.js` extension in source
- No test runner, no lint config, no typecheck script exist
- `npm run clean` → `rm -rf dist`

## Architecture

- `src/index.ts` — CLI entry; defines 4 commands (generate, init, list, config)
- Core modules under `src/core/`: config.ts, detect.ts, resolver.ts, pdf.ts, placeholders.ts, metadata.ts, template.ts
- Entry produces `#!/usr/bin/env node` shebang in dist; `"bin": "./dist/index.js"`
- Puppeteer comes in via `md-to-pdf` (transitive dep); PDF generation passes `--no-sandbox` automatically
- Debug mode: `--debug` flag sets `process.env.DEBUG = 'true'` (checked by logger)

## Important conventions

- `manual-usuario.md` is the required filename for case documents (hardcoded, not configurable)
- Auto-detection (`generate` without args) walks up the directory tree looking for `project.yml` (max 10 levels)
- Config resolution order: CLI `--projects-dir` > `DOCFORGE_PROJECTS_DIR` env var > `~/.config/docforge/config.json` > `./projects` (relative to CWD)
- Global config path respects `XDG_CONFIG_HOME` if set, else `~/.config/docforge/config.json`
- Brand colors from `project.yml` become CSS `:root` variables via `template.ts`

## What this tool is NOT

- `docforge init` generates an `AGENTS.md` **inside user projects** (as a template for documentation agents). That generated file is produced by `src/core/agent-template.ts` and is separate from this file.
- This repo has no GitHub Actions, no pre-commit hooks, no monorepo tooling.
