# IDE Configuration Guide for Stark MCP Servers

This guide provides configuration instructions for integrating Stark MCP servers with various IDEs and AI-powered development tools that support the Model Context Protocol (MCP).

## Table of Contents

- [Overview](#overview)
- [Supported IDEs and Tools](#supported-ides-and-tools)
- [Configuration Pattern](#configuration-pattern)
- [IDE-Specific Instructions](#ide-specific-instructions)
  - [Claude Desktop](#claude-desktop)
  - [VSCode with Continue Extension](#vscode-with-continue-extension)
  - [Cursor IDE](#cursor-ide)
  - [Windsurf IDE](#windsurf-ide)
  - [Zed Editor](#zed-editor)
  - [IBM Bob](#ibm-bob)
  - [Antigravity](#antigravity)
  - [Kiro](#kiro)
- [Path Configuration](#path-configuration)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Overview

The Model Context Protocol (MCP) enables AI assistants to interact with external tools and services. Stark MCP servers expose 100 specialized tools across 10 integrated servers, providing comprehensive AI-powered software development capabilities.

All configurations follow a similar pattern but may have IDE-specific requirements for file location, format, or additional settings.

## Supported IDEs and Tools

| IDE/Tool | MCP Support | Configuration File | Status |
|----------|-------------|-------------------|--------|
| Claude Desktop | ✅ Full | `claude_desktop_config.json` | Production Ready |
| VSCode (Continue) | ✅ Full | `.continue/config.json` | Supported |
| Cursor IDE | ✅ Full | `.cursor/config.json` | Supported |
| Windsurf IDE | ✅ Full | `.windsurf/config.json` | Supported |
| Zed Editor | ✅ Full | `settings.json` | Supported |
| IBM Bob | ✅ Full | MCP configuration | Supported |
| Antigravity | ✅ Full | MCP configuration | Supported |
| Kiro | ✅ Full | MCP configuration | Supported |

## Configuration Pattern

All MCP server configurations follow this general structure:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["/path/to/server/build/index.js"],
      "env": {
        "API_URL": "http://localhost:PORT"
      }
    }
  }
}
```

### Key Components

- **command**: The executable to run (typically `node` for TypeScript/JavaScript servers)
- **args**: Array containing the path to the compiled server entry point
- **env**: Environment variables required by the server (API URLs, configuration options)

## IDE-Specific Instructions

### Claude Desktop

**Configuration File Location:**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Setup Steps:**

1. Locate or create the configuration file at the path above
2. Copy the configuration from [`claude_desktop_config.json`](./claude_desktop_config.json)
3. Update all file paths to match your installation directory
4. Restart Claude Desktop

**Example Configuration:**

See the complete example in [`claude_desktop_config.json`](./claude_desktop_config.json) or [`configs/claude-desktop.json`](./configs/claude-desktop.json).

**Verification:**

After restarting Claude Desktop, you should see the Stark MCP servers listed in the available tools. Test with:
```
Can you list the available MCP tools?
```

---

### VSCode with Continue Extension

**Configuration File Location:**
- **All Platforms**: `~/.continue/config.json` or `.continue/config.json` in workspace root

**Setup Steps:**

1. Install the [Continue extension](https://marketplace.visualstudio.com/items?itemName=Continue.continue) from VSCode marketplace
2. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run `Continue: Open Config`
4. Add the MCP servers configuration under the `mcpServers` section
5. Reload VSCode window

**Example Configuration:**

```json
{
  "models": [
    {
      "title": "Claude 3.5 Sonnet",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "apiKey": "your-api-key"
    }
  ],
  "mcpServers": {
    "stark-orchestrator": {
      "command": "node",
      "args": ["/absolute/path/to/stark-mcp/mcp-servers/orchestrator/build/index.js"],
      "env": {
        "SECURITY_API_URL": "http://localhost:8001",
        "CODEGEN_API_URL": "http://localhost:8002",
        "MEMORY_API_URL": "http://localhost:8003",
        "INTELLIGENCE_API_URL": "http://localhost:8004",
        "TOKEN_API_URL": "http://localhost:8005",
        "SDLC_API_URL": "http://localhost:8006",
        "LEGACY_API_URL": "http://localhost:8007",
        "SCHEMA_API_URL": "http://localhost:8008",
        "PERFORMANCE_API_URL": "http://localhost:8009"
      }
    }
  }
}
```

**Complete Configuration:**

See [`configs/vscode-continue.json`](./configs/vscode-continue.json) for all 10 servers.

**Verification:**

1. Open Continue sidebar in VSCode
2. Start a new chat
3. Type `@` to see available tools
4. Stark MCP tools should appear in the list

---

### Cursor IDE

**Configuration File Location:**
- **Windows**: `%APPDATA%\Cursor\User\.cursor\config.json`
- **macOS**: `~/Library/Application Support/Cursor/User/.cursor/config.json`
- **Linux**: `~/.config/Cursor/User/.cursor/config.json`

**Setup Steps:**

1. Open Cursor Settings (`Ctrl+,` / `Cmd+,`)
2. Navigate to "Features" → "MCP Servers"
3. Click "Edit in settings.json"
4. Add the MCP servers configuration
5. Restart Cursor

**Example Configuration:**

```json
{
  "mcpServers": {
    "stark-orchestrator": {
      "command": "node",
      "args": ["/absolute/path/to/stark-mcp/mcp-servers/orchestrator/build/index.js"],
      "env": {
        "SECURITY_API_URL": "http://localhost:8001",
        "CODEGEN_API_URL": "http://localhost:8002",
        "MEMORY_API_URL": "http://localhost:8003",
        "INTELLIGENCE_API_URL": "http://localhost:8004",
        "TOKEN_API_URL": "http://localhost:8005",
        "SDLC_API_URL": "http://localhost:8006",
        "LEGACY_API_URL": "http://localhost:8007",
        "SCHEMA_API_URL": "http://localhost:8008",
        "PERFORMANCE_API_URL": "http://localhost:8009"
      }
    }
  }
}
```

**Complete Configuration:**

See [`configs/cursor.json`](./configs/cursor.json) for all 10 servers.

**Verification:**

1. Open Cursor AI chat (`Ctrl+L` / `Cmd+L`)
2. Type `@` to see available tools
3. Stark MCP tools should be available

**Cursor-Specific Notes:**

- Cursor may cache MCP server connections; restart if tools don't appear
- Check Cursor's output panel for MCP server logs
- Ensure Node.js is in your system PATH

---

### Windsurf IDE

**Configuration File Location:**
- **Windows**: `%APPDATA%\Windsurf\.windsurf\config.json`
- **macOS**: `~/Library/Application Support/Windsurf/.windsurf/config.json`
- **Linux**: `~/.config/Windsurf/.windsurf/config.json`

**Setup Steps:**

1. Open Windsurf Settings
2. Navigate to "Extensions" → "MCP Configuration"
3. Click "Edit Configuration File"
4. Add the MCP servers configuration
5. Reload Windsurf

**Example Configuration:**

```json
{
  "mcp": {
    "servers": {
      "stark-orchestrator": {
        "command": "node",
        "args": ["/absolute/path/to/stark-mcp/mcp-servers/orchestrator/build/index.js"],
        "env": {
          "SECURITY_API_URL": "http://localhost:8001",
          "CODEGEN_API_URL": "http://localhost:8002",
          "MEMORY_API_URL": "http://localhost:8003",
          "INTELLIGENCE_API_URL": "http://localhost:8004",
          "TOKEN_API_URL": "http://localhost:8005",
          "SDLC_API_URL": "http://localhost:8006",
          "LEGACY_API_URL": "http://localhost:8007",
          "SCHEMA_API_URL": "http://localhost:8008",
          "PERFORMANCE_API_URL": "http://localhost:8009"
        }
      }
    }
  }
}
```

**Complete Configuration:**

See [`configs/windsurf.json`](./configs/windsurf.json) for all 10 servers.

**Verification:**

1. Open Windsurf AI assistant
2. Check available tools in the tools panel
3. Test with a simple query using Stark tools

**Windsurf-Specific Notes:**

- Windsurf uses a slightly different JSON structure (`mcp.servers` instead of `mcpServers`)
- Ensure backend services are running before starting Windsurf
- Check Windsurf logs for connection issues

---

### Zed Editor

**Configuration File Location:**
- **All Platforms**: `~/.config/zed/settings.json`

**Setup Steps:**

1. Open Zed Settings (`Cmd+,` / `Ctrl+,`)
2. Click "Open settings.json"
3. Add the MCP servers configuration under `assistant.mcp_servers`
4. Save and reload Zed

**Example Configuration:**

```json
{
  "assistant": {
    "version": "2",
    "provider": {
      "name": "anthropic",
      "api_key": "your-api-key"
    },
    "mcp_servers": {
      "stark-orchestrator": {
        "command": "node",
        "args": ["/absolute/path/to/stark-mcp/mcp-servers/orchestrator/build/index.js"],
        "env": {
          "SECURITY_API_URL": "http://localhost:8001",
          "CODEGEN_API_URL": "http://localhost:8002",
          "MEMORY_API_URL": "http://localhost:8003",
          "INTELLIGENCE_API_URL": "http://localhost:8004",
          "TOKEN_API_URL": "http://localhost:8005",
          "SDLC_API_URL": "http://localhost:8006",
          "LEGACY_API_URL": "http://localhost:8007",
          "SCHEMA_API_URL": "http://localhost:8008",
          "PERFORMANCE_API_URL": "http://localhost:8009"
        }
      }
    }
  }
}
```

**Complete Configuration:**

See [`configs/zed.json`](./configs/zed.json) for all 10 servers.

**Verification:**

1. Open Zed Assistant panel
2. Start a new conversation
3. Stark MCP tools should be available automatically

**Zed-Specific Notes:**

- Zed requires `assistant.version` to be set to `"2"` for MCP support
- MCP servers are nested under `assistant.mcp_servers`
- Zed automatically reconnects to MCP servers on configuration changes

---

## Path Configuration

### Absolute vs Relative Paths

**Absolute Paths (Recommended for IDE configs):**
```json
"args": ["/home/user/projects/stark-mcp/mcp-servers/orchestrator/build/index.js"]
```

**Windows Absolute Paths:**
```json
"args": ["C:/Users/YourName/Documents/stark-mcp/mcp-servers/orchestrator/build/index.js"]
```

**macOS/Linux Absolute Paths:**
```json
"args": ["/Users/yourname/projects/stark-mcp/mcp-servers/orchestrator/build/index.js"]
```

### Path Best Practices

1. **Use forward slashes** (`/`) even on Windows for better compatibility
2. **Avoid spaces** in paths when possible, or use proper escaping
3. **Use absolute paths** in IDE configurations to avoid working directory issues
4. **Verify paths** exist before adding to configuration
5. **Use environment variables** for dynamic paths (see below)

### Using Environment Variables in Paths

Some IDEs support environment variable expansion:

```json
{
  "args": ["${HOME}/projects/stark-mcp/mcp-servers/orchestrator/build/index.js"]
}
```

Or on Windows:
```json
{
  "args": ["${USERPROFILE}/Documents/stark-mcp/mcp-servers/orchestrator/build/index.js"]
}
```

**Note:** Not all IDEs support environment variable expansion in MCP configurations. Test or use absolute paths for reliability.

---

## Environment Variables

---

### IBM Bob

**Configuration File Location:**
- Configuration managed through IBM Bob's MCP settings

**Setup Steps:**

1. Access IBM Bob's MCP configuration interface
2. Add Stark MCP servers using the provided configuration
3. Update file paths to match your installation directory
4. Save and restart IBM Bob

**Example Configuration:**

```json
{
  "mcpServers": {
    "stark-orchestrator": {
      "command": "node",
      "args": ["/absolute/path/to/stark-mcp/mcp-servers/orchestrator/build/index.js"],
      "env": {
        "SECURITY_API_URL": "http://localhost:8001",
        "CODEGEN_API_URL": "http://localhost:8002",
        "MEMORY_API_URL": "http://localhost:8003",
        "INTELLIGENCE_API_URL": "http://localhost:8004",
        "TOKEN_API_URL": "http://localhost:8005",
        "SDLC_API_URL": "http://localhost:8006",
        "LEGACY_API_URL": "http://localhost:8007",
        "SCHEMA_API_URL": "http://localhost:8008",
        "PERFORMANCE_API_URL": "http://localhost:8009"
      }
    }
  }
}
```

**Complete Configuration:**

See [`ibm-bob.json`](./ibm-bob.json) for all 10 servers.

**Verification:**

1. Open IBM Bob interface
2. Check available MCP tools in the tools panel
3. Test with a query using Stark tools

**IBM Bob-Specific Notes:**

- Ensure backend services are running before starting IBM Bob
- Check IBM Bob logs for connection issues
- Verify Node.js is accessible from IBM Bob's environment

---

### Antigravity

**Configuration File Location:**
- Configuration managed through Antigravity's MCP settings

**Setup Steps:**

1. Access Antigravity's configuration interface
2. Navigate to MCP server settings
3. Add Stark MCP servers configuration
4. Update all file paths to match your installation
5. Apply changes and restart Antigravity

**Example Configuration:**

```json
{
  "mcpServers": {
    "stark-orchestrator": {
      "command": "node",
      "args": ["/absolute/path/to/stark-mcp/mcp-servers/orchestrator/build/index.js"],
      "env": {
        "SECURITY_API_URL": "http://localhost:8001",
        "CODEGEN_API_URL": "http://localhost:8002",
        "MEMORY_API_URL": "http://localhost:8003",
        "INTELLIGENCE_API_URL": "http://localhost:8004",
        "TOKEN_API_URL": "http://localhost:8005",
        "SDLC_API_URL": "http://localhost:8006",
        "LEGACY_API_URL": "http://localhost:8007",
        "SCHEMA_API_URL": "http://localhost:8008",
        "PERFORMANCE_API_URL": "http://localhost:8009"
      }
    }
  }
}
```

**Complete Configuration:**

See [`antigravity.json`](./antigravity.json) for all 10 servers.

**Verification:**

1. Open Antigravity AI interface
2. Verify Stark MCP tools are listed
3. Test tool functionality with a simple query

**Antigravity-Specific Notes:**

- Ensure all backend services are accessible
- Check Antigravity logs for MCP connection status
- Verify environment variables are properly set

---

### Kiro

**Configuration File Location:**
- Configuration managed through Kiro's MCP settings

**Setup Steps:**

1. Open Kiro settings or configuration panel
2. Locate MCP server configuration section
3. Add Stark MCP servers using the provided template
4. Update file paths to your installation directory
5. Save and reload Kiro

**Example Configuration:**

```json
{
  "mcpServers": {
    "stark-orchestrator": {
      "command": "node",
      "args": ["/absolute/path/to/stark-mcp/mcp-servers/orchestrator/build/index.js"],
      "env": {
        "SECURITY_API_URL": "http://localhost:8001",
        "CODEGEN_API_URL": "http://localhost:8002",
        "MEMORY_API_URL": "http://localhost:8003",
        "INTELLIGENCE_API_URL": "http://localhost:8004",
        "TOKEN_API_URL": "http://localhost:8005",
        "SDLC_API_URL": "http://localhost:8006",
        "LEGACY_API_URL": "http://localhost:8007",
        "SCHEMA_API_URL": "http://localhost:8008",
        "PERFORMANCE_API_URL": "http://localhost:8009"
      }
    }
  }
}
```

**Complete Configuration:**

See [`kiro.json`](./kiro.json) for all 10 servers.

**Verification:**

1. Open Kiro assistant
2. Check that Stark MCP tools appear in available tools
3. Test with a simple query using Stark capabilities

**Kiro-Specific Notes:**

- Verify backend services are running and accessible
- Check Kiro logs for any MCP-related errors
- Ensure Node.js is in the system PATH

### Required Environment Variables

Each Stark MCP server requires specific API URLs to connect to backend services:

| Server | Environment Variable | Default Port |
|--------|---------------------|--------------|
| Security Guardrails | `SECURITY_API_URL` | 8001 |
| Code Generation | `CODEGEN_API_URL` | 8002 |
| Memory Management | `MEMORY_API_URL` | 8003 |
| Intelligence Amplification | `INTELLIGENCE_API_URL` | 8004 |
| Token Optimization | `TOKEN_API_URL` | 8005 |
| SDLC Integration | `SDLC_API_URL` | 8006 |
| Legacy Support | `LEGACY_API_URL` | 8007 |
| Schema Intelligence | `SCHEMA_API_URL` | 8008 |
| Performance Optimizer | `PERFORMANCE_API_URL` | 8009 |

### Orchestrator Environment Variables

The orchestrator server requires **all** API URLs since it routes requests to specialized servers:

```json
{
  "env": {
    "SECURITY_API_URL": "http://localhost:8001",
    "CODEGEN_API_URL": "http://localhost:8002",
    "MEMORY_API_URL": "http://localhost:8003",
    "INTELLIGENCE_API_URL": "http://localhost:8004",
    "TOKEN_API_URL": "http://localhost:8005",
    "SDLC_API_URL": "http://localhost:8006",
    "LEGACY_API_URL": "http://localhost:8007",
    "SCHEMA_API_URL": "http://localhost:8008",
    "PERFORMANCE_API_URL": "http://localhost:8009"
  }
}
```

### Custom Port Configuration

If you're running backend services on different ports, update the environment variables accordingly:

```json
{
  "env": {
    "SECURITY_API_URL": "http://localhost:9001",
    "CODEGEN_API_URL": "http://localhost:9002"
  }
}
```

### Remote Backend Services

For remote or containerized backends:

```json
{
  "env": {
    "SECURITY_API_URL": "http://stark-backend.example.com:8001",
    "CODEGEN_API_URL": "http://stark-backend.example.com:8002"
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. MCP Servers Not Appearing

**Symptoms:** Tools don't show up in IDE after configuration

**Solutions:**
- Verify the configuration file is in the correct location
- Check that all file paths are absolute and correct
- Ensure servers are built (`npm run build` in each server directory)
- Restart the IDE completely
- Check IDE logs/output panel for error messages

#### 2. Connection Errors

**Symptoms:** "Failed to connect to MCP server" or similar errors

**Solutions:**
- Verify backend services are running: `curl http://localhost:8001/health`
- Check that ports in environment variables match running services
- Ensure no firewall is blocking localhost connections
- Verify Node.js is installed and in PATH: `node --version`

#### 3. Path Issues

**Symptoms:** "Cannot find module" or "ENOENT" errors

**Solutions:**
- Use absolute paths instead of relative paths
- Verify the build directory exists: `ls mcp-servers/*/build/index.js`
- Check for typos in file paths
- On Windows, use forward slashes: `C:/Users/...` not `C:\Users\...`

#### 4. Environment Variable Issues

**Symptoms:** Server starts but tools fail with API errors

**Solutions:**
- Verify all required environment variables are set
- Check that API URLs are correct and accessible
- Test API endpoints manually: `curl http://localhost:8001/health`
- Ensure no trailing slashes in API URLs

#### 5. IDE-Specific Issues

**Claude Desktop:**
- Clear cache: Delete `%APPDATA%\Claude\Cache` (Windows) or `~/Library/Caches/Claude` (macOS)
- Check logs in the same directory as config file

**VSCode/Continue:**
- Check Continue extension output panel
- Reload window: `Ctrl+Shift+P` → "Developer: Reload Window"
- Verify Continue extension is up to date

**Cursor:**
- Check Cursor output panel for MCP logs
- Ensure Cursor has permission to execute Node.js
- Try disabling and re-enabling MCP in settings

**Windsurf:**
- Verify the `mcp.servers` structure (not `mcpServers`)
- Check Windsurf logs in the application data directory
- Ensure backend services started before Windsurf

**Zed:**
- Verify `assistant.version` is set to `"2"`
- Check Zed logs: `~/.local/share/zed/logs`
- Ensure Anthropic API key is configured

### Verification Steps

After configuration, verify your setup:

1. **Check server builds:**
   ```bash
   ls mcp-servers/*/build/index.js
   ```

2. **Verify backend services:**
   ```bash
   curl http://localhost:8001/health
   curl http://localhost:8002/health
   # ... repeat for all services
   ```

3. **Test MCP server directly:**
   ```bash
   npx @modelcontextprotocol/inspector node mcp-servers/orchestrator/build/index.js
   ```

4. **Check IDE logs:**
   - Look for MCP-related errors in IDE output/console
   - Verify servers are connecting successfully
   - Check for tool registration messages

### Getting Help

If issues persist:

1. Review the [Testing Guide](TESTING.md) for comprehensive verification steps
2. Check the [Troubleshooting Guide](TROUBLESHOOTING.md) for detailed solutions
3. Review individual server READMEs for server-specific issues
4. Check backend service logs for API-related errors
5. Verify Node.js version: `node --version` (requires 18+)

### Reporting Issues

When reporting configuration issues, include:

- IDE name and version
- Operating system
- Node.js version (`node --version`)
- Configuration file content (sanitized)
- Error messages from IDE logs
- Output of verification commands above

---

## Additional Resources

- **[Installation Guide](../mcp-servers/INSTALLATION.md)** - Complete setup instructions
- **[Testing Guide](../mcp-servers/TESTING.md)** - Verification procedures
- **[Usage Guide](../mcp-servers/USAGE_GUIDE.md)** - Practical examples
- **[Troubleshooting Guide](../mcp-servers/TROUBLESHOOTING.md)** - Detailed problem solving

## Configuration Examples

Complete, copy-paste ready configuration files are available in this directory:

- [`claude-desktop.json`](./claude-desktop.json) - Claude Desktop configuration
- [`vscode-continue.json`](./vscode-continue.json) - VSCode Continue extension
- [`cursor.json`](./cursor.json) - Cursor IDE
- [`windsurf.json`](./windsurf.json) - Windsurf IDE
- [`zed.json`](./zed.json) - Zed editor
- [`ibm-bob.json`](./ibm-bob.json) - IBM Bob AI assistant
- [`antigravity.json`](./antigravity.json) - Antigravity AI tool
- [`kiro.json`](./kiro.json) - Kiro AI assistant

Each file includes all 10 Stark MCP servers with proper configuration. Update the file paths to match your installation directory.