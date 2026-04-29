#!/bin/bash
# Sytra MCP Servers Setup Script
# Installs dependencies and builds all MCP servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

function print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

function check_prerequisites() {
    print_color "$CYAN" "\n=== Checking Prerequisites ==="
    
    if ! command -v node &> /dev/null; then
        print_color "$RED" "ERROR: Node.js not found"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
    print_color "$GREEN" "Node.js found: v$(node --version | sed 's/v//')"
    
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_color "$RED" "ERROR: Node.js version 18 or higher required"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_color "$RED" "ERROR: npm not found"
        exit 1
    fi
    
    print_color "$GREEN" "npm found: v$(npm --version)"
    
    if [ ! -d "mcp-servers" ]; then
        print_color "$RED" "ERROR: mcp-servers directory not found"
        exit 1
    fi
    
    print_color "$GREEN" "All prerequisites met\n"
}

function build_server() {
    local server_path=$1
    local server_name=$2
    
    print_color "$CYAN" "Building $server_name..."
    
    cd "$server_path"
    
    echo "  Installing dependencies..."
    npm install --ignore-scripts > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        print_color "$RED" "  FAILED: $server_name - npm install failed"
        cd - > /dev/null
        return 1
    fi
    
    echo "  Compiling TypeScript..."
    npm run build > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        print_color "$RED" "  FAILED: $server_name - npm run build failed"
        cd - > /dev/null
        return 1
    fi
    
    # Check for build output
    if [ -f "build/index.js" ] || [ -f "dist/index.js" ] || [ -n "$(find build -name 'index.js' 2>/dev/null)" ]; then
        print_color "$GREEN" "  SUCCESS: $server_name built"
        cd - > /dev/null
        return 0
    else
        print_color "$RED" "  FAILED: $server_name - Build output not found"
        cd - > /dev/null
        return 1
    fi
}

# Main execution
START_TIME=$(date +%s)

print_color "$CYAN" "\n========================================"
print_color "$CYAN" "  SYTRA MCP SERVERS SETUP SCRIPT"
print_color "$CYAN" "========================================\n"

check_prerequisites

declare -A results
total_servers=0
success_count=0

# Build shared library first
print_color "$MAGENTA" "=== Building Shared Library ==="
if build_server "mcp-servers/shared" "Shared Library"; then
    results["shared"]=1
    ((success_count++))
    
    # Create npm link for shared library
    print_color "$CYAN" "\nCreating npm link for shared library..."
    cd mcp-servers/shared
    npm link > /dev/null 2>&1
    cd - > /dev/null
else
    results["shared"]=0
fi
((total_servers++))

# Define all MCP servers
declare -a servers=(
    "mcp-servers/orchestrator:Orchestrator"
    "mcp-servers/code-generation:Code Generation"
    "mcp-servers/intelligence-amplification:Intelligence Amplification"
    "mcp-servers/memory-management:Memory Management"
    "mcp-servers/legacy-support:Legacy Support"
    "mcp-servers/performance-optimizer:Performance Optimizer"
    "mcp-servers/schema-intelligence:Schema Intelligence"
    "mcp-servers/sdlc-integration:SDLC Integration"
    "mcp-servers/security-guardrails:Security Guardrails"
    "mcp-servers/token-optimization:Token Optimization"
)

# Build all servers
print_color "$MAGENTA" "\n=== Building MCP Servers ==="

for server in "${servers[@]}"; do
    IFS=':' read -r path name <<< "$server"
    ((total_servers++))
    if build_server "$path" "$name"; then
        results["$name"]=1
        ((success_count++))
    else
        results["$name"]=0
    fi
done

# Build Dashboard API
print_color "$MAGENTA" "\n=== Setting Up Dashboard API ==="
((total_servers++))

if [ -d "dashboard-api/node_modules" ]; then
    print_color "$GREEN" "Dashboard API dependencies already installed"
    results["Dashboard API"]=1
    ((success_count++))
else
    print_color "$CYAN" "Installing Dashboard API dependencies..."
    cd dashboard-api
    echo "  Installing npm packages..."
    if npm install --silent > /dev/null 2>&1; then
        print_color "$GREEN" "  SUCCESS: Dashboard API ready"
        results["Dashboard API"]=1
        ((success_count++))
    else
        print_color "$RED" "  FAILED: Dashboard API - npm install failed"
        results["Dashboard API"]=0
    fi
    cd ..
fi

# Summary
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

print_color "$MAGENTA" "\n=== Build Summary ==="
print_color "$CYAN" "\nResults:"
print_color "$GRAY" "-----------------------------------------------------"

for key in "${!results[@]}"; do
    if [ "${results[$key]}" -eq 1 ]; then
        printf "  %-35s %s\n" "$key" "$(print_color "$GREEN" "SUCCESS")"
    else
        printf "  %-35s %s\n" "$key" "$(print_color "$RED" "FAILED")"
    fi
