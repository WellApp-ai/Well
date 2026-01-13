#!/bin/bash

# Cursor Rules Installer
# Usage: ./install.sh /path/to/your/project

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(dirname "$SCRIPT_DIR")"
TARGET_DIR="${1:-.}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║          🎯 Cursor Rules Installer                       ║"
echo "║          AI-Assisted Development Workflow                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Validate target directory
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}Error: Directory '$TARGET_DIR' does not exist${NC}"
    exit 1
fi

TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"
CURSOR_DIR="$TARGET_DIR/.cursor"
RULES_DIR="$CURSOR_DIR/rules"

echo -e "${YELLOW}Target project: ${NC}$TARGET_DIR"
echo ""

# Check for existing rules
if [ -d "$RULES_DIR" ]; then
    echo -e "${YELLOW}⚠️  Existing .cursor/rules found!${NC}"
    echo ""
    read -p "Choose action: [B]ackup and replace, [M]erge, [C]ancel? " -n 1 -r
    echo ""
    
    case $REPLY in
        [Bb])
            BACKUP_DIR="$CURSOR_DIR/rules.backup.$(date +%Y%m%d_%H%M%S)"
            echo -e "${BLUE}Backing up to: $BACKUP_DIR${NC}"
            mv "$RULES_DIR" "$BACKUP_DIR"
            ;;
        [Mm])
            echo -e "${BLUE}Merging mode: existing files will be preserved${NC}"
            MERGE_MODE=true
            ;;
        *)
            echo -e "${RED}Installation cancelled${NC}"
            exit 0
            ;;
    esac
fi

# Create directory structure
echo ""
echo -e "${BLUE}📁 Creating directory structure...${NC}"
mkdir -p "$RULES_DIR/modes"
mkdir -p "$RULES_DIR/skills"

# Copy rules
echo -e "${BLUE}📄 Copying rules...${NC}"

copy_if_not_exists() {
    local src="$1"
    local dest="$2"
    
    if [ "$MERGE_MODE" = true ] && [ -f "$dest" ]; then
        echo -e "  ${YELLOW}Skip${NC} $(basename "$dest") (exists)"
    else
        cp "$src" "$dest"
        echo -e "  ${GREEN}✓${NC} $(basename "$dest")"
    fi
}

# Copy main rules
for file in "$SOURCE_DIR/rules"/*.mdc; do
    if [ -f "$file" ]; then
        copy_if_not_exists "$file" "$RULES_DIR/$(basename "$file")"
    fi
done

# Copy modes
echo ""
echo -e "${BLUE}🔄 Copying modes...${NC}"
for file in "$SOURCE_DIR/modes"/*.mdc; do
    if [ -f "$file" ]; then
        copy_if_not_exists "$file" "$RULES_DIR/modes/$(basename "$file")"
    fi
done

# Copy skills
echo ""
echo -e "${BLUE}🛠️  Copying skills...${NC}"
for skill_dir in "$SOURCE_DIR/skills"/*/; do
    if [ -d "$skill_dir" ]; then
        skill_name=$(basename "$skill_dir")
        mkdir -p "$RULES_DIR/skills/$skill_name"
        
        for file in "$skill_dir"*; do
            if [ -f "$file" ]; then
                copy_if_not_exists "$file" "$RULES_DIR/skills/$skill_name/$(basename "$file")"
            fi
        done
    fi
done

# Summary
echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║          ✅ Installation Complete!                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo "Installed to: $RULES_DIR"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Customize hard rules for your stack:"
echo "   ${BLUE}$RULES_DIR/00-hard-rules.mdc${NC}"
echo ""
echo "2. Update tech-specific rules:"
echo "   ${BLUE}$RULES_DIR/01-web.mdc${NC} (frontend)"
echo "   ${BLUE}$RULES_DIR/02-api.mdc${NC} (backend)"
echo ""
echo "3. Configure MCP tools:"
echo "   ${BLUE}$RULES_DIR/04-mcp-tools.mdc${NC}"
echo ""
echo "4. Remove unused skills:"
echo "   ${BLUE}ls $RULES_DIR/skills/${NC}"
echo ""
echo -e "${GREEN}Start coding with: 'init [your task]'${NC}"
echo ""
