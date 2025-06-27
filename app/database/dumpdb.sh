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

# Create dumps directory if it doesn't exist
DUMPS_DIR="$PROJECT_ROOT/database_dumps"
mkdir -p "$DUMPS_DIR"

# Generate timestamp for filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="$DUMPS_DIR/database_dump_$TIMESTAMP.sql"

echo "Dumping database to: $DUMP_FILE"

# Export password for database commands
export PGPASSWORD=$DB_PASSWORD

# Create database dump
pg_dump -U $DB_USER -h $DB_HOST -d $DB_NAME \
  --clean \
  --create \
  --if-exists \
  --verbose \
  --file="$DUMP_FILE"

if [ $? -eq 0 ]; then
  echo "Database dump completed successfully!"
  echo "Dump saved to: $DUMP_FILE"
  
  # Create a symlink to the latest dump
  LATEST_LINK="$DUMPS_DIR/latest_dump.sql"
  ln -sf "$(basename "$DUMP_FILE")" "$LATEST_LINK"
  echo "Latest dump symlink updated: $LATEST_LINK"
  
  # Show file size
  echo "Dump file size: $(ls -lh "$DUMP_FILE" | awk '{print $5}')"
else
  echo "Database dump failed!"
  exit 1
fi 