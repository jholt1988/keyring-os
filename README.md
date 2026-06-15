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

## ngrok Reverse Proxy (Docker)

1. Copy `.env.ngrok.example` to `.env.ngrok` and set:
- `NGROK_AUTHTOKEN`
- `NGROK_DOMAIN` (only if you reserved a static ngrok domain)

2. Start admin + ngrok:
`docker compose --env-file .env.ngrok -f docker-compose.ngrok.yml up --build`

3. URLs:
- Local app: `http://localhost:3000`
- ngrok inspect UI: `http://localhost:4040`
- Public tunnel: `https://<your-ngrok-domain-or-random-domain>`

If you do not have a reserved ngrok domain, remove `--domain=${NGROK_DOMAIN}` from the `ngrok` command in `docker-compose.ngrok.yml`.
