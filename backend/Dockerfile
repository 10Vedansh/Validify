# ─── Validify API — Multi-stage Docker Build ────────────────────────────
#
# Targets:
#   - Railway (image deploy)
#   - Render (image deploy)
#   - Local development (docker compose)
#
# Runtime: tsx transpiles TypeScript on-the-fly (esbuild-based, fast).
# Prisma client is generated from schema; migrations run at container start.
# ────────────────────────────────────────────────────────────────────────

# ─── Stage 1: Install dependencies + generate Prisma client ────────────
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma/ ./prisma/
RUN npx prisma generate

# ─── Stage 2: Build (TypeScript compilation for type-checking only) ─────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# Verify the code compiles cleanly
RUN npx tsc --noEmit

# ─── Stage 3: Production runtime image ──────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init curl ca-certificates && \
    addgroup -S app && adduser -S app -G app

ENV NODE_ENV=production
ENV PORT=8080
ENV LOG_LEVEL=info

# Copy production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --production --ignore-scripts

# Copy Prisma client (generated in deps stage)
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma

# Copy application source + config
COPY --chown=app:app tsconfig.json ./
COPY --chown=app:app src/ ./src/
COPY --chown=app:app prisma/ ./prisma/

# Install tsx for runtime TypeScript execution
RUN npm install --no-save tsx

# Remove root-level ownership for security
USER app

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f --max-time 5 http://localhost:8080/health || exit 1

# tsx runs the source directly — it resolves @/* path aliases
# from tsconfig.json and transpiles on-the-fly.
# Migrations run before the app starts to ensure the schema is current.
CMD ["dumb-init", "sh", "-c", "npx prisma migrate deploy && npx tsx src/index.ts"]
