#!/bin/bash

# Get the project root directory (one level up from the script location)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Load environment variables from .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(cat "$PROJECT_ROOT/.env" | grep -v '#' | awk '/=/ {print $1}')
fi

# Database connection details
DB_NAME=${PG_DATABASE:-"language_db"}
DB_USER=${PG_USERNAME:-"language_user"}
DB_PASSWORD=${PG_PASSWORD:-"test"}
DB_HOST=${PG_HOST:-"localhost"}

echo "Resetting database tables..."

# Export password for database commands
export PGPASSWORD=$DB_PASSWORD

# Drop all tables and indexes
psql -U $DB_USER -h $DB_HOST -d $DB_NAME <<EOF
DROP TABLE IF EXISTS jmdict_entries, kanji_elements, kana_elements, senses, glosses, examples CASCADE;
EOF

echo "Tables dropped."

# Apply schema
echo "Applying schema..."
psql -U $DB_USER -h $DB_HOST -d $DB_NAME -f "$PROJECT_ROOT/app/database/schema.sql"

echo "Database reset complete!" 