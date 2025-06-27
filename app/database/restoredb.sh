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

DUMPS_DIR="$PROJECT_ROOT/database_dumps"

# Function to show usage
show_usage() {
  echo "Usage: $0 [dump_file]"
  echo ""
  echo "Arguments:"
  echo "  dump_file    Path to the SQL dump file to restore (optional)"
  echo "               If not provided, will use the latest dump"
  echo ""
  echo "Examples:"
  echo "  $0                                           # Restore from latest dump"
  echo "  $0 database_dump_20241223_143052.sql        # Restore from specific file"
  echo "  $0 /path/to/custom_dump.sql                  # Restore from custom path"
}

# Determine which dump file to use
if [ $# -eq 0 ]; then
  # No argument provided, use latest dump
  DUMP_FILE="$DUMPS_DIR/latest_dump.sql"
  if [ ! -f "$DUMP_FILE" ]; then
    echo "Error: No latest dump found at $DUMP_FILE"
    echo "Run 'npm run dumpdb' to create a dump first, or specify a dump file."
    exit 1
  fi
  echo "Using latest dump: $DUMP_FILE"
elif [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  show_usage
  exit 0
else
  # Argument provided
  if [[ "$1" == /* ]]; then
    # Absolute path provided
    DUMP_FILE="$1"
  elif [[ "$1" == */* ]]; then
    # Relative path with directory
    DUMP_FILE="$1"
  else
    # Just filename, look in dumps directory
    DUMP_FILE="$DUMPS_DIR/$1"
  fi
fi

# Check if dump file exists
if [ ! -f "$DUMP_FILE" ]; then
  echo "Error: Dump file not found: $DUMP_FILE"
  echo ""
  echo "Available dumps in $DUMPS_DIR:"
  if [ -d "$DUMPS_DIR" ]; then
    ls -la "$DUMPS_DIR"/*.sql 2>/dev/null || echo "  No dump files found"
  else
    echo "  Dumps directory does not exist"
  fi
  exit 1
fi

echo "Restoring database from: $DUMP_FILE"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST"
echo ""

# Show file info
echo "Dump file size: $(ls -lh "$DUMP_FILE" | awk '{print $5}')"
echo "Dump file date: $(ls -l "$DUMP_FILE" | awk '{print $6, $7, $8}')"
echo ""

# Confirm before proceeding
read -p "This will COMPLETELY REPLACE the current database. Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Restore cancelled."
  exit 0
fi

# Export password for database commands
export PGPASSWORD=$DB_PASSWORD

echo "Starting database restore..."

# Restore database from dump
psql -U $DB_USER -h $DB_HOST -d postgres -f "$DUMP_FILE" --verbose

if [ $? -eq 0 ]; then
  echo ""
  echo "Database restore completed successfully!"
  echo "Restored from: $DUMP_FILE"
else
  echo ""
  echo "Database restore failed!"
  exit 1
fi 