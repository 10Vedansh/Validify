# ─── Validify Frontend — Docker Build ───────────────────────────────────
#
# The frontend is a TanStack Start SSR app designed primarily for
# Cloudflare Workers deployment (see wrangler.jsonc). This Dockerfile
# builds the static client assets for preview/development or for serving
# behind a CDN.
#
# Full SSR requires Cloudflare Workers (recommended) or a Node.js adapter.
# ────────────────────────────────────────────────────────────────────────

# ─── Stage 1: Install dependencies ──────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci

# ─── Stage 2: Build static assets ───────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

RUN npm run build

# ─── Stage 3: Nginx static server ───────────────────────────────────────
FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

# Copy the built client assets
# TanStack Start outputs to dist/client/ by default
COPY --from=builder /app/dist/client ./

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
