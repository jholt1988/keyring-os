# ─── Stage 1: Install dependencies ────────────────────────────────────────────
#   Build context MUST be the monorepo root:
#     docker build -f apps/admin/Dockerfile -t jholt1988/keyring_os:1.0 .
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate
WORKDIR /app

# Copy workspace-level dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all package.json files the workspace needs
COPY apps/admin/package.json ./apps/admin/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/

# Install all dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# ─── Stage 2: Build the application ──────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate
WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/ ./

# Copy source code for workspace packages (needed at build time)
COPY packages/ ./packages/
COPY apps/admin/ ./apps/admin/

# Copy root-level config files needed by turbo / ts
COPY apps/admin/tsconfig.json ./apps/admin/

# Build the admin app via turbo (respects dependsOn for workspace packages)
RUN pnpm turbo run build --filter=@keyring/admin

# ─── Stage 3: Production runner ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy the standalone server (includes only what's needed to run)
COPY --from=builder /app/apps/admin/.next/standalone ./

# Copy static assets and public files (standalone doesn't include these)
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# The standalone build outputs a server.js at the app root
CMD ["node", "apps/admin/server.js"]
