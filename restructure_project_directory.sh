#!/bin/bash
# =============================================================================
# Project Directory Management Script for VERCEL Deployment
# Version 2.3.3 - Enhanced Visuals & GitHub Error Handling
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
#   • ANSI colors and Unicode characters for a polished look.
#   • GitHub push retry on non–fast-forward errors.
#
# References:
#   :contentReference[oaicite:0]{index=0}, :contentReference[oaicite:1]{index=1}
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

    local msg_len=${#message}
    local total_padding=$(( BOX_WIDTH - msg_len ))
    local left_padding=$(( total_padding / 2 ))
    local right_padding=$(( total_padding - left_padding ))
    
    printf "\n${BLUE}┏$(printf '━%.0s' $(seq 1 $BOX_WIDTH))┓${NC}\n"
    printf "${BLUE}┃${NC}%*s%s%*s${BLUE}┃${NC}\n" "$left_padding" "" "$message" "$right_padding" ""
    printf "${BLUE}┗$(printf '━%.0s' $(seq 1 $BOX_WIDTH))┛${NC}\n"
    
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
    # Use printf "%b" to interpret ANSI escapes in title text
    printf "${BLUE}┃${NC}%*s%b%*s${BLUE}┃${NC}\n" "$padding" "" " ${BOLD}${title}${NC}" "$padding" ""
    printf "${BLUE}┗$(printf '━%.0s' $(seq 1 $width))┛${NC}\n"
}
# -----------------------------
# Function: Initialize Git repository (with GitHub credentials)
initialize_git_repo() {
    show_section_header "Initializing Git Repository"
    
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
    
    if [ ! -f ".env" ]; then
        show_status "error" "Missing .env file. Please create it with your GitHub token"
        return 1
    fi
    
    # Source the .env file for GITHUB_TOKEN
    source .env
    if [ -z "$GITHUB_TOKEN" ]; then
        show_status "error" "GITHUB_TOKEN not found in .env file"
        return 1
    fi
    
    # Configure Git credentials using a secure helper
    git config --local credential.helper "store --file ~/.git-credentials-birth-time-rectifier"
    echo "https://${GITHUB_TOKEN}@github.com" > ~/.git-credentials-birth-time-rectifier
    chmod 600 ~/.git-credentials-birth-time-rectifier
    
    if ! git remote | grep -q "origin"; then
        git remote add origin "https://github.com/Victordtesla24/Birth-Time-Rectifier.git"
    fi
    
    if [ -f ".gitignore" ]; then
        if ! grep -q "^\.env$" .gitignore; then
            echo ".env" >> .gitignore
        fi
    else
        echo ".env" > .gitignore
    fi
    
    if [ -z "$(git config --get user.email)" ]; then
        git config --local user.email "victordtesla24@gmail.com"
        git config --local user.name "Victordtesla24"
    fi
    
    show_status "success" "Git repository initialized successfully"
    return 0
}

