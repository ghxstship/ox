# OX API — NestJS (runs via ts-node over the workspace TS source). Build context
# = repo root:  docker build -f apps/api/Dockerfile -t ox-api .
FROM node:20-slim AS base
ENV PNPM_HOME=/pnpm PATH="/pnpm:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /repo
COPY . .
# Full install — ts-node + typescript are needed at runtime to run the TS source.
RUN pnpm install --frozen-lockfile
# Typecheck as a build gate (fails the image on type errors).
RUN pnpm --filter @ox/api typecheck

FROM base AS run
WORKDIR /repo
ENV NODE_ENV=production PORT=4000
COPY --from=deps /repo /repo
RUN useradd -u 1001 -m nodeuser && chown -R nodeuser /repo
USER nodeuser
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||4000)+'/api/v1/docs/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["pnpm", "--filter", "@ox/api", "start"]
