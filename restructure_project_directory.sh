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
# Function: Restructure project directory
restructure_directory() {
    show_section_header "Restructuring Project Directory"
    
    # Create required directories if they don't exist
    local directories=(
        "src/pages" "src/pages/api"
        "src/app" "src/app/api" "src/app/layout" "src/app/components"
        "src/components" "src/components/layout" "src/components/shared" "src/components/forms"
        "src/lib" "src/utils" "src/hooks" "src/context"
        "src/services" "src/api" "src/models" "src/types"
        "src/styles" "src/assets" "src/constants"
        "src/__tests__" "src/__tests__/unit" "src/__tests__/integration" "src/__tests__/e2e"
        "config" "public"
    )
    
    local total_dirs=${#directories[@]}
    local current=0
    
    for dir in "${directories[@]}"; do
        ((current++))
        show_progress $current $total_dirs "Creating directory: $dir"
        mkdir -p "$dir"
    done
    
    # Update import paths
    update_all_imports
    
    # Update configuration files
    update_config_paths
    
    show_status "success" "Directory restructuring completed successfully"
}

# -----------------------------
# Function: Initialize Git repository and push to GitHub
initialize_git_repo() {
    show_section_header "Initializing Git Repository"
    
    # Check if .git directory exists
    if [ -d ".git" ]; then
        show_status "info" "Git repository already initialized"
    else
        show_status "info" "Initializing new Git repository..."
        git init
        if [ $? -ne 0 ]; then
            show_status "error" "Failed to initialize Git repository"
            return 1
        fi
    fi
    
    # Check if .env file exists and contains GITHUB_TOKEN
    if [ ! -f ".env" ]; then
        show_status "error" "Missing .env file. Please create it with your GitHub token"
        return 1
    fi
    
    # Source the .env file to get GITHUB_TOKEN
    source .env
    if [ -z "$GITHUB_TOKEN" ]; then
        show_status "error" "GITHUB_TOKEN not found in .env file"
        return 1
    fi
    
    # Configure Git with token (more secure method)
    git config --local credential.helper 'store --file ~/.git-credentials-birth-time-rectifier'
    echo "https://${GITHUB_TOKEN}@github.com" > ~/.git-credentials-birth-time-rectifier
    chmod 600 ~/.git-credentials-birth-time-rectifier
    
    # Add remote if not exists
    if ! git remote | grep -q "origin"; then
        git remote add origin "https://github.com/Victordtesla24/Birth-Time-Rectifier.git"
    fi
    
    # Ensure .env is ignored
    if [ -f ".gitignore" ]; then
        if ! grep -q "^\.env$" .gitignore; then
            echo ".env" >> .gitignore
        fi
    else
        echo ".env" > .gitignore
    fi
    
    show_status "success" "Git repository initialized successfully"
    return 0
}

# -----------------------------
# Function: Commit and push changes to GitHub
commit_to_github() {
    show_section_header "Committing Changes to GitHub"
    
    # Initialize Git repository if needed
    initialize_git_repo
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    # Add all changes
    show_status "info" "Adding changes to Git..."
    git add .
    if [ $? -ne 0 ]; then
        show_status "error" "Failed to add changes to Git"
        return 1
    fi
    
    # Create commit
    show_status "info" "Creating commit..."
    git commit -m "Project Directory Manager Backup commit"
    if [ $? -ne 0 ]; then
        show_status "error" "Failed to create commit"
        return 1
    fi
    
    # Push changes
    show_status "info" "Pushing changes to GitHub..."
    git push origin main
    if [ $? -ne 0 ]; then
        show_status "error" "Failed to push changes to GitHub"
        return 1
    fi
    
    show_status "success" "Changes successfully pushed to GitHub"
    return 0
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
    echo -e "\n${BLUE}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${NC}"
    echo -e "${BLUE}┃${NC}     ${BOLD}VERCEL Project Structure Verification${NC}     ${BLUE}┃${NC}"
    echo -e "${BLUE}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${NC}\n"
    
    local errors=0
    local warnings=0
    local found_items=0
    local suggestions=()

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
    
    echo -e "${CYAN}Phase 1:${NC} ${BOLD}Scanning Project Structure${NC}\n"
    local total_checks=$(( ${#required_dirs[@]} + ${#required_files[@]} + ${#recommended_patterns[@]} ))
    local current=0
    local tmp_dir=$(mktemp -d)
    local structure_report="${tmp_dir}/structure_report.txt"
    
    # Check required directories with enhanced progress bar
    echo -e "${YELLOW}▶ Checking Required Directories${NC}"
    for dir in "${required_dirs[@]}"; do
        ((current++))
        
        # Calculate progress
        local width=50
        local progress=$(( current * width / total_checks ))
        local percent=$(( current * 100 / total_checks ))
        
        # Clear line and move cursor to start
        printf "\r\033[K"
        
        # Draw box container with fixed width
        printf "${BLUE}┃${NC} "
        
        # Draw progress bar with gradient and fixed width
        for ((i=0; i<width; i++)); do
            if [ $i -lt $progress ]; then
                if [ $i -lt $(( progress / 2 )) ]; then
                    printf "${GREEN}█${NC}"
                else
                    printf "${CYAN}█${NC}"
                fi
            elif [ $i -eq $progress ]; then
                printf "${YELLOW}▌${NC}"
            else
                printf "${DIM}░${NC}"
            fi
        done
        
        # Draw right border and percentage with fixed width
        printf " ${BLUE}┃${NC} "
        if [ $percent -eq 100 ]; then
            printf "${GREEN}%3d%%${NC}" "$percent"
        else
            printf "${YELLOW}%3d%%${NC}" "$percent"
        fi
        
        # Draw spinner with fixed width
        local spinchars=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
        printf " ${CYAN}%s${NC}" "${spinchars[current % 10]}"
        
        # Draw task info with fixed width and proper escaping
        printf " %-40s" "Checking: ${DIM}${dir}${NC}"
        
        # Add small delay for smooth animation
        sleep 0.05
        
        # Handle missing directories with proper formatting
        if [ ! -d "$dir" ]; then
            printf "\n${RED}✗ Missing:${NC} %s\n" "$dir"
            ((errors++))
            case "$dir" in
                "src/app")
                    suggestions+=("${CYAN}→ Create Next.js App Router structure:${NC}\n   mkdir -p src/app && touch src/app/page.tsx src/app/layout.tsx")
                    ;;
                "src/components/layout")
                    suggestions+=("${CYAN}→ Setup component architecture:${NC}\n   mkdir -p src/components/{layout,shared,forms}")
                    ;;
                ".vercel")
                    suggestions+=("${CYAN}→ Initialize Vercel:${NC}\n   vercel login && vercel link")
                    ;;
                *)
                    suggestions+=("${CYAN}→ Create directory:${NC}\n   mkdir -p $dir")
                    ;;
            esac
        else
            ((found_items++))
        fi
    done

    # Check required files with enhanced progress bar
    echo -e "\n\n${YELLOW}▶ Checking Required Files${NC}"
    for file in "${required_files[@]}"; do
        ((current++))
        
        # Calculate progress
        local width=50
        local progress=$(( current * width / total_checks ))
        local percent=$(( current * 100 / total_checks ))
        
        # Clear line and move cursor to start
        printf "\r\033[K"
        
        # Draw box container with fixed width
        printf "${BLUE}┃${NC} "
        
        # Draw progress bar with gradient and fixed width
        for ((i=0; i<width; i++)); do
            if [ $i -lt $progress ]; then
                if [ $i -lt $(( progress / 2 )) ]; then
                    printf "${GREEN}█${NC}"
                else
                    printf "${CYAN}█${NC}"
                fi
            elif [ $i -eq $progress ]; then
                printf "${YELLOW}▌${NC}"
            else
                printf "${DIM}░${NC}"
            fi
        done
        
        # Draw right border and percentage with fixed width
        printf " ${BLUE}┃${NC} "
        if [ $percent -eq 100 ]; then
            printf "${GREEN}%3d%%${NC}" "$percent"
        else
            printf "${YELLOW}%3d%%${NC}" "$percent"
        fi
        
        # Draw spinner with fixed width
        local spinchars=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
        printf " ${CYAN}%s${NC}" "${spinchars[current % 10]}"
        
        # Draw task info with fixed width and proper escaping
        printf " %-40s" "Checking: ${DIM}${file}${NC}"
        
        # Add small delay for smooth animation
        sleep 0.05
        
        # Handle missing files with proper formatting
        if [ ! -f "$file" ]; then
            printf "\n${RED}✗ Missing:${NC} %s\n" "$file"
            ((errors++))
        else
            ((found_items++))
            case "$file" in
                "next.config.js")
                    if ! grep -q "module.exports" "$file"; then
                        printf "\n${YELLOW}⚠ Warning:${NC} next.config.js might not be properly configured\n"
                        ((warnings++))
                    fi
                    ;;
                "vercel.json")
                    if ! grep -q "\"version\":" "$file"; then
                        printf "\n${YELLOW}⚠ Warning:${NC} vercel.json might be missing version configuration\n"
                        ((warnings++))
                    fi
                    ;;
                "tsconfig.json")
                    if ! grep -q "\"baseUrl\":" "$file"; then
                        printf "\n${YELLOW}⚠ Warning:${NC} tsconfig.json might be missing path configurations\n"
                        ((warnings++))
                    fi
                    ;;
            esac
        fi
    done

    # Check recommended patterns with enhanced progress bar
    echo -e "\n\n${YELLOW}▶ Checking Recommended Patterns${NC}"
    for pattern in "${recommended_patterns[@]}"; do
        ((current++))
        
        # Calculate progress
        local width=50
        local progress=$(( current * width / total_checks ))
        local percent=$(( current * 100 / total_checks ))
        
        # Clear line and move cursor to start
        printf "\r\033[K"
        
        # Draw box container with fixed width
        printf "${BLUE}┃${NC} "
        
        # Draw progress bar with gradient and fixed width
        for ((i=0; i<width; i++)); do
            if [ $i -lt $progress ]; then
                if [ $i -lt $(( progress / 2 )) ]; then
                    printf "${GREEN}█${NC}"
                else
                    printf "${CYAN}█${NC}"
                fi
            elif [ $i -eq $progress ]; then
                printf "${YELLOW}▌${NC}"
            else
                printf "${DIM}░${NC}"
            fi
        done
        
        # Draw right border and percentage with fixed width
        printf " ${BLUE}┃${NC} "
        if [ $percent -eq 100 ]; then
            printf "${GREEN}%3d%%${NC}" "$percent"
        else
            printf "${YELLOW}%3d%%${NC}" "$percent"
        fi
        
        # Draw spinner with fixed width
        local spinchars=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
        printf " ${CYAN}%s${NC}" "${spinchars[current % 10]}"
        
        # Draw task info with fixed width and proper escaping
        printf " %-40s" "Checking: ${DIM}${pattern}${NC}"
        
        # Add small delay for smooth animation
        sleep 0.05
        
        # Handle missing patterns with proper formatting
        if [ ! -f "$pattern" ]; then
            printf "\n${YELLOW}⚠ Missing:${NC} %s\n" "$pattern"
            ((warnings++))
        else
            ((found_items++))
        fi
    done

    local total_items=$(( ${#required_dirs[@]} + ${#required_files[@]} + ${#recommended_patterns[@]} ))
    local mismatch_percentage=$(( (($total_items - $found_items) * 100) / $total_items ))
    
    echo -e "\n\n${BLUE}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${NC}"
    echo -e "${BLUE}┃${NC}     ${BOLD}Verification Summary${NC}     ${BLUE}┃${NC}"
    echo -e "${BLUE}┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫${NC}"
    printf "${BLUE}┃${NC} %-20s ${RED}%3d%%${NC}                                        ${BLUE}┃${NC}\n" "Structure Mismatch:" "$mismatch_percentage"
    printf "${BLUE}┃${NC} %-20s ${RED}%3d${NC}                                           ${BLUE}┃${NC}\n" "Critical Errors:" "$errors"
    printf "${BLUE}┃${NC} %-20s ${YELLOW}%3d${NC}                                           ${BLUE}┃${NC}\n" "Warnings:" "$warnings"
    echo -e "${BLUE}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${NC}"

    if [ ${#suggestions[@]} -gt 0 ]; then
        echo -e "\n${BLUE}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${NC}"
        echo -e "${BLUE}┃${NC}     ${BOLD}Suggested Actions${NC}     ${BLUE}┃${NC}"
        echo -e "${BLUE}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${NC}"
        echo -e "\n${YELLOW}To fix the identified issues, consider the following steps:${NC}\n"
        for suggestion in "${suggestions[@]}"; do
            echo -e "$suggestion"
        done
        
        # Add general recommendations
        echo -e "\n${YELLOW}General Recommendations:${NC}"
        echo -e "1. ${CYAN}Initialize Next.js project:${NC}"
        echo -e "   npx create-next-app@latest --typescript"
        echo -e "2. ${CYAN}Setup testing infrastructure:${NC}"
        echo -e "   npm install --save-dev jest @testing-library/react @testing-library/jest-dom"
        echo -e "3. ${CYAN}Configure Vercel deployment:${NC}"
        echo -e "   npm install -g vercel && vercel login"
    fi

    rm -rf "$tmp_dir"
    
    if [ $errors -eq 0 ]; then
        if [ $warnings -eq 0 ]; then
            echo -e "\n${GREEN}✓ Project structure fully compliant with VERCEL guidelines${NC}"
        else
            echo -e "\n${YELLOW}⚠️  Project structure mostly compliant, with minor recommendations${NC}"
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
        printf "${CYAN}5.${NC} Commit changes to GitHub\n"
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
                    commit_to_github
                fi
                ;;
            3)
                show_status "warning" "This action will restructure your entire project"
                read -p "$(printf "${CYAN}Are you sure you want to proceed? (y/n): ${NC}")" confirm
                if [[ $confirm == [yY] ]]; then
                    restructure_directory
                    verify_structure
                    commit_to_github
                fi
                ;;
            4)
                verify_structure
                ;;
            5)
                commit_to_github
                ;;
            6)
                show_status "success" "Thank you for using the Project Directory Manager! Have a great day!"
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
