#!/bin/sh
# ─── wait-for-db.sh ────────────────────────────────────────────────────
# Polls the PostgreSQL database until it is reachable, then exits.
#
# Usage:
#   ./wait-for-db.sh [timeout_seconds]
#
# Default timeout: 60 seconds
# ────────────────────────────────────────────────────────────────────────

set -e

TIMEOUT="${1:-60}"
INTERVAL=2
ELAPSED=0

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

# Extract host and port from DATABASE_URL
HOST=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@\([^:/]*\).*|\2|p')
PORT=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@\([^:/]*\).*|\1|p')

if [ -z "$HOST" ] || [ -z "$PORT" ]; then
  echo "ERROR: Could not parse host/port from DATABASE_URL"
  exit 1
fi

echo "Waiting for PostgreSQL at $HOST:$PORT (timeout: ${TIMEOUT}s)..."

while [ $ELAPSED -lt $TIMEOUT ]; do
  if nc -z "$HOST" "$PORT" 2>/dev/null; then
    echo "PostgreSQL is ready after ${ELAPSED}s"
    exit 0
  fi
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))
done

echo "ERROR: Timed out after ${TIMEOUT}s waiting for PostgreSQL at $HOST:$PORT"
exit 1
