#!/bin/bash

# Copyright (c) 2025 HQC System Contributors
# Licensed under the GNU General Public License v3.0 (GPL-3.0)

# Script to export current PostgreSQL database to SQL dump file
# This dump can be used to seed new Docker installations

set -e

echo "ðŸš€ HQC System Database Export Script"
echo "===================================="

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "âš ï¸  Warning: .env file not found, using default values"
    POSTGRES_SERVER=${POSTGRES_SERVER:-localhost}
    POSTGRES_PORT=${POSTGRES_PORT:-5432}
    POSTGRES_USER=${POSTGRES_USER:-HQC System}
    POSTGRES_DB=${POSTGRES_DB:-HQC System}
fi

# Create data/seeds directory if not exists
SEED_DIR="./data/seeds"
mkdir -p "$SEED_DIR"

# Timestamp for backup file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="$SEED_DIR/HQC System_dump_$TIMESTAMP.sql"
LATEST_LINK="$SEED_DIR/HQC System_latest.sql"

echo "ðŸ“Š Database Information:"
echo "  - Server: $POSTGRES_SERVER:$POSTGRES_PORT"
echo "  - Database: $POSTGRES_DB"
echo "  - User: $POSTGRES_USER"
echo ""

echo "ðŸ’¾ Exporting database to: $DUMP_FILE"
echo "This may take a few minutes for 487K+ entities..."
echo ""

# Export database with custom format (includes schema + data)
# --clean: Clean (drop) database objects before recreating
# --if-exists: Use IF EXISTS when dropping objects
# --create: Include commands to create database
# --no-owner: Do not output commands to set ownership
# --no-acl: Do not output ACL (privileges) commands
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    -h "$POSTGRES_SERVER" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --clean \
    --if-exists \
    --create \
    --no-owner \
    --no-acl \
    --verbose \
    -f "$DUMP_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "âœ… Database exported successfully!"
    echo ""
    
    # Create symlink to latest dump
    ln -sf "$(basename "$DUMP_FILE")" "$LATEST_LINK"
    echo "ðŸ“Ž Created symlink: $LATEST_LINK -> $(basename "$DUMP_FILE")"
    echo ""
    
    # Get file size
    FILE_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
    echo "ðŸ“¦ Dump file size: $FILE_SIZE"
    echo "ðŸ“ Location: $DUMP_FILE"
    echo ""
    
    # Count lines (approximate indicator of data size)
    LINE_COUNT=$(wc -l < "$DUMP_FILE")
    echo "ðŸ“ Total lines: $LINE_COUNT"
    echo ""
    
    echo "ðŸŽ‰ Export complete! You can now:"
    echo "  1. Use this dump to seed new Docker installations"
    echo "  2. Share it with team members for consistent dev environments"
    echo "  3. Use it as a backup before making schema changes"
    echo ""
    echo "To import into Docker:"
    echo "  docker exec -i HQC System-postgres-prod psql -U HQC System < $DUMP_FILE"
    
else
    echo ""
    echo "âŒ Error: Database export failed!"
    exit 1
fi

