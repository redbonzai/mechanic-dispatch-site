#!/usr/bin/env bash
# CREATE DATABASE cannot run inside the transaction used for .sql init files; use a shell hook instead.
set -euo pipefail
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres -tc \
  "SELECT 1 FROM pg_database WHERE datname = 'mechanic_test'" | grep -q 1 \
  || psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
    -c "CREATE DATABASE mechanic_test;"
