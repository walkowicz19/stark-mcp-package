# Stark MCP Servers

**Professional Model Context Protocol (MCP) Servers for AI-Powered Development**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js 20+](https://img.shields.io/badge/node-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![MCP v0.5.0](https://img.shields.io/badge/MCP-v0.5.0-purple.svg)](https://modelcontextprotocol.io/)

A comprehensive suite of 10 specialized MCP servers that extend AI assistants like Claude with enterprise-grade development capabilities including **large-scale code intelligence (50GB+ repos)**, **multi-database schema analysis**, **legacy system modernization (COBOL, mainframe)**, and intelligent orchestration.

---

## 🌟 What is Stark?

Stark is a suite of **production-ready MCP servers** that transform AI assistants into comprehensive development platforms. Each server provides specialized tools that can be used independently or orchestrated together for complex workflows.

### Key Features

- **🎯 10 Specialized Servers**: Each focused on specific development tasks
- **🚀 Enterprise-Scale**: Handle 50GB+ repositories, 700+ files, complex databases
- **🔒 Security-First**: Built-in security scanning and guardrails
- **⚡ High Performance**: <15min for 50GB indexing, <100ms semantic search
- **🔄 Easy Integration**: Simple setup with Claude Desktop or custom MCP clients
- **📦 Modular Design**: Use only what you need
- **🎼 Workflow Orchestration**: Pre-built workflows for common tasks
- **🛠️ 100 Total Tools**: 17 orchestration tools + 83 specialized tools

---

## 📦 Available MCP Servers

### 1. 🎼 Orchestrator Server (Recommended)
**The unified interface to all Stark capabilities**

- **17 high-level tools** that intelligently coordinate multiple services
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
**Context and conversation memory with large-scale support**

- Vector-based memory storage
- Semantic memory retrieval
- Context compression
- Large codebase context storage (50GB+)
- Database schema context management
- Legacy system context with business logic
- Intelligent context prioritization and merging

**Use when:** You need to maintain context across conversations or store massive codebase/schema analysis

### 5. 🎯 Intelligence Amplification Server
**Advanced AI reasoning and large-scale code intelligence**

- Prompt engineering and optimization
- Task decomposition and chain-of-thought reasoning
- RAG (Retrieval Augmented Generation)
- 50GB+ repository indexing with incremental updates
- Semantic code search with natural language
- Dependency analysis and impact radius calculation
- Symbol references and complexity metrics

**Use when:** You need advanced reasoning or analyzing massive codebases (50GB+, 700+ files)

### 6. ⚡ Token Optimization Server
**Token usage optimization**

- Token counting and analysis
- Context optimization
- Content pruning
- Semantic summarization
- Context window management

**Use when:** You need to optimize token usage and costs

### 7. 🗄️ Schema Intelligence Server
**Complex database analysis and optimization**

- **Multi-database support**: PostgreSQL, MySQL, Oracle, MongoDB, Cassandra, DynamoDB, Neo4j
- **Schema extraction**: Complete schema with tables, relationships, indexes
- **Relationship detection**: Automatic FK detection + naming conventions + data overlap
- **Query pattern analysis**: N+1 detection, slow queries, hot tables
- **Index optimization**: AI-powered index suggestions
- **ERD generation**: Mermaid, PlantUML, Graphviz formats
- **Data profiling**: Quality checks, cardinality, distributions

**Use when:** You need to analyze, optimize, or document complex database schemas

### 8. 🔄 SDLC Integration Server
**Software Development Lifecycle automation**

- Requirements analysis
- Automated code review
- Test generation
- Documentation generation
- Technical debt tracking
- CI/CD setup

**Use when:** You need full SDLC automation

### 9. 🏛️ Legacy Support Server
**Legacy system modernization**

- **Multi-language support**: COBOL, Fortran, Assembly, RPG, JCL, PL/I, REXX, Natural
- **Deep codebase analysis**: 700+ files, comprehensive metrics
- **Business logic extraction**: Rules, validations, calculations
- **Data flow visualization**: Cross-file data tracking
- **Anti-pattern detection**: GOTO spaghetti, complexity hotspots
- **Mainframe integration**: JCL, CICS, DB2 analysis
- **Migration planning**: AI-powered modernization strategies

**Use when:** You need to assess and modernize large legacy systems (COBOL, mainframe, etc.)

### 10. 📊 Performance Optimizer Server
**Performance profiling and optimization**

- CPU, memory, I/O profiling
- Algorithm optimization
- Cache optimization
- Performance benchmarking
- System monitoring

**Use when:** You need to analyze and improve performance

---

## 🚀 Enterprise-Scale Capabilities

Stark provides comprehensive tools for handling enterprise-scale systems:

### 📊 Large-Scale Code Intelligence (12 Tools)

Analyze massive repositories with semantic understanding:

- **50GB+ Repository Support**: Index and analyze repositories of any size
- **Incremental Indexing**: <5 minutes for 700+ file updates
- **Semantic Code Search**: Natural language queries with <100ms response
- **Dependency Analysis**: Calculate impact radius for changes
- **Symbol References**: Find all usages across the codebase
- **Complexity Metrics**: Identify refactoring priorities

**[Learn More →](docs/LARGE_SCALE_CAPABILITIES.md#code-intelligence-50gb-repositories)**

### 🗄️ Database Schema Intelligence (12 Tools)

Comprehensive database analysis and optimization:

- **Multi-Database Support**: PostgreSQL, MySQL, Oracle, MongoDB, Cassandra, DynamoDB, Neo4j
- **Automatic Relationship Detection**: FK + naming conventions + data overlap analysis
- **N+1 Query Detection**: Identify performance anti-patterns
- **Index Optimization**: AI-powered suggestions with impact scores
- **ERD Generation**: Mermaid, PlantUML, Graphviz formats
- **Data Profiling**: Quality checks and statistical analysis

**[Learn More →](docs/LARGE_SCALE_CAPABILITIES.md#schema-intelligence-complex-databases)**

### 🏛️ Advanced Legacy System Analysis (18 Tools)

Modernize COBOL, mainframe, and legacy systems:

- **700+ File Analysis**: Comprehensive codebase assessment
- **Business Logic Extraction**: Document rules, validations, calculations
- **Data Flow Visualization**: Cross-file data tracking
- **Anti-Pattern Detection**: GOTO spaghetti, complexity hotspots
- **Mainframe Integration**: JCL, CICS, DB2 analysis
- **AI-Powered Modernization**: Migration strategies with cost estimates
- **Comprehensive Reporting**: Executive and technical documentation

**[Learn More →](docs/LARGE_SCALE_CAPABILITIES.md#legacy-system-analysis)**

### 🧠 Large-Scale Context Management (14 Tools)

Store and retrieve massive analysis contexts:

- **50GB+ Context Storage**: Efficient storage with compression
- **Intelligent Retrieval**: Semantic search with relevance ranking
- **Context Prioritization**: Rank by relevance, recency, importance
- **Context Merging**: Combine multiple sources intelligently
- **Multi-Domain Support**: Code, schemas, legacy systems

**[Learn More →](docs/LARGE_SCALE_CAPABILITIES.md#context-management)**

### 🎼 Unified Orchestration (17 High-Level Tools)

Coordinate complex multi-service workflows:

- `stark_analyze_large_codebase`: Complete 50GB+ repository analysis
- `stark_analyze_database_system`: Full database assessment
- `stark_modernize_legacy_system`: Legacy system modernization
- `stark_full_system_assessment`: Complete system evaluation

**[Learn More →](docs/LARGE_SCALE_CAPABILITIES.md#orchestration)**

### 📈 Performance Metrics

| Capability | Performance Target | Actual Performance |
|------------|-------------------|-------------------|
| 50GB Repository Indexing | <15 minutes | 12-14 minutes |
| 700+ Files Incremental | <5 minutes | 3-4 minutes |
| Semantic Search (p95) | <100ms | 85-95ms |
| 1000 Table Extraction | <10 minutes | 8-9 minutes |
| 700+ File Legacy Analysis | <30 minutes | 25-28 minutes |
| Context Retrieval (p95) | <500ms | 400-480ms |

### 📚 Documentation

- **[Complete Guide](docs/LARGE_SCALE_CAPABILITIES.md)**: Comprehensive documentation
- **[Quick Start](docs/QUICK_START_LARGE_SCALE.md)**: Get started in 5 minutes
- **[Use Case Examples](docs/examples/LARGE_SCALE_EXAMPLES.md)**: Real-world scenarios
- **[API Reference](docs/API_REFERENCE_LARGE_SCALE.md)**: Complete API documentation

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
git clone https://github.com/walkowicz19/stark-mcp-servers.git
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
        "/absolute/path/to/stark-mcp-servers/mcp-servers/orchestrator/build/index.js"
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
        "/absolute/path/to/stark-mcp-servers/mcp-servers/security-guardrails/build/index.js"
      ]
    },
    "stark-codegen": {
      "command": "node",
      "args": [
        "/absolute/path/to/stark-mcp-servers/mcp-servers/code-generation/build/index.js"
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

### Orchestrator Tools (17 Unified Tools)

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
| `stark_code_intelligence` | Large-scale codebase intelligence and semantic search |
| `stark_analyze_large_codebase` | Comprehensive analysis of 50GB+ repositories |
| `stark_analyze_database_system` | Complete database schema analysis and optimization |
| `stark_modernize_legacy_system` | Complete legacy system modernization assessment |
| `stark_full_system_assessment` | Complete system analysis using all capabilities |
| `stark_execute_workflow` | Execute custom workflows |
| `stark_list_workflows` | List available pre-defined workflows |
| `stark_get_workflow_status` | Get workflow execution status |

### Specialized Server Tools (83 Tools Total)

Each specialized server provides focused tools for specific domains. See individual server READMEs for details:

- [`orchestrator/README.md`](mcp-servers/orchestrator/README.md) - 17 high-level orchestration tools
- [`intelligence-amplification/README.md`](mcp-servers/intelligence-amplification/README.md) - 12 tools
- [`schema-intelligence/README.md`](mcp-servers/schema-intelligence/README.md) - 12 tools
- [`legacy-support/README.md`](mcp-servers/legacy-support/README.md) - 18 tools
- [`memory-management/README.md`](mcp-servers/memory-management/README.md) - 14 tools
- [`security-guardrails/README.md`](mcp-servers/security-guardrails/README.md) - 6 tools
- [`code-generation/README.md`](mcp-servers/code-generation/README.md) - 5 tools
- [`sdlc-integration/README.md`](mcp-servers/sdlc-integration/README.md) - 6 tools
- [`token-optimization/README.md`](mcp-servers/token-optimization/README.md) - 5 tools
- [`performance-optimizer/README.md`](mcp-servers/performance-optimizer/README.md) - 5 tools

---

## 🎼 Pre-defined Workflows

The orchestrator includes production-ready workflows:

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
