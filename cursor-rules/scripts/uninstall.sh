#!/bin/bash

# Cursor Rules Uninstaller
# Usage: ./uninstall.sh /path/to/your/project

set -e

TARGET_DIR="${1:-.}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}Error: Directory '$TARGET_DIR' does not exist${NC}"
    exit 1
fi

TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"
RULES_DIR="$TARGET_DIR/.cursor/rules"

if [ ! -d "$RULES_DIR" ]; then
    echo -e "${YELLOW}No .cursor/rules found in $TARGET_DIR${NC}"
    exit 0
fi

echo -e "${YELLOW}This will remove: $RULES_DIR${NC}"
echo ""
read -p "Are you sure? [y/N] " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Cancelled${NC}"
    exit 0
fi

# Backup first
BACKUP_DIR="$TARGET_DIR/.cursor/rules.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${YELLOW}Backing up to: $BACKUP_DIR${NC}"
mv "$RULES_DIR" "$BACKUP_DIR"

echo -e "${GREEN}✓ Rules removed (backup saved)${NC}"
echo ""
echo "To restore: mv $BACKUP_DIR $RULES_DIR"
