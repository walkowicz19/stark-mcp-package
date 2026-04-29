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
    print_color "$CYAN" "\nNext steps:"
    print_color "$GRAY" "  1. Configure your IDE (see configs/ directory)"
    print_color "$GRAY" "  2. Update paths in config to match your installation"
    print_color "$GRAY" "  3. Start the Sytra backend services"
    print_color "$GRAY" "  4. Restart your IDE to load the MCP servers"
    print_color "$GRAY" "  5. Test with: 'sytra analyze this code...'"
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
