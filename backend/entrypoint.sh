#!/bin/sh
set -e

echo "========================================"
echo "  Validify API — Startup"
echo "========================================"

echo "[1/2] Running Prisma Migrations..."
echo "  DATABASE_URL: using pooler (Supabase, port 6543)"
echo "  DIRECT_URL  : using direct connection (Supabase, port 5432)"

npx prisma migrate deploy 2>&1

echo "[OK] Migrations complete"

echo "[2/2] Starting application server..."
exec npx tsx src/index.ts
