# OX web — Next.js (standalone). Build context = repo root:
#   docker build -f apps/web/Dockerfile -t ox-web .
FROM node:20-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable

# ── deps + build ──────────────────────────────────────────────────────
FROM base AS build
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
# OpenAPI types are generated; ensure they exist for the build.
RUN pnpm gen:types
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_OX_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @ox/web build

# ── runtime ───────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs nextjs
# Standalone output (traced from the repo root) preserves the monorepo layout.
COPY --from=build --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/en').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/web/server.js"]
