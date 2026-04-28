# Stark MCP Servers

**Professional Model Context Protocol (MCP) Servers for AI-Powered Development**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js 20+](https://img.shields.io/badge/node-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![MCP v0.5.0](https://img.shields.io/badge/MCP-v0.5.0-purple.svg)](https://modelcontextprotocol.io/)

A collection of 9 specialized MCP servers that extend AI assistants like Claude with powerful development capabilities including code generation, security scanning, legacy modernization, performance optimization, and intelligent orchestration.

---

## 🌟 What is Stark?

Stark is a suite of **production-ready MCP servers** that transform AI assistants into comprehensive development platforms. Each server provides specialized tools that can be used independently or orchestrated together for complex workflows.

### Key Features

- **🎯 9 Specialized Servers**: Each focused on specific development tasks
- **🔒 Security-First**: Built-in security scanning and guardrails
- **⚡ High Performance**: Optimized for speed and efficiency
- **🔄 Easy Integration**: Simple setup with Claude Desktop or custom MCP clients
- **📦 Modular Design**: Use only what you need
- **🎼 Workflow Orchestration**: Pre-built workflows for common tasks
- **🛠️ 56 Total Tools**: Comprehensive toolkit for AI-powered development

---

## 📦 Available MCP Servers

### 1. 🎼 Orchestrator Server (Recommended)
**The unified interface to all Stark capabilities**

- **12 high-level tools** that intelligently coordinate multiple services
- **Pre-defined workflows** for common development tasks
- **Intelligent routing** to appropriate specialized servers
- **Workflow engine** for complex multi-step operations

**Use when:** You want a single, powerful interface to all Stark capabilities

### 2. 🔒 Security Guardrails Server
**Security scanning and compliance**

- Data classification and sensitivity detection
- Access control validation
- Code vulnerability scanning
- Security audit logging
- Encryption/decryption utilities

**Use when:** You need security validation and compliance checks

### 3. 💻 Code Generation Server
**AI-powered code generation and validation**

- Intelligent code generation
- Code validation and linting
- Automated refactoring
- Bug fixing and optimization
- Test generation
- Sandboxed code execution

**Use when:** You need to generate, validate, or improve code

### 4. 🧠 Memory Management Server
**Context and conversation memory**

- Vector-based memory storage
- Semantic memory retrieval
- Context compression
- Memory indexing and search
- Conversation history management

**Use when:** You need to maintain context across conversations

### 5. 🎯 Intelligence Amplification Server
**Advanced AI reasoning and task management**

- Prompt engineering and optimization
- Task decomposition
- Chain-of-thought reasoning
- Multi-agent collaboration
- RAG (Retrieval Augmented Generation)
- Self-reflection and improvement
- Intelligent model routing

**Use when:** You need advanced reasoning or complex task handling

### 6. ⚡ Token Optimization Server
**Token usage optimization**

- Token counting and analysis
- Context optimization
- Content pruning
- Semantic summarization
- Context window management

**Use when:** You need to optimize token usage and costs

### 7. 🔄 SDLC Integration Server
**Software Development Lifecycle automation**

- Requirements analysis
- Automated code review
- Test generation
- Documentation generation
- Technical debt tracking
- CI/CD setup

**Use when:** You need full SDLC automation

### 8. 🏛️ Legacy Support Server
**Legacy code modernization**

- COBOL, Fortran, Assembly parsing
- Code translation to modern languages
- Complexity analysis
- Dependency analysis
- Migration planning

**Use when:** You need to modernize legacy systems

### 9. 📊 Performance Optimizer Server
**Performance profiling and optimization**

- CPU, memory, I/O profiling
- Algorithm optimization
- Cache optimization
- Performance benchmarking

**Use when:** You need to analyze and improve performance

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.0 or higher
- **npm** or **yarn**
- **Claude Desktop** or another MCP-compatible client

### Installation

#### Option 1: Orchestrator Only (⭐ Recommended)

Install just the orchestrator for access to all capabilities:

```bash
# Clone the repository
git clone https://github.com/walkowicz19/stark-mcp-package.git
cd stark-mcp-package/mcp-servers/orchestrator

# Install dependencies
npm install

# Build
npm run build
```

#### Option 2: Individual Servers

Install specific servers for targeted capabilities:

```bash
# Example: Security Guardrails
cd mcp-servers/security-guardrails
npm install
npm run build
```

#### Option 3: All Servers

Install all servers for maximum flexibility:

```bash
cd mcp-servers
for dir in */; do
  cd "$dir"
  npm install
  npm run build
  cd ..
done
```

### Configuration

#### For Claude Desktop

Add to your `claude_desktop_config.json`:

**Orchestrator Configuration:**
```json
{
  "mcpServers": {
    "stark-orchestrator": {
      "command": "node",
      "args": [
        "/absolute/path/to/stark-mcp-package/mcp-servers/orchestrator/build/index.js"
      ]
    }
  }
}
```

**Individual Server Configuration:**
```json
{
  "mcpServers": {
    "stark-security": {
      "command": "node",
      "args": [
        "/absolute/path/to/stark-mcp-package/mcp-servers/security-guardrails/build/index.js"
      ]
    },
    "stark-codegen": {
      "command": "node",
      "args": [
        "/absolute/path/to/stark-mcp-package/mcp-servers/code-generation/build/index.js"
      ]
    }
  }
}
```

See [`mcp-servers/INSTALLATION.md`](mcp-servers/INSTALLATION.md) for detailed configuration instructions.

### Verify Installation

Restart Claude Desktop and check that the Stark tools appear in the available tools list.

---

## 🛠️ Available Tools

### Orchestrator Tools (12 Unified Tools)

| Tool | Description |
|------|-------------|
| `stark_analyze_code` | Comprehensive code analysis with security and performance checks |
| `stark_generate_secure_code` | Generate code with automatic security validation |
| `stark_modernize_legacy` | Modernize legacy code to modern languages |
| `stark_optimize_workflow` | Optimize development workflows |
| `stark_full_sdlc_cycle` | Complete SDLC automation from requirements to deployment |
| `stark_intelligent_refactor` | AI-powered code refactoring |
| `stark_security_audit` | Complete security audit |
| `stark_performance_tune` | End-to-end performance optimization |
| `stark_memory_optimize` | Context and memory optimization |
| `stark_execute_workflow` | Execute custom workflows |
| `stark_list_workflows` | List available pre-defined workflows |
| `stark_get_workflow_status` | Get workflow execution status |

### Specialized Server Tools (44 Tools Total)

Each specialized server provides 5-8 focused tools. See individual server READMEs for details:

- [`security-guardrails/README.md`](mcp-servers/security-guardrails/README.md) - 6 tools
- [`code-generation/README.md`](mcp-servers/code-generation/README.md) - 8 tools
- [`memory-management/README.md`](mcp-servers/memory-management/README.md) - 6 tools
- [`intelligence-amplification/README.md`](mcp-servers/intelligence-amplification/README.md) - 7 tools
- [`token-optimization/README.md`](mcp-servers/token-optimization/README.md) - 5 tools
- [`sdlc-integration/README.md`](mcp-servers/sdlc-integration/README.md) - 6 tools
- [`legacy-support/README.md`](mcp-servers/legacy-support/README.md) - 8 tools
- [`performance-optimizer/README.md`](mcp-servers/performance-optimizer/README.md) - 6 tools

---

## 🎼 Pre-defined Workflows

The orchestrator includes 4 production-ready workflows:

### 1. Secure Code Generation
Generate production-ready code with security validation, optimization, tests, and documentation.

**Duration:** 5-10 minutes | **Steps:** 6

```
Use the secure code generation workflow to create a REST API for user authentication
```

### 2. Legacy Modernization
Modernize legacy code through parsing, analysis, translation, and optimization.

**Duration:** 10-20 minutes | **Steps:** 10

```
Modernize this COBOL code to Python using the legacy modernization workflow
```

### 3. Full SDLC Cycle
Complete software development lifecycle from requirements to deployment.

**Duration:** 15-30 minutes | **Steps:** 13

```
Execute the full SDLC workflow to build a microservices API
```

### 4. Performance Optimization
Comprehensive performance analysis and optimization.

**Duration:** 10-15 minutes | **Steps:** 11

```
Run the performance optimization workflow on this code
```

---

## 💡 Usage Examples

### Example 1: Generate Secure Code

```
Generate a secure Python FastAPI endpoint for user registration with password hashing and input validation
```

**What happens:**
1. Security requirements are classified
2. Code is generated with best practices
3. Vulnerability scanning is performed
4. Unit tests are created
5. Documentation is generated

### Example 2: Modernize Legacy Code

```
Translate this COBOL program to Python and create a migration plan
```

**What happens:**
1. COBOL code is parsed
2. Complexity is analyzed
3. Dependencies are mapped
4. Code is translated to Python
5. Migration plan is created

### Example 3: Full Development Cycle

```
Build a complete REST API for a todo application with tests, docs, and CI/CD setup
```

**What happens:**
1. Requirements are analyzed
2. Architecture is designed
3. Code is generated
4. Tests are created
5. Documentation is written
6. CI/CD pipeline is configured

---

## 📁 Repository Structure

```
stark-mcp-package/
├── mcp-servers/
│   ├── orchestrator/              # Unified orchestrator server
│   ├── security-guardrails/       # Security scanning and compliance
│   ├── code-generation/           # Code generation and validation
│   ├── memory-management/         # Context and memory management
│   ├── intelligence-amplification/# Advanced AI reasoning
│   ├── token-optimization/        # Token usage optimization
│   ├── sdlc-integration/          # SDLC automation
│   ├── legacy-support/            # Legacy code modernization
│   ├── performance-optimizer/     # Performance profiling
│   ├── shared/                    # Shared utilities
│   ├── INSTALLATION.md            # Installation guide
│   ├── USAGE_GUIDE.md             # Usage guide
│   └── TROUBLESHOOTING.md         # Troubleshooting guide
├── README.md                      # This file
└── LICENSE                        # MIT License
```

---

## 🔧 Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/walkowicz19/stark-mcp-package.git
cd stark-mcp-package

# Install dependencies for a specific server
cd mcp-servers/orchestrator
npm install

# Build
npm run build

# Watch mode for development
npm run watch
```

### Running Tests

```bash
npm test
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 📚 Documentation

- **[Installation Guide](mcp-servers/INSTALLATION.md)** - Detailed installation instructions
- **[Usage Guide](mcp-servers/USAGE_GUIDE.md)** - How to use the MCP servers
- **[Troubleshooting](mcp-servers/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Orchestrator README](mcp-servers/orchestrator/README.md)** - Orchestrator documentation
- **Individual Server READMEs** - Detailed docs for each server

---

## 🔐 Security

Stark MCP servers implement security best practices:

- **Input Validation**: All inputs are validated and sanitized
- **Sandboxed Execution**: Code execution happens in isolated environments
- **Security Scanning**: Built-in vulnerability detection
- **Access Control**: Role-based access control support
- **Audit Logging**: Comprehensive security audit trails

For security issues, please email: security@stark-mcp.io

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **📖 Documentation**: [mcp-servers/](mcp-servers/)
- **🐛 Issues**: [GitHub Issues](https://github.com/walkowicz19/stark-mcp-package/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/walkowicz19/stark-mcp-package/discussions)

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] Additional language support (Rust, Go, C++)
- [ ] Enhanced workflow builder
- [ ] Real-time collaboration features
- [ ] Plugin system for custom extensions
- [ ] Web-based configuration UI
- [ ] Performance monitoring dashboard

---

## 🙏 Acknowledgments

- **Anthropic** for Claude and the Model Context Protocol
- **TypeScript** community for excellent tooling
- All **contributors** and community members

---

## 📞 Contact

- **GitHub**: [@walkowicz19](https://github.com/walkowicz19)
- **Repository**: [stark-mcp-package](https://github.com/walkowicz19/stark-mcp-package)

---

<div align="center">

**Built with ❤️ for the AI development community**

⭐ **Star us on GitHub** if you find this project useful!

[Get Started](mcp-servers/INSTALLATION.md) • [Report Bug](https://github.com/walkowicz19/stark-mcp-package/issues) • [Request Feature](https://github.com/walkowicz19/stark-mcp-package/issues)

</div>
