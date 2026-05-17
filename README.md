# Keyring OS

Decision-driven operating system for property management.

## Core Idea
Keyring OS surfaces what matters, recommends actions, and enables execution.

## Docs
- ARCHITECTURE.md
- UI_SYSTEM.md
- ENGINEERING.md
- AGENT_PLAYBOOK.md
- CONTRIBUTING.md

## Testing & Coverage
- Run unit tests: `pnpm test`
- Watch mode: `pnpm test:watch`
- Coverage gate: `pnpm test:coverage`
- Coverage scope (v1): `apps/admin/src/middleware.ts`, `apps/admin/src/lib/**`, `apps/admin/src/hooks/**`
- Exclusions (v1): `apps/admin/src/app/**`, `apps/admin/src/features/**`, barrel files, type-only files, and `apps/admin/src/lib/copilot-api.ts`
- CI enforces minimum 80% for statements, branches, functions, and lines within scoped files.
