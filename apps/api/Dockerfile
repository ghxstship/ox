# OX API — multi-stage. Build the workspace, run dist/main.
FROM node:20-slim AS base
ENV PNPM_HOME=/pnpm PATH="/pnpm:$PATH"
RUN corepack enable
WORKDIR /repo

# ── deps + build (whole monorepo so @ox/* + prisma resolve) ──────────
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @ox/db prisma:generate
RUN pnpm --filter @ox/api build

# ── runtime ──────────────────────────────────────────────────────────
FROM base AS run
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
EXPOSE 4000
CMD ["node", "dist/main.js"]