done | sort

print_color "$GRAY" "-----------------------------------------------------"

if [ $success_count -eq $total_servers ]; then
    SUMMARY_COLOR="$GREEN"
else
    SUMMARY_COLOR="$YELLOW"
fi

print_color "$SUMMARY_COLOR" "\n  Total: $success_count/$total_servers servers built successfully"
print_color "$GRAY" "  Duration: ${MINUTES}m ${SECONDS}s"

if [ $success_count -eq $total_servers ]; then
    print_color "$GREEN" "\nAll servers built successfully!"
    
    # Check if Docker is available for backend services
    print_color "$MAGENTA" "\n=== Backend Services & Dashboard Setup ==="
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_color "$GREEN" "Docker found: $DOCKER_VERSION"
        
        echo ""
        read -p "Would you like to start the backend services and dashboard now? (Y/N): " response
        
        if [[ "$response" =~ ^[Yy]$ ]]; then
            print_color "$CYAN" "\nStarting backend services..."
            cd services
            if docker-compose up -d; then
                print_color "$GREEN" "Backend services started successfully!"
            else
                print_color "$RED" "Failed to start Docker services"
            fi
            cd ..
            
            # Start Dashboard API
            print_color "$CYAN" "\nStarting Dashboard API..."
            cd dashboard-api
            node server.js > /dev/null 2>&1 &
            DASHBOARD_PID=$!
            cd ..
            
            sleep 2
            
            # Test if dashboard is responding
            DASHBOARD_READY=false
            for i in {1..15}; do
                if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
                    DASHBOARD_READY=true
                    break
                fi
                sleep 0.5
            done
            
            if [ "$DASHBOARD_READY" = true ]; then
                print_color "$GREEN" "Dashboard API started successfully!"
                print_color "$MAGENTA" "\n=== Service URLs ==="
                print_color "$CYAN" "\nBackend Services:"
                print_color "$WHITE" "  Security:      http://localhost:8001/docs"
                print_color "$WHITE" "  Code Gen:      http://localhost:8002/docs"
                print_color "$WHITE" "  Memory:        http://localhost:8003/docs"
                print_color "$WHITE" "  Intelligence:  http://localhost:8004/docs"
                print_color "$WHITE" "  Tokens:        http://localhost:8005/docs"
                print_color "$WHITE" "  SDLC:          http://localhost:8006/docs"
                print_color "$WHITE" "  Legacy:        http://localhost:8007/docs"
                print_color "$WHITE" "  Schema:        http://localhost:8008/docs"
                print_color "$WHITE" "  Performance:   http://localhost:8009/docs"
                print_color "$CYAN" "\nManagement Dashboard:"
                print_color "$GREEN" "  Dashboard:     http://localhost:3000"
                print_color "$YELLOW" "\nTo stop services:"
                print_color "$GRAY" "  Dashboard:     kill $DASHBOARD_PID"
                print_color "$GRAY" "  Backend:       cd services && docker-compose down"
            else
                print_color "$YELLOW" "WARNING: Dashboard may not have started correctly"
                print_color "$GRAY" "Check manually at: http://localhost:3000"
            fi
        else
            print_color "$YELLOW" "\nTo start services later:"
            print_color "$GRAY" "  Backend:   cd services && docker-compose up -d"
            print_color "$GRAY" "  Dashboard: cd dashboard-api && node server.js"
        fi
    else
        print_color "$YELLOW" "Docker not found. Backend services require Docker."
        print_color "$GRAY" "Install Docker from: https://www.docker.com/get-started"
        print_color "$CYAN" "\nYou can still start the Dashboard:"
        print_color "$GRAY" "  cd dashboard-api && node server.js"
    fi
    
    print_color "$CYAN" "\nNext steps:"
    print_color "$GRAY" "  1. Configure your IDE (see configs/ directory)"
    print_color "$GRAY" "  2. Update paths in config to match your installation"
    print_color "$GRAY" "  3. Ensure backend services are running (ports 8001-8009)"
    print_color "$GRAY" "  4. Access the dashboard at http://localhost:3000"
    print_color "$GRAY" "  5. Restart your IDE to load the MCP servers"
    print_color "$GRAY" "  6. Test with: 'sytra analyze this code...'"
    exit 0
else
    print_color "$YELLOW" "\nSome servers failed to build. Check the errors above."
    print_color "$CYAN" "\nTroubleshooting:"
    print_color "$GRAY" "  1. Check Node.js version (must be >= 18)"
    print_color "$GRAY" "  2. Clear node_modules: rm -rf mcp-servers/*/node_modules"
    print_color "$GRAY" "  3. Try building failed servers individually"
    print_color "$GRAY" "  4. Check the build logs for specific errors"
    exit 1
fi

# Made with Bob
