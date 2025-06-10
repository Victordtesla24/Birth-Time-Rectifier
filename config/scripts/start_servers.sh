#!/bin/bash

# Terminal colors and styling
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'
BOLD='\033[1m'

# Spinner frames
SPINNER_FRAMES=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")

# Progress bar function
progress_bar() {
    local duration=$1
    local width=50
    local progress=0
    local step=$((width * 100 / duration / 100))
    
    printf "["
    for ((i=0; i <= width; i++)); do
        printf " "
    done
    printf "] 0%%"
    
    for ((i=0; i <= duration; i++)); do
        sleep 0.1
        progress=$((i * step))
        printf "\r["
        for ((j=0; j < progress; j++)); do
            printf "="
        done
        printf ">"
        for ((j=progress; j < width; j++)); do
            printf " "
        done
        printf "] %d%%" $((i * 100 / duration))
    done
    printf "\n"
}

# Spinner function
spinner() {
    local pid=$1
    local message=$2
    local i=0
    while kill -0 $pid 2>/dev/null; do
        printf "\r${BLUE}${SPINNER_FRAMES[i]} %s...${NC}" "$message"
        i=$(((i + 1) % ${#SPINNER_FRAMES[@]}))
        sleep 0.1
    done
    printf "\r${GREEN}✓ %s... Done${NC}\n" "$message"
}

# Log message with timestamp
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$COMBINED_LOG"
}

# Set environment variables and paths
export PROJECT_ROOT="$(pwd)"
export PYTHONPATH="$PROJECT_ROOT"
export LOG_DIR="$PROJECT_ROOT/logs"
export TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"
mkdir -p "$LOG_DIR/archives"

# Function to check and kill process using a port
kill_port_process() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Port $port is in use. Stopping existing process...${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Function to check Python dependencies
check_python_deps() {
    echo -e "${BLUE}Checking Python dependencies...${NC}"
    local requirements_file="backend/requirements.txt"
    if [ ! -f "$requirements_file" ]; then
        echo -e "${RED}Error: requirements.txt not found${NC}"
        exit 1
    fi
    
    # Install virtualenv if not present
    if ! command -v virtualenv >/dev/null 2>&1; then
        pip install virtualenv >/dev/null 2>&1
    fi
    
    # Create and activate virtual environment if not exists
    if [ ! -d "venv" ]; then
        virtualenv venv >/dev/null 2>&1
    fi
    source venv/bin/activate
    
    # Install requirements
    pip install -r "$requirements_file" >/dev/null 2>&1 &
    spinner $! "Installing Python dependencies"
}

# Function to check Node.js dependencies
check_node_deps() {
    echo -e "${BLUE}Checking Node.js dependencies...${NC}"
    
    # Check if Node.js is installed
    if ! command -v node >/dev/null 2>&1; then
        echo -e "${RED}Error: Node.js is not installed${NC}"
        exit 1
    fi
    
    # Install npm dependencies
    if [ -f "package.json" ]; then
        npm install --silent &
        spinner $! "Installing Node.js dependencies"
    else
        echo -e "${RED}Error: package.json not found${NC}"
        exit 1
    fi
}

# Function to archive old logs
archive_old_logs() {
    find "$LOG_DIR" -name "*.log" -mtime +7 -exec mv {} "$LOG_DIR/archives/" \;
}

# Log management functions
cleanup_logs() {
    echo -e "${BLUE}Cleaning up old log files...${NC}"
    
    # Remove logs older than 7 days from archives
    find "$LOG_DIR/archives" -name "*.log" -mtime +7 -delete 2>/dev/null
    
    # Move logs older than 1 day to archives
    find "$LOG_DIR" -maxdepth 1 -name "*.log" -mtime +1 -exec mv {} "$LOG_DIR/archives/" \; 2>/dev/null
    
    # Keep only the last 5 log files in the main logs directory
    cd "$LOG_DIR" || return
    for type in backend frontend combined; do
        ls -t "${type}_"*.log 2>/dev/null | tail -n +6 | xargs -I {} mv {} archives/ 2>/dev/null
    done
    cd - > /dev/null || return
}

rotate_logs() {
    local max_size=$((10 * 1024 * 1024))  # 10MB
    
    for log_file in "$LOG_DIR"/*.log; do
        if [ -f "$log_file" ]; then
            current_size=$(stat -f%z "$log_file")
            if [ "$current_size" -gt "$max_size" ]; then
                echo -e "${YELLOW}Rotating log file: $(basename "$log_file")${NC}"
                mv "$log_file" "${log_file}.$(date +%Y%m%d_%H%M%S).old"
                touch "$log_file"
            fi
        fi
    done
}

flush_logs() {
    echo -e "${BLUE}Flushing log buffers...${NC}"
    sync
    if command -v purge >/dev/null 2>&1; then
        sudo purge
    fi
}

# Create logs directory and initialize
initialize_logs() {
    mkdir -p "$LOG_DIR/archives"
    cleanup_logs
    
    # Clear existing log files if they exist
    rm -f "$BACKEND_LOG" "$FRONTEND_LOG" "$COMBINED_LOG"
    
    # Create new log files
    touch "$BACKEND_LOG" "$FRONTEND_LOG" "$COMBINED_LOG"
    
    # Set up log rotation check interval
    (
        while true; do
            sleep 300  # Check every 5 minutes
            rotate_logs
            flush_logs
        done
    ) &
    LOG_MONITOR_PID=$!
}

# Enhance cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    
    if [ -n "$LOG_MONITOR_PID" ]; then
        kill $LOG_MONITOR_PID 2>/dev/null
    fi
    
    # Final log flush and cleanup
    flush_logs
    cleanup_logs
    
    wait
    echo -e "${GREEN}All servers stopped and logs cleaned up${NC}"
}

# Set trap for cleanup
trap cleanup EXIT

# Archive old logs
archive_old_logs

# Create new log files with timestamp
BACKEND_LOG="$LOG_DIR/backend_${TIMESTAMP}.log"
FRONTEND_LOG="$LOG_DIR/frontend_${TIMESTAMP}.log"
COMBINED_LOG="$LOG_DIR/combined_${TIMESTAMP}.log"

# Initialize logs before starting servers
initialize_logs

# Check and install dependencies
echo -e "${BOLD}Initializing Birth Time Rectifier${NC}"
check_python_deps
check_node_deps

# Kill any existing processes on required ports
kill_port_process 3333
kill_port_process 3001

# Start backend server
echo -e "\n${BLUE}Starting backend server...${NC}"
(uvicorn backend.server:app --host 0.0.0.0 --port 3333 --reload --log-level debug >> "$BACKEND_LOG" 2>&1 | tee -a "$COMBINED_LOG" > /dev/null) &
BACKEND_PID=$!

# Wait for backend to initialize with progress bar
echo -e "${BLUE}Waiting for backend to initialize...${NC}"
progress=0
while ! nc -z localhost 3333 2>/dev/null; do
    sleep 0.1
    progress=$((progress + 1))
    if [ $progress -ge 100 ]; then
        echo -e "${RED}Error: Backend server failed to start${NC}"
        exit 1
    fi
    printf "\rProgress: [%-50s] %d%%" "$(printf '=' %.0s $(seq 1 $((progress/2))))" $progress
done
echo -e "\n${GREEN}Backend server started successfully${NC}"

# Start frontend server
echo -e "\n${BLUE}Starting frontend server...${NC}"
(npm run dev >> "$FRONTEND_LOG" 2>&1 | tee -a "$COMBINED_LOG" > /dev/null) &
FRONTEND_PID=$!

# Wait for frontend to initialize with progress bar
echo -e "${BLUE}Waiting for frontend to initialize...${NC}"
progress=0
while ! nc -z localhost 3001 2>/dev/null; do
    sleep 0.1
    progress=$((progress + 1))
    if [ $progress -ge 100 ]; then
        echo -e "${RED}Error: Frontend server failed to start${NC}"
        exit 1
    fi
    printf "\rProgress: [%-50s] %d%%" "$(printf '=' %.0s $(seq 1 $((progress/2))))" $progress
done
echo -e "\n${GREEN}Frontend server started successfully${NC}"

# Open the application in default browser
sleep 2
echo -e "\n${BLUE}Opening application in browser...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3001 2>/dev/null
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3001 2>/dev/null
elif [[ "$OSTYPE" == "msys" ]]; then
    start http://localhost:3001 2>/dev/null
fi

# Monitor server status
echo -e "\n${GREEN}✓ Application started successfully${NC}"
echo -e "${BLUE}Logs are being written to:${NC}"
echo -e "Backend: ${YELLOW}$BACKEND_LOG${NC}"
echo -e "Frontend: ${YELLOW}$FRONTEND_LOG${NC}"
echo -e "Combined: ${YELLOW}$COMBINED_LOG${NC}"

# Keep script running and show only error and warning logs
echo -e "\n${BLUE}Monitoring logs (press Ctrl+C to exit):${NC}"
tail -f "$COMBINED_LOG" | grep -E "ERROR|WARN|error|warning" --color=always 