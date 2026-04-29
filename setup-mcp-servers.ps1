# Sytra MCP Servers Setup Script
# Installs dependencies and builds all MCP servers

param(
    [switch]$SkipShared
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-Prerequisites {
    Write-ColorOutput "`n=== Checking Prerequisites ===" "Cyan"
    
    try {
        $nodeVersion = node --version
        Write-ColorOutput "Node.js found: $nodeVersion" "Green"
        
        $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($versionNumber -lt 18) {
            Write-ColorOutput "ERROR: Node.js version 18 or higher required" "Red"
            exit 1
        }
    }
    catch {
        Write-ColorOutput "ERROR: Node.js not found" "Red"
        exit 1
    }
    
    try {
        $npmVersion = npm --version
        Write-ColorOutput "npm found: v$npmVersion" "Green"
    }
    catch {
        Write-ColorOutput "ERROR: npm not found" "Red"
        exit 1
    }
    
    if (-not (Test-Path "mcp-servers")) {
        Write-ColorOutput "ERROR: mcp-servers directory not found" "Red"
        exit 1
    }
    
    Write-ColorOutput "All prerequisites met`n" "Green"
}

function Build-Server {
    param(
        [string]$ServerPath,
        [string]$ServerName,
        [bool]$LinkShared = $false
    )
    
    Write-ColorOutput "Building $ServerName..." "Cyan"
    
    Push-Location $ServerPath
    try {
        # If this server needs the shared library, link it first
        if ($LinkShared) {
            Write-Host "  Linking shared library..." -ForegroundColor Gray
            $sharedPath = Resolve-Path "../shared"
            npm link "$sharedPath" 2>&1 | Out-Null
        }
        
        Write-Host "  Installing dependencies..." -ForegroundColor Gray
        npm install --ignore-scripts 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed"
        }
        
        Write-Host "  Compiling TypeScript..." -ForegroundColor Gray
        npm run build 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "npm run build failed"
        }
        
        # Check for build output in multiple possible locations
        $buildPaths = @(
            "build/index.js",
            "dist/index.js",
            "build/*/src/index.js"
        )
        
        $found = $false
        foreach ($pattern in $buildPaths) {
            if (Test-Path $pattern) {
                $found = $true
                break
            }
        }
        
        if ($found) {
            Write-ColorOutput "  SUCCESS: $ServerName built" "Green"
            return $true
        }
        else {
            throw "Build output not found"
        }
    }
    catch {
        Write-ColorOutput "  FAILED: $ServerName - $_" "Red"
        return $false
    }
    finally {
        Pop-Location
    }
}

# Main execution
$startTime = Get-Date

Write-ColorOutput "`n========================================" "Cyan"
Write-ColorOutput "  SYTRA MCP SERVERS SETUP SCRIPT" "Cyan"
Write-ColorOutput "========================================`n" "Cyan"

Test-Prerequisites

$results = @{}
$totalServers = 0
$successCount = 0

# Build shared library first
if (-not $SkipShared) {
    Write-ColorOutput "=== Building Shared Library ===" "Magenta"
    $results["shared"] = Build-Server -ServerPath "mcp-servers/shared" -ServerName "Shared Library"
    $totalServers++
    if ($results["shared"]) {
        $successCount++
        
        # Create npm link for shared library
        Write-ColorOutput "`nCreating npm link for shared library..." "Cyan"
        Push-Location "mcp-servers/shared"
        npm link 2>&1 | Out-Null
        Pop-Location
    }
}
else {
    Write-ColorOutput "`nSkipping shared library build" "Yellow"
}

# Define all MCP servers (npm link disabled - using direct source includes)
$servers = @(
    @{ Path = "mcp-servers/orchestrator"; Name = "Orchestrator"; NeedsShared = $false }
    @{ Path = "mcp-servers/code-generation"; Name = "Code Generation"; NeedsShared = $false }
    @{ Path = "mcp-servers/intelligence-amplification"; Name = "Intelligence Amplification"; NeedsShared = $false }
    @{ Path = "mcp-servers/memory-management"; Name = "Memory Management"; NeedsShared = $false }
    @{ Path = "mcp-servers/legacy-support"; Name = "Legacy Support"; NeedsShared = $false }
    @{ Path = "mcp-servers/performance-optimizer"; Name = "Performance Optimizer"; NeedsShared = $false }
    @{ Path = "mcp-servers/schema-intelligence"; Name = "Schema Intelligence"; NeedsShared = $false }
    @{ Path = "mcp-servers/sdlc-integration"; Name = "SDLC Integration"; NeedsShared = $false }
    @{ Path = "mcp-servers/security-guardrails"; Name = "Security Guardrails"; NeedsShared = $false }
    @{ Path = "mcp-servers/token-optimization"; Name = "Token Optimization"; NeedsShared = $false }
)

# Build all servers
Write-ColorOutput "`n=== Building MCP Servers ===" "Magenta"

foreach ($server in $servers) {
    $totalServers++
    $results[$server.Name] = Build-Server -ServerPath $server.Path -ServerName $server.Name -LinkShared $server.NeedsShared
    if ($results[$server.Name]) {
        $successCount++
    }
}

# Summary
$endTime = Get-Date
$duration = $endTime - $startTime

Write-ColorOutput "`n=== Build Summary ===" "Magenta"
Write-ColorOutput "`nResults:" "Cyan"
Write-ColorOutput "-----------------------------------------------------" "Gray"

foreach ($key in ($results.Keys | Sort-Object)) {
    if ($results[$key]) {
        $status = "SUCCESS"
        $color = "Green"
    }
    else {
        $status = "FAILED"
        $color = "Red"
    }
    $line = "  {0,-35} {1}" -f $key, $status
    Write-ColorOutput $line $color
}

Write-ColorOutput "-----------------------------------------------------" "Gray"

if ($successCount -eq $totalServers) {
    $summaryColor = "Green"
}
else {
    $summaryColor = "Yellow"
}

$summaryLine = "`n  Total: {0}/{1} servers built successfully" -f $successCount, $totalServers
Write-ColorOutput $summaryLine $summaryColor

$durationLine = "  Duration: {0:mm}m {0:ss}s" -f $duration
Write-ColorOutput $durationLine "Gray"

if ($successCount -eq $totalServers) {
    Write-ColorOutput "`nAll servers built successfully!" "Green"
    Write-ColorOutput "`nNext steps:" "Cyan"
    Write-ColorOutput "  1. Configure your IDE (see configs/ directory)" "Gray"
    Write-ColorOutput "  2. Update paths in config to match your installation" "Gray"
    Write-ColorOutput "  3. Start the Sytra backend services" "Gray"
    Write-ColorOutput "  4. Restart your IDE to load the MCP servers" "Gray"
    Write-ColorOutput "  5. Test with: 'sytra analyze this code...'" "Gray"
    exit 0
}
else {
    Write-ColorOutput "`nSome servers failed to build. Check the errors above." "Yellow"
    Write-ColorOutput "`nTroubleshooting:" "Cyan"
    Write-ColorOutput "  1. Check Node.js version (must be >= 18)" "Gray"
    Write-ColorOutput "  2. Clear node_modules: Remove-Item -Recurse -Force mcp-servers/*/node_modules" "Gray"
    Write-ColorOutput "  3. Try building failed servers individually" "Gray"
    Write-ColorOutput "  4. Check the build logs for specific errors" "Gray"
    exit 1
}

# Made with Bob
