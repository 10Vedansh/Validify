#!/bin/sh
set -e

echo "========================================"
echo "  Validify API — Startup"
echo "========================================"
echo "  Schema: pre-applied via schema.sql in Supabase SQL Editor"
echo "  Connection: DATABASE_URL (pooler, port 6543)"
echo "  Migrations: skipped (cannot run through pooler)"
echo "========================================"

echo "Starting application server..."
exec npx tsx src/index.ts
