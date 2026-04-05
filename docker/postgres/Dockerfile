FROM postgres:15-alpine

ENV POSTGRES_DB=mechanic \
    POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=postgres

COPY init.sql /docker-entrypoint-initdb.d/00-init.sql
COPY create-mechanic-test-db.sh /docker-entrypoint-initdb.d/01-create-mechanic-test-db.sh
RUN chmod +x /docker-entrypoint-initdb.d/01-create-mechanic-test-db.sh

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"