# -----------------------------
# Function: Commit and push changes to GitHub with retry on non-fast-forward error
commit_to_github() {
    show_section_header "Committing Changes to GitHub"
    
    initialize_git_repo
    if [ $? -ne 0 ]; then
        return 1
    fi
    
    show_status "info" "Fetching latest changes..."
    git fetch origin
    if [ $? -ne 0 ]; then
        show_status "error" "Failed to fetch from remote"
        return 1
    fi
    
    # Check branch status
    local LOCAL
    LOCAL=$(git rev-parse @)
    local REMOTE
    REMOTE=$(git rev-parse @{u} 2>/dev/null)
    local BASE
    BASE=$(git merge-base @ @{u} 2>/dev/null)
    
    if [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
        if [ "$LOCAL" = "$BASE" ]; then
            show_status "info" "Remote changes detected, pulling updates..."
            git pull --rebase origin main
            if [ $? -ne 0 ]; then
                show_status "error" "Failed to pull remote changes"
                return 1
            fi
        fi
    fi
    
    show_status "info" "Adding changes to Git..."
    git add .
    if [ $? -ne 0 ]; then
        show_status "error" "Failed to add changes to Git"
        return 1
    fi
    
    if git diff-index --quiet HEAD --; then
        show_status "info" "No changes to commit"
        return 0
    fi
    
    show_status "info" "Creating commit..."
    git commit -m "Project Directory Manager Backup commit"
    if [ $? -ne 0 ]; then
        show_status "error" "Failed to create commit"
        return 1
    fi
    
    show_status "info" "Pushing changes to GitHub..."
    git push -u origin main
    if [ $? -ne 0 ]; then
        show_status "warning" "Push failed, attempting to pull changes and push again..."
        git pull --rebase origin main
        if [ $? -ne 0 ]; then
            show_status "error" "Failed to pull remote changes during push retry"
            return 1
        fi
        git push -u origin main
        if [ $? -ne 0 ]; then
            show_status "error" "Failed to push changes to GitHub after retry"
            return 1
        fi
    fi
    
    show_status "success" "Changes successfully pushed to GitHub"
    return 0
}

# -----------------------------
# Function: Verify project structure with improved progress visuals
verify_structure() {
    echo -e "\n${BLUE}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${NC}"
    echo -e "${BLUE}┃${NC}     ${BOLD}VERCEL Project Structure Verification${NC}     ${BLUE}┃${NC}"
    echo -e "${BLUE}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${NC}\n"
    
    local errors=0
    local warnings=0
    local found_items=0
    local suggestions=()

    # Define required directories, files, and recommended patterns
    local required_dirs=( "src/pages" "src/pages/api" "public" "src/app" "src/app/api" "src/app/layout" "src/app/components" "src/components" "src/components/layout" "src/components/shared" "src/components/forms" "src/lib" "src/utils" "src/hooks" "src/context" "src/services" "src/api" "src/models" "src/types" "src/styles" "src/assets" "src/constants" "src/__tests__" "src/__tests__/unit" "src/__tests__/integration" "src/__tests__/e2e" "config" ".vercel" )
    local required_files=( "src/pages/_app.tsx" "src/pages/_document.tsx" "src/pages/index.tsx" "src/app/layout.tsx" "src/app/page.tsx" "next.config.js" "tsconfig.json" "package.json" ".env.local" "vercel.json" "README.md" "src/types/index.d.ts" "src/styles/globals.css" "jest.config.js" "src/setupTests.ts" )
    local recommended_patterns=( "src/middleware.ts" "src/pages/api/[...path].ts" "src/components/layout/Layout.tsx" "src/lib/auth.ts" "src/lib/db.ts" "src/lib/api-client.ts" "src/constants/index.ts" "src/types/index.ts" )

    echo -e "${CYAN}Phase 1:${NC} ${BOLD}Scanning Project Structure${NC}\n"
    local total_checks=$(( ${#required_dirs[@]} + ${#required_files[@]} + ${#recommended_patterns[@]} ))
    local current=0
    local tmp_dir
    tmp_dir=$(mktemp -d)
    local structure_report="${tmp_dir}/structure_report.txt"

    # Check required directories
    echo -e "${YELLOW}▶ Checking Required Directories${NC}"
    for dir in "${required_dirs[@]}"; do
        ((current++))
        show_progress $current $total_checks "$(printf "%b" "Checking: ${DIM}${dir}${NC}")"
        if [ ! -d "$dir" ]; then
            printf "\n${RED}✗ Missing:${NC} %s\n" "$dir" | tee -a "$structure_report"
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
        sleep 0.05
    done

    # Check required files
    echo -e "\n${YELLOW}▶ Checking Required Files${NC}"
    for file in "${required_files[@]}"; do
        ((current++))
        show_progress $current $total_checks "$(printf "%b" "Checking: ${DIM}${file}${NC}")"
        if [ ! -f "$file" ]; then
            printf "\n${RED}✗ Missing:${NC} %s\n" "$file" | tee -a "$structure_report"
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
        sleep 0.05
    done

    # Check recommended patterns
    echo -e "\n${YELLOW}▶ Checking Recommended Patterns${NC}"
    for pattern in "${recommended_patterns[@]}"; do
        ((current++))
        show_progress $current $total_checks "$(printf "%b" "Checking: ${DIM}${pattern}${NC}")"
        if [ ! -f "$pattern" ]; then
            printf "\n${YELLOW}⚠ Missing:${NC} %s\n" "$pattern" | tee -a "$structure_report"
            ((warnings++))
        else
            ((found_items++))
        fi
        sleep 0.05
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
            printf "%b\n" "$suggestion"
        done
        echo -e "\n${YELLOW}General Recommendations:${NC}"
        echo -e "1. ${CYAN}Initialize Next.js project:${NC}\n   npx create-next-app@latest --typescript"
        echo -e "2. ${CYAN}Setup testing infrastructure:${NC}\n   npm install --save-dev jest @testing-library/react @testing-library/jest-dom"
        echo -e "3. ${CYAN}Configure Vercel deployment:${NC}\n   npm install -g vercel && vercel login"
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
        # Use "%b" to interpret ANSI escape sequences in the header
        printf "${BLUE}┃${NC}%*s%b%*s${BLUE}┃${NC}\n" "$left_padding" "" " ${BOLD}${title}${NC}" "$right_padding" ""
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
