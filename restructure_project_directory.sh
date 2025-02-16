#!/bin/bash
# =============================================================================
# Project Directory Management Script for VERCEL Deployment
# Version 2.3.2 - Enhanced Visuals & Professional Terminal Output
#
# This script manages project directory structure, handles duplicate files,
# and ensures compliance with VERCEL deployment guidelines. It supports:
#   - Next.js/React with TypeScript
#   - Python backend with FastAPI
#   - Testing infrastructure & Docker deployment
#
# Improvements:
#   • Dynamic terminal width calculation for progress visuals.
#   • Smooth, consistently redrawn progress bar and spinner.
#   • Unicode and ANSI colors for a polished look.
#
# References:
#   :contentReference[oaicite:2]{index=2}, :contentReference[oaicite:3]{index=3}
# =============================================================================

# -----------------------------
# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'  # No Color

# Global box width for consistent visuals
BOX_WIDTH=70

# -----------------------------
# OS Detection
is_macos() {
    [[ "$OSTYPE" == "darwin"* ]]
}

# -----------------------------
# Enhanced Progress Bar Function (dynamically adjusts to terminal width)
show_progress() {
    local current=$1
    local total=$2
    local task_info="$3"
    local bar_width=50
    local progress=$(( current * bar_width / total ))
    local percent=$(( current * 100 / total ))
    local remaining=$(( total - current ))
    
    # Get terminal width to avoid overflow
    local term_width
    term_width=$(tput cols)
    
    # Clear the current line
    printf "\r\033[K"
    
    # Left delimiter
    printf "${BLUE}┃${NC} "
    
    # Draw progress bar
    for ((i=0; i<bar_width; i++)); do
        if [ $i -lt $progress ]; then
            if [ $i -lt $(( progress / 2 )) ]; then
                printf "${GREEN}█${NC}"
            else
                printf "${CYAN}█${NC}"
            fi
        elif [ $i -eq $progress ]; then
            printf "${YELLOW}▌${NC}"
        else
            printf "${DIM}▒${NC}"
        fi
    done
    
    # Right delimiter and percentage
    printf " ${BLUE}┃${NC} "
    if [ $percent -eq 100 ]; then
        printf "${GREEN}%3d%%${NC}" "$percent"
    else
        printf "${YELLOW}%3d%%${NC}" "$percent"
    fi
    
    # Spinner using an array of Unicode characters
    local spinner_chars=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
    local spinner_index=$(( current % ${#spinner_chars[@]} ))
    printf " ${CYAN}${spinner_chars[$spinner_index]}${NC}"
    
    # Print task info (truncate if necessary)
    if [ -n "$task_info" ]; then
        local max_length=$(( term_width - 100 ))
        if [ ${#task_info} -gt $max_length ]; then
            task_info="${task_info:0:$max_length}..."
        fi
        printf " ${DIM}%s${NC}" "$task_info"
    fi
    
    # Print remaining count if any
    if [ $remaining -gt 0 ]; then
        printf " ${MAGENTA}(%d remaining)${NC}" "$remaining"
    fi
}

# -----------------------------
# Enhanced Spinner Function
show_spinner() {
    local pid=$1
    local message="$2"
    local spinner_chars=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
    local delay=0.1

    # Draw a centered message box using BOX_WIDTH
    local msg_len=${#message}
    local total_padding=$(( BOX_WIDTH - msg_len ))
    local left_padding=$(( total_padding / 2 ))
    local right_padding=$(( total_padding - left_padding ))
    
    printf "\n${BLUE}┏$(printf '━%.0s' $(seq 1 $BOX_WIDTH))┓${NC}\n"
    printf "${BLUE}┃${NC}%*s%s%*s${BLUE}┃${NC}\n" "$left_padding" "" "$message" "$right_padding" ""
    printf "${BLUE}┗$(printf '━%.0s' $(seq 1 $BOX_WIDTH))┛${NC}\n"
    
    # Animate spinner
    while kill -0 "$pid" 2>/dev/null; do
        for spinner in "${spinner_chars[@]}"; do
            printf "\r${BLUE}[${NC}${CYAN}$spinner${NC}${BLUE}]${NC} ${DIM}Processing...${NC}"
            sleep "$delay"
        done
    done
    printf "\r${GREEN}✓${NC} ${BOLD}Complete${NC}\033[K\n"
}

# -----------------------------
# Enhanced Status Messages & Section Header
show_status() {
    local type=$1
    local message=$2
    case $type in
        "info")    printf "${BLUE}ℹ${NC} ${message}\n" ;;
        "success") printf "${GREEN}✓${NC} ${message}\n" ;;
        "warning") printf "${YELLOW}⚠${NC} ${message}\n" ;;
        "error")   printf "${RED}✖${NC} ${message}\n" ;;
        *)         printf "${message}\n" ;;
    esac
}

show_section_header() {
    local title=$1
    local width=68
    local padding=$(( (width - ${#title}) / 2 ))
    printf "\n${BLUE}┏$(printf '━%.0s' $(seq 1 $width))┓${NC}\n"
    printf "${BLUE}┃${NC}%*s${BOLD}%s${NC}%*s${BLUE}┃${NC}\n" "$padding" "" "$title" "$padding" ""
    printf "${BLUE}┗$(printf '━%.0s' $(seq 1 $width))┛${NC}\n"
}

# -----------------------------
# Enhanced Backup Function
create_backup() {
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="pre_reorganization_backup_${timestamp}"
    
    show_section_header "Creating Backup"
    show_status "info" "Initializing backup process..."
    
    mkdir -p "$backup_dir"
    
    local tmp_file
    tmp_file=$(mktemp)
    find . -type f > "$tmp_file"
    local total_files
    total_files=$(wc -l < "$tmp_file")
    local current=0
    
    while IFS= read -r file; do
        ((current++))
        show_progress $current $total_files "Backing up: ${file##*/}"
        cp --parents "$file" "$backup_dir" 2>/dev/null || true
    done < "$tmp_file"
    
    rm "$tmp_file"
    show_status "success" "Backup created successfully at: ${backup_dir}"
}
# -----------------------------
# Function: Find & show duplicate files with enhanced detection
find_duplicates() {
    echo -e "\n${BLUE}Scanning for duplicate files...${NC}"
    
    # Define directories to exclude
    local exclude_dirs="venv|node_modules|.git|.next|build|dist|coverage"
    
    # Create temporary files for results
    local tmp_dir
    tmp_dir=$(mktemp -d)
    local files_list="${tmp_dir}/files.txt"
    local duplicates_list="${tmp_dir}/duplicates.txt"
    
    # Find all files, excluding specified directories
    find . -type f -not -path "*/\.*" | grep -vE "/(${exclude_dirs})/" > "$files_list"
    
    # Count total files
    local total_files
    total_files=$(wc -l < "$files_list")
    local count=0
    
    echo -e "\n${GREEN}Analyzing files for duplicates...${NC}"
    
    while IFS= read -r file; do
        ((count++))
        show_progress $count $total_files "Analyzing: ${file##*/}"
        if [ -f "$file" ]; then
            # Use shasum for hash calculation (compatible with macOS and Linux)
            local hash
            hash=$(shasum "$file" | cut -d' ' -f1)
            echo "${hash}|${file}" >> "$duplicates_list"
        fi
    done < "$files_list"
    
    echo -e "\n\n${GREEN}Analysis complete. Duplicate files found:${NC}"
    
    local duplicate_found=0
    while IFS='|' read -r hash file; do
        local occurrences
        occurrences=$(grep "^${hash}|" "$duplicates_list" | wc -l)
        if [ "$occurrences" -gt 1 ]; then
            duplicate_found=1
            echo -e "${YELLOW}-----------------------------------------${NC}"
            echo -e "${BLUE}Files with hash: ${hash}${NC}"
            grep "^${hash}|" "$duplicates_list" | cut -d'|' -f2
            echo "Duplication: 100%"
        fi
    done < <(sort -u "$duplicates_list")
    
    if [ $duplicate_found -eq 0 ]; then
        echo -e "${GREEN}No duplicate files found.${NC}"
    fi
    
    rm -rf "$tmp_dir"
}

# -----------------------------
# Function: Remove duplicate/redundant files with progress
remove_duplicates() {
    echo -e "\n${BLUE}Removing duplicate files (preserving consolidated files)...${NC}"
    
    local tmp_dir
    tmp_dir=$(mktemp -d)
    local files_list="${tmp_dir}/files.txt"
    local duplicates_list="${tmp_dir}/duplicates.txt"
    
    local exclude_dirs="venv|node_modules|.git|.next|build|dist|coverage"
    
    find . -type f -not -path "*/\.*" | grep -vE "/(${exclude_dirs})/" > "$files_list"
    
    local total_files
    total_files=$(wc -l < "$files_list")
    local count=0
    
    echo -e "\n${YELLOW}Analyzing files...${NC}"
    
    while IFS= read -r file; do
        ((count++))
        show_progress $count $total_files "Processing: ${file##*/}"
        # Skip consolidated files
        if [[ "$file" == *".consolidated"* ]]; then
            continue
        fi
        if [ -f "$file" ]; then
            local hash
            hash=$(shasum "$file" | cut -d' ' -f1)
            echo "${hash}|${file}" >> "$duplicates_list"
        fi
    done < "$files_list"
    
    echo -e "\n\n${BLUE}Removing duplicates...${NC}"
    local total_duplicates=0
    local removed=0
    
    while IFS='|' read -r hash file; do
        local occurrences
        occurrences=$(grep "^${hash}|" "$duplicates_list" | wc -l)
        if [ "$occurrences" -gt 1 ]; then
            ((total_duplicates++))
        fi
    done < "$duplicates_list"
    
    while IFS='|' read -r hash file; do
        local first_file
        first_file=$(grep "^${hash}|" "$duplicates_list" | head -1 | cut -d'|' -f2)
        if [ "$file" != "$first_file" ]; then
            ((removed++))
            show_progress $removed $total_duplicates "Removing: ${file##*/}"
            rm "$file"
        fi
    done < "$duplicates_list"
    
    rm -rf "$tmp_dir"
    echo -e "\n${GREEN}Duplicate removal complete. Removed $removed files.${NC}"
}

# -----------------------------
# Function: Update import paths in a file
update_imports() {
    local file=$1
    local old_path=$2
    local new_path=$3
    
    echo -e "${BLUE}Updating imports in: ${file}${NC}"
    
    local tmp_file="${file}.tmp"
    case "${file##*.}" in
        ts|tsx|js|jsx)
            if is_macos; then
                sed -E "s|from ['\"]\\.\\./${old_path}|from '${new_path}|g" "$file" > "$tmp_file"
                sed -i '' "s|from ['\"]\\./${old_path}|from '${new_path}|g" "$tmp_file"
                sed -i '' "s|from ['\"]\@/${old_path}|from '${new_path}|g" "$tmp_file"
                sed -i '' "s|require(['\"]\\.\\./${old_path}|require('${new_path}|g" "$tmp_file"
                sed -i '' "s|require(['\"]\\./${old_path}|require('${new_path}|g" "$tmp_file"
                sed -i '' "s|require(['\"]\@/${old_path}|require('${new_path}|g" "$tmp_file"
            else
                sed -E "s|from ['\"]\\.\\./${old_path}|from '${new_path}|g" "$file" > "$tmp_file"
                sed -i "s|from ['\"]\\./${old_path}|from '${new_path}|g" "$tmp_file"
                sed -i "s|from ['\"]\@/${old_path}|from '${new_path}|g" "$tmp_file"
                sed -i "s|require(['\"]\\.\\./${old_path}|require('${new_path}|g" "$tmp_file"
                sed -i "s|require(['\"]\\./${old_path}|require('${new_path}|g" "$tmp_file"
                sed -i "s|require(['\"]\@/${old_path}|require('${new_path}|g" "$tmp_file"
            fi
            ;;
        py)
            if is_macos; then
                sed -i '' "s|from ${old_path//\//\.}|from ${new_path//\//\.}|g" "$file"
                sed -i '' "s|import ${old_path//\//\.}|import ${new_path//\//\.}|g" "$file"
            else
                sed -i "s|from ${old_path//\//\.}|from ${new_path//\//\.}|g" "$file"
                sed -i "s|import ${old_path//\//\.}|import ${new_path//\//\.}|g" "$file"
            fi
            ;;
    esac
    mv "$tmp_file" "$file"
}

# -----------------------------
# Function: Update all imports after restructuring
update_all_imports() {
    echo -e "\n${BLUE}Updating import paths across the project...${NC}"
    
    local tmp_dir
    tmp_dir=$(mktemp -d)
    local path_mapping="${tmp_dir}/path_mapping.txt"
    
    echo -e "\n${YELLOW}Building path mapping...${NC}"
    
    local total_files
    total_files=$(find ./src -type f | wc -l)
    local count=0
    
    find ./src -type f | while read -r file; do
        ((count++))
        show_progress $count $total_files "Scanning: ${file##*/}"
        if [[ -f "$file" ]]; then
            local ext="${file##*.}"
            if [[ "$ext" =~ ^(ts|tsx|js|jsx|py)$ ]]; then
                local rel_path="${file#./src/}"
                echo "${rel_path%/*}|@/${rel_path%/*}" >> "$path_mapping"
            fi
        fi
    done
    
    echo -e "\n\n${BLUE}Updating imports in files...${NC}"
    
    local total_updates
    total_updates=$(find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.py" \) | wc -l)
    local current=0
    
    find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.py" \) | while read -r file; do
        ((current++))
        show_progress $current $total_updates "Updating: ${file##*/}"
        while IFS='|' read -r old_path new_path; do
            update_imports "$file" "$old_path" "$new_path"
        done < "$path_mapping"
    done
    
    rm -rf "$tmp_dir"
    echo -e "\n${GREEN}Import paths updated successfully${NC}"
}

# -----------------------------
# Function: Update tsconfig/jsconfig paths
update_config_paths() {
    echo -e "\n${BLUE}Updating TypeScript/JavaScript configuration paths...${NC}"
    
    local config_files=("tsconfig.json" "jsconfig.json")
    for config_file in "${config_files[@]}"; do
        if [[ -f "$config_file" ]]; then
            echo -e "${YELLOW}Updating paths in ${config_file}...${NC}"
            local tmp_file="${config_file}.tmp"
            cat > "$tmp_file" << EOL
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@utils/*": ["./src/utils/*"],
      "@services/*": ["./src/services/*"],
      "@types/*": ["./src/types/*"],
      "@styles/*": ["./src/styles/*"],
      "@constants/*": ["./src/constants/*"],
      "@tests/*": ["./src/__tests__/*"]
    }
  }
}
EOL
            if [ -f "$config_file" ]; then
                if is_macos; then
                    jq -s '.[0] * .[1]' "$config_file" "$tmp_file" > "${tmp_file}.merged"
                else
                    jq -s '.[0] * .[1]' "$config_file" "$tmp_file" > "${tmp_file}.merged"
                fi
                mv "${tmp_file}.merged" "$config_file"
            else
                mv "$tmp_file" "$config_file"
            fi
        fi
    done
    echo -e "${GREEN}Configuration paths updated successfully${NC}"
}
# -----------------------------
# Function: Verify project structure with progress and VERCEL compliance
verify_structure() {
    echo -e "\n${BLUE}Verifying project structure against VERCEL deployment guidelines...${NC}"
    local errors=0
    local warnings=0
    local found_items=0

    # Define the VERCEL-prescribed directory structure
    local required_dirs=(
        "src/pages" "src/pages/api" "public" 
        "src/app" "src/app/api" "src/app/layout" "src/app/components"
        "src/components" "src/components/layout" "src/components/shared" "src/components/forms"
        "src/lib" "src/utils" "src/hooks" "src/context"
        "src/services" "src/api" "src/models" "src/types"
        "src/styles" "src/assets" "src/constants"
        "src/__tests__" "src/__tests__/unit" "src/__tests__/integration" "src/__tests__/e2e"
        "config" ".vercel"
    )
    
    local required_files=(
        "src/pages/_app.tsx" "src/pages/_document.tsx" "src/pages/index.tsx"
        "src/app/layout.tsx" "src/app/page.tsx"
        "next.config.js" "tsconfig.json" "package.json" ".env.local" "vercel.json"
        "README.md" "src/types/index.d.ts" "src/styles/globals.css"
        "jest.config.js" "src/setupTests.ts"
    )
    
    local recommended_patterns=(
        "src/middleware.ts" "src/pages/api/[...path].ts" "src/components/layout/Layout.tsx"
        "src/lib/auth.ts" "src/lib/db.ts" "src/lib/api-client.ts"
        "src/constants/index.ts" "src/types/index.ts"
    )
    
    echo -e "\n${YELLOW}Scanning current project structure...${NC}"
    local total_checks=$(( ${#required_dirs[@]} + ${#required_files[@]} + ${#recommended_patterns[@]} ))
    local current=0
    local tmp_dir
    tmp_dir=$(mktemp -d)
    local structure_report="${tmp_dir}/structure_report.txt"
    
    # Check required directories
    echo -e "\n${BLUE}Checking required directories...${NC}"
    for dir in "${required_dirs[@]}"; do
        ((current++))
        show_progress $current $total_checks "Analyzing: $dir"
        if [ ! -d "$dir" ]; then
            echo -e "\n${RED}Error: Required directory '$dir' is missing${NC}" | tee -a "$structure_report"
            ((errors++))
        else
            ((found_items++))
            # Specific checks for known directories
            case "$dir" in
                "src/pages")
                    if [ ! -f "$dir/_app.tsx" ] || [ ! -f "$dir/_document.tsx" ]; then
                        echo -e "${YELLOW}Warning: Missing core Next.js files in $dir${NC}" | tee -a "$structure_report"
                        ((warnings++))
                    fi
                    ;;
                "src/app")
                    if [ ! -f "$dir/layout.tsx" ] || [ ! -f "$dir/page.tsx" ]; then
                        echo -e "${YELLOW}Warning: Missing App Router files in $dir${NC}" | tee -a "$structure_report"
                        ((warnings++))
                    fi
                    ;;
                "src/components")
                    if [ ! -d "$dir/shared" ] || [ ! -d "$dir/layout" ]; then
                        echo -e "${YELLOW}Warning: Recommended component organization missing in $dir${NC}" | tee -a "$structure_report"
                        ((warnings++))
                    fi
                    ;;
            esac
        fi
        sleep 0.05
    done
    
    # Check required files
    echo -e "\n${BLUE}Checking required files...${NC}"
    for file in "${required_files[@]}"; do
        ((current++))
        show_progress $current $total_checks "Analyzing: $file"
        if [ ! -f "$file" ]; then
            echo -e "\n${RED}Error: Required file '$file' is missing${NC}" | tee -a "$structure_report"
            ((errors++))
        else
            ((found_items++))
            case "$file" in
                "next.config.js")
                    if ! grep -q "module.exports" "$file"; then
                        echo -e "${YELLOW}Warning: next.config.js might not be properly configured${NC}" | tee -a "$structure_report"
                        ((warnings++))
                    fi
                    ;;
                "vercel.json")
                    if ! grep -q "\"version\":" "$file"; then
                        echo -e "${YELLOW}Warning: vercel.json might be missing version configuration${NC}" | tee -a "$structure_report"
                        ((warnings++))
                    fi
                    ;;
                "tsconfig.json")
                    if ! grep -q "\"baseUrl\":" "$file"; then
                        echo -e "${YELLOW}Warning: tsconfig.json might be missing path configurations${NC}" | tee -a "$structure_report"
                        ((warnings++))
                    fi
                    ;;
            esac
        fi
        sleep 0.05
    done
    
    # Check recommended patterns
    echo -e "\n${BLUE}Checking recommended patterns...${NC}"
    for pattern in "${recommended_patterns[@]}"; do
        ((current++))
        show_progress $current $total_checks "Analyzing: $pattern"
        if [ ! -f "$pattern" ]; then
            echo -e "\n${YELLOW}Warning: Recommended pattern '$pattern' not found${NC}" | tee -a "$structure_report"
            ((warnings++))
        else
            ((found_items++))
        fi
        sleep 0.05
    done
    
    local total_items=$(( ${#required_dirs[@]} + ${#required_files[@]} + ${#recommended_patterns[@]} ))
    local mismatch_percentage=$(( (($total_items - $found_items) * 100) / $total_items ))
    
    echo -e "\n${BLUE}Structure Analysis Summary:${NC}"
    echo -e "╔════════════════════════════════════════════╗"
    echo -e "║ Structure Mismatch: ${RED}${mismatch_percentage}%${NC}                        ║"
    echo -e "║ Critical Errors: ${RED}${errors}${NC}                              ║"
    echo -e "║ Warnings: ${YELLOW}${warnings}${NC}                                  ║"
    echo -e "╚════════════════════════════════════════════╝"
    
    if [ -f "$structure_report" ]; then
        echo -e "\n${BLUE}Detailed Analysis Report:${NC}"
        cat "$structure_report"
    fi
    
    rm -rf "$tmp_dir"
    
    if [ $errors -eq 0 ]; then
        if [ $warnings -eq 0 ]; then
            echo -e "\n${GREEN}✓ Project structure fully compliant with VERCEL guidelines${NC}"
        else
            echo -e "\n${YELLOW}⚠️  Project structure mostly compliant, but has some recommendations to address${NC}"
        fi
        return 0
    else
        echo -e "\n${RED}✗ Project structure verification failed with $errors critical issues${NC}"
        return 1
    fi
}

# -----------------------------
# Main Professional Menu with Enhanced Visuals
main_menu() {
    while true; do
        clear
        # Centered header using BOX_WIDTH
        local title="Project Directory Management"
        local title_len=${#title}
        local total_padding=$(( BOX_WIDTH - title_len ))
        local left_padding=$(( total_padding / 2 ))
        local right_padding=$(( total_padding - left_padding ))
        
        printf "${BLUE}┏$(printf '━%.0s' $(seq 1 $BOX_WIDTH))┓${NC}\n"
        printf "${BLUE}┃${NC}%*s%s%*s${BLUE}┃${NC}\n" "$left_padding" "" "$title" "$right_padding" ""
        printf "${BLUE}┗$(printf '━%.0s' $(seq 1 $BOX_WIDTH))┛${NC}\n"
        
        # Display menu options
        printf "\n${CYAN}1.${NC} Find & show duplicates\n"
        printf "${CYAN}2.${NC} Remove duplicate, redundant files\n"
        printf "${CYAN}3.${NC} Restructure the directory\n"
        printf "${CYAN}4.${NC} Verify project structure\n"
        printf "${CYAN}5.${NC} Create backup\n"
        printf "${CYAN}6.${NC} Exit\n"
        
        printf "\n${CYAN}Enter your choice [1-6]: ${NC}"
        read choice
        
        case $choice in
            1)
                find_duplicates
                ;;
            2)
                show_status "warning" "This action will remove duplicate files"
                read -p "$(printf "${CYAN}Are you sure you want to proceed? (y/n): ${NC}")" confirm
                if [[ $confirm == [yY] ]]; then
                    remove_duplicates
                fi
                ;;
            3)
                show_status "warning" "This action will restructure your entire project"
                read -p "$(printf "${CYAN}Are you sure you want to proceed? (y/n): ${NC}")" confirm
                if [[ $confirm == [yY] ]]; then
                    create_backup
                    restructure_directory
                    verify_structure
                fi
                ;;
            4)
                verify_structure
                ;;
            5)
                create_backup
                ;;
            6)
                show_status "success" "Thank you for using the Project Directory Manager!"
                exit 0
                ;;
            *)
                show_status "error" "Invalid option. Please try again."
                ;;
        esac
        
        printf "\n${YELLOW}Press Enter to return to the menu...${NC}"
        read
    done
}

# -----------------------------
# Start the script with the enhanced main menu
main_menu
