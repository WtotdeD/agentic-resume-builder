# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Base — pinned Node LTS + pnpm. PUPPETEER_SKIP_DOWNLOAD stops Puppeteer from
# pulling its own ~170MB Chromium; the runtime stage uses the distro build.
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS base
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm install -g pnpm@10.29.3
WORKDIR /app

# ---------------------------------------------------------------------------
# Dependency layers — split so a source-only change does not re-resolve deps.
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ---------------------------------------------------------------------------
# Build — needs dev dependencies (typescript, tailwind, eslint).
# ---------------------------------------------------------------------------
FROM deps AS builder
COPY . .
RUN pnpm build

# ---------------------------------------------------------------------------
# Runtime
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production \
    PORT=3000 \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Chromium plus the font set the PDF renderer falls back to. The resume's own
# IBM Plex faces are self-hosted in public/fonts and need no system package.
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      dumb-init \
      ca-certificates \
      fonts-liberation \
      fonts-dejavu-core \
      fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --chown=node:node public ./public
COPY --chown=node:node content ./content
COPY --chown=node:node resumes ./resumes
COPY --chown=node:node package.json next.config.mjs ./

USER node
EXPOSE 3000

# Chromium forks aggressively; dumb-init reaps the orphans that Node would not.
ENTRYPOINT ["dumb-init", "--"]

# No -p flag: `next start` reads PORT, which is the same variable the PDF route
# uses to build its self-callback URL. Passing a port here could desync them.
CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
