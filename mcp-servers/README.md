# Stark MCP Servers

Model Context Protocol (MCP) servers for the Stark AI system. These servers expose Stark's capabilities as tools that can be used in AI assistants and IDEs that support the MCP protocol.

## Overview

The Stark MCP ecosystem provides **100 specialized tools** across **10 integrated servers**, enabling comprehensive AI-powered software development, analysis, and modernization capabilities.

### Multi-IDE Support

Stark MCP servers work with multiple IDEs and AI tools:
- **Claude Desktop** - Full support with native MCP integration
- **VSCode** (Continue extension) - Complete tool access
- **Cursor IDE** - Native MCP support
- **Windsurf IDE** - Full integration
- **Zed Editor** - Built-in MCP support
- **IBM Bob** - IBM AI assistant integration
- **Antigravity** - Antigravity AI tool support
- **Kiro** - Kiro AI assistant integration

See the [IDE Configuration Guide](../configs/IDE_CONFIGURATIONS.md) for setup instructions.

## Available Servers

1. **orchestrator** - Intelligent routing, workflow orchestration, and multi-server coordination (15 tools)
2. **intelligence-amplification** - Prompt optimization, RAG, reasoning, task decomposition, and code intelligence (12 tools)
3. **schema-intelligence** - Database schema analysis, optimization, and migration planning (10 tools)
4. **security-guardrails** - Data classification, access control, encryption, and audit logging (10 tools)
5. **code-generation** - Code generation, validation, sandbox execution, and quality analysis (10 tools)
6. **memory-management** - Context storage, retrieval, compression, and session management (10 tools)
7. **token-optimization** - Token counting, context optimization, and text compression (10 tools)
8. **sdlc-integration** - Requirements analysis, code review, and documentation generation (10 tools)
9. **legacy-support** - Legacy code parsing, translation, migration planning, and modernization (10 tools)
10. **performance-optimizer** - CPU/memory profiling, caching, benchmarking, and optimization (10 tools)

## Key Capabilities

- **Code Intelligence**: Advanced code analysis, pattern detection, and refactoring suggestions
- **Schema Intelligence**: Database schema analysis, optimization, and migration planning
- **Legacy Modernization**: Comprehensive support for COBOL, Fortran, and other legacy languages
- **Workflow Orchestration**: Pre-built workflows for common development scenarios
- **Security & Compliance**: Built-in security scanning and compliance checking
- **Performance Optimization**: Profiling, benchmarking, and optimization recommendations

## Installation

Each server can be installed independently:

```bash
cd mcp-servers/[server-name]
npm install
npm run build
```

For detailed installation instructions, see the [Installation Guide](INSTALLATION.md).

## Quick Verification

After installation, verify your setup:

```bash
# 1. Check all servers built successfully
ls mcp-servers/*/build/index.js

# 2. Verify backend services are running
curl http://localhost:8001/health  # Should return {"status": "healthy"}

# 3. Test a server with MCP Inspector
npx @modelcontextprotocol/inspector node mcp-servers/orchestrator/build/index.js
```

For comprehensive testing instructions, see the [Testing Guide](TESTING.md).

## Configuration

### IDE Setup

Stark MCP servers can be configured for multiple IDEs and AI tools. Each IDE has specific configuration requirements:

- **Quick Start**: Copy configuration from [`../configs/`](../configs/) directory for your IDE
- **Detailed Instructions**: See [IDE Configuration Guide](../configs/IDE_CONFIGURATIONS.md)
- **Claude Desktop**: Use [`claude_desktop_config.json`](claude_desktop_config.json) as reference

**Available Configuration Templates:**
- [`../configs/claude-desktop.json`](../configs/claude-desktop.json) - Claude Desktop
- [`../configs/vscode-continue.json`](../configs/vscode-continue.json) - VSCode with Continue
- [`../configs/cursor.json`](../configs/cursor.json) - Cursor IDE
- [`../configs/windsurf.json`](../configs/windsurf.json) - Windsurf IDE
- [`../configs/zed.json`](../configs/zed.json) - Zed Editor
- [`../configs/ibm-bob.json`](../configs/ibm-bob.json) - IBM Bob
- [`../configs/antigravity.json`](../configs/antigravity.json) - Antigravity
- [`../configs/kiro.json`](../configs/kiro.json) - Kiro

All configurations require updating file paths to match your installation directory.

## Requirements

- Node.js 18+
- TypeScript 5.3+

## Documentation

- **[Installation Guide](INSTALLATION.md)** - Complete setup instructions for all servers
- **[IDE Configuration Guide](../configs/IDE_CONFIGURATIONS.md)** - Multi-IDE setup and configuration
- **[Testing Guide](TESTING.md)** - Comprehensive testing and verification procedures
- **[Usage Guide](USAGE_GUIDE.md)** - Practical examples and usage patterns
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Common issues and solutions

## Getting Started

1. **Install**: Follow the [Installation Guide](INSTALLATION.md) to set up all servers
2. **Verify**: Use the [Testing Guide](TESTING.md) to confirm everything works
3. **Learn**: Explore the [Usage Guide](USAGE_GUIDE.md) for practical examples
4. **Troubleshoot**: Check the [Troubleshooting Guide](TROUBLESHOOTING.md) if issues arise

## Support

For additional help:
- Review individual server READMEs in their respective directories
- Check the documentation guides listed above
- Review service logs for detailed error information
- Running Stark FastAPI services