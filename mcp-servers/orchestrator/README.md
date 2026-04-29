# Sytra Orchestrator MCP Server

The Sytra Orchestrator is a powerful Model Context Protocol (MCP) server that provides intelligent routing and workflow orchestration capabilities for the Sytra AI development platform. It unifies 9 specialized services into a cohesive system with 16 high-level tools and pre-defined workflows.

## Overview

The Orchestrator acts as the central coordination layer for the Sytra platform, providing:

- **Intelligent Routing**: Automatically routes requests to appropriate services based on content analysis
- **Workflow Orchestration**: Executes complex multi-step workflows with dependency resolution
- **Unified Interface**: 16 high-level tools that abstract 56+ specialized service tools
- **Pre-defined Workflows**: Ready-to-use workflows for common development tasks
- **Large-Scale Capabilities**: Support for 50GB+ repositories with 700+ files
- **Database Intelligence**: Complete schema analysis and optimization
- **Legacy Modernization**: Advanced COBOL, mainframe, and legacy system assessment
- **Error Handling**: Robust retry mechanisms and error recovery
- **Parallel Execution**: Optimizes workflow execution with parallel step processing
- **Proactive AI Response**: Automatically detects when assistance is needed and offers help without being explicitly called

## Architecture

### Services Integrated

The Orchestrator coordinates the following 9 specialized services:

1. **Security Guardrails** (port 8001) - Data classification, access control, encryption
2. **Code Generation** (port 8002) - Code generation, validation, refactoring
3. **Memory Management** (port 8003) - Context storage, retrieval, compression
4. **Intelligence Amplification** (port 8004) - Prompt optimization, task decomposition, RAG, **large-scale code intelligence**
5. **Token Optimization** (port 8005) - Token counting, context optimization, pruning
6. **SDLC Integration** (port 8006) - Requirements analysis, code review, testing
7. **Legacy Support** (port 8007) - Legacy code parsing, translation, modernization, **advanced legacy assessment**
8. **Performance Optimizer** (port 8009) - Profiling, optimization, benchmarking
9. **Schema Intelligence** (port 8010) - **Database schema analysis, optimization, and documentation**

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- All 8 Sytra services running (or accessible via network)

### Setup

```bash
# Navigate to orchestrator directory
cd mcp-servers/orchestrator

# Install dependencies
npm install

# Build the project
npm run build

# The server is now ready to use
```

## Configuration

### Environment Variables

Create a `.env` file or set the following environment variables:

```bash
# Service URLs
STARK_SECURITY_URL=http://localhost:8001
STARK_CODEGEN_URL=http://localhost:8002
STARK_MEMORY_URL=http://localhost:8003
STARK_INTELLIGENCE_URL=http://localhost:8004
STARK_TOKENS_URL=http://localhost:8005
STARK_SDLC_URL=http://localhost:8006
STARK_LEGACY_URL=http://localhost:8007
STARK_PERFORMANCE_URL=http://localhost:8009
STARK_SCHEMA_URL=http://localhost:8010

# Orchestrator Settings
STARK_WORKFLOW_TIMEOUT=300000
STARK_MAX_RETRIES=3
STARK_LOG_LEVEL=info
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sytra": {
      "command": "node",
      "args": [
        "C:/path/to/mcp-servers/orchestrator/build/index.js"
      ],
      "env": {
        "STARK_SECURITY_URL": "http://localhost:8001",
        "STARK_CODEGEN_URL": "http://localhost:8002",
        "STARK_MEMORY_URL": "http://localhost:8003",
        "STARK_INTELLIGENCE_URL": "http://localhost:8004",
        "STARK_TOKENS_URL": "http://localhost:8005",
        "STARK_SDLC_URL": "http://localhost:8006",
        "STARK_LEGACY_URL": "http://localhost:8007",
        "STARK_PERFORMANCE_URL": "http://localhost:8009"
      }
    }
  }
}
```

## High-Level Tools

The Orchestrator provides 16 unified high-level tools:

### 1. `sytra_analyze_code`

Comprehensive code analysis combining security, performance, and complexity metrics.

**Parameters:**
- `code` (string, required): Code to analyze
- `language` (string, required): Programming language
- `includeSecurityScan` (boolean): Include security scanning (default: true)
- `includePerformanceAnalysis` (boolean): Include performance profiling (default: true)
- `includeComplexityMetrics` (boolean): Include complexity metrics (default: true)

**Example:**
```json
{
  "code": "def calculate(x, y): return x + y",
  "language": "python",
  "includeSecurityScan": true
}
```

### 2. `sytra_generate_secure_code`

Generate code with automatic security validation and best practices.

**Parameters:**
- `requirements` (string, required): Code requirements
- `language` (string, required): Target language
- `securityLevel` (string): Security level - standard, high, or critical
- `includeTests` (boolean): Generate unit tests (default: true)
- `includeDocumentation` (boolean): Generate documentation (default: true)

### 3. `sytra_modernize_legacy`

Modernize legacy code with translation and optimization.

**Parameters:**
- `legacyCode` (string, required): Legacy code to modernize
- `sourceLanguage` (string, required): Source language (cobol, fortran, assembly, rpg)
- `targetLanguage` (string, required): Target language (python, java, javascript, typescript)
- `includeMigrationPlan` (boolean): Generate migration plan (default: true)

### 4. `sytra_optimize_workflow`

Optimize development workflow with intelligent suggestions.

**Parameters:**
- `workflowDescription` (string, required): Current workflow description
- `currentMetrics` (object): Current performance metrics
- `optimizationGoals` (array): Optimization goals

### 5. `sytra_full_sdlc_cycle`

Execute complete SDLC from requirements to deployment.

**Parameters:**
- `requirements` (string, required): Project requirements
- `projectType` (string): Type of project
- `includeDeployment` (boolean): Include deployment config
- `targetEnvironment` (string): Target deployment environment

### 6. `sytra_intelligent_refactor`

AI-powered code refactoring with best practices.

**Parameters:**
- `code` (string, required): Code to refactor
- `language` (string, required): Programming language
- `refactoringGoals` (array): Refactoring goals
- `preserveTests` (boolean): Preserve existing tests (default: true)

### 7. `sytra_security_audit`

Complete security audit with vulnerability detection.

**Parameters:**
- `code` (string, required): Code to audit
- `language` (string, required): Programming language
- `auditDepth` (string): Audit depth - basic, standard, or comprehensive
- `includeRemediation` (boolean): Include remediation suggestions (default: true)

### 8. `sytra_performance_tune`

End-to-end performance optimization and tuning.

**Parameters:**
- `code` (string, required): Code to optimize
- `language` (string, required): Programming language
- `targetMetrics` (object): Target performance metrics
- `optimizationLevel` (string): Optimization level - conservative, balanced, or aggressive

### 9. `sytra_memory_optimize`

Context and memory optimization for AI interactions.

**Parameters:**
- `context` (string, required): Context to optimize
- `maxTokens` (number): Maximum token count
- `preserveImportantInfo` (boolean): Preserve important information (default: true)

### 10. `sytra_analyze_large_codebase`

**NEW** - Comprehensive analysis of 50GB+ repositories with 700+ files using incremental indexing and semantic search.

**Parameters:**
- `repo_url` (string): Repository URL to analyze
- `repo_id` (string): Existing repository ID (if already indexed)
- `analysis_type` (string): Type of analysis - full, incremental, or targeted
- `include_indexing` (boolean): Index repository before analysis (default: true)
- `include_dependencies` (boolean): Analyze dependencies (default: true)
- `include_complexity` (boolean): Analyze code complexity (default: true)
- `target_paths` (array): Specific paths to analyze (for targeted analysis)

**Example:**
```json
{
  "repo_url": "https://github.com/large-org/massive-repo",
  "analysis_type": "full",
  "include_indexing": true,
  "include_dependencies": true
}
```

### 11. `sytra_analyze_database_system`

**NEW** - Complete database schema analysis and optimization with relationship detection and query pattern analysis.

**Parameters:**
- `connection` (object): Database connection details (type, host, port, database, username, password)
- `schema_id` (string): Existing schema ID (if already extracted)
- `analysis_scope` (string): Scope - basic, standard, or comprehensive
- `include_extraction` (boolean): Extract schema from database (default: true)
- `include_relationships` (boolean): Detect relationships (default: true)
- `include_query_analysis` (boolean): Analyze query patterns (default: false)
- `query_log_path` (string): Path to query log file
- `include_optimization` (boolean): Suggest optimizations (default: true)
- `generate_documentation` (boolean): Generate documentation (default: true)

**Example:**
```json
{
  "connection": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "database": "production_db",
    "username": "admin",
    "password": "secret"
  },
  "analysis_scope": "comprehensive",
  "include_optimization": true
}
```

### 12. `sytra_modernize_legacy_system`

**NEW** - Complete legacy system modernization assessment with business logic extraction and migration planning.

**Parameters:**
- `legacy_code_path` (string): Path to legacy codebase
- `source_language` (string, required): Legacy language - cobol, fortran, assembly, rpg, or jcl
- `target_language` (string): Target modern language - python, java, javascript, typescript, or go
- `assessment_depth` (string): Depth - quick, standard, or comprehensive
- `include_business_logic` (boolean): Extract business logic (default: true)
- `include_data_structures` (boolean): Analyze data structures (default: true)
- `include_dependencies` (boolean): Map dependencies (default: true)
- `generate_migration_plan` (boolean): Generate migration plan (default: true)
- `risk_assessment` (boolean): Perform risk assessment (default: true)

**Example:**
```json
{
  "legacy_code_path": "/path/to/cobol/system",
  "source_language": "cobol",
  "target_language": "java",
  "assessment_depth": "comprehensive",
  "generate_migration_plan": true
}
```

### 13. `sytra_full_system_assessment`

**NEW** - Complete system analysis using all capabilities including code intelligence, database analysis, security audit, and performance profiling.

**Parameters:**
- `system_type` (string, required): Type - web, enterprise, legacy, microservices, or monolith
- `codebase_path` (string): Path to codebase
- `repo_url` (string): Repository URL
- `database_connection` (object): Database connection details
- `assessment_goals` (array): Goals - modernization, optimization, security, scalability, maintainability
- `include_codebase_analysis` (boolean): Analyze codebase (default: true)
- `include_database_analysis` (boolean): Analyze database (default: true)
- `include_security_audit` (boolean): Perform security audit (default: true)
- `include_performance_analysis` (boolean): Analyze performance (default: true)
- `include_legacy_assessment` (boolean): Assess legacy components (default: false)
- `generate_report` (boolean): Generate comprehensive report (default: true)

**Example:**
```json
{
  "system_type": "enterprise",
  "repo_url": "https://github.com/company/system",
  "database_connection": {
    "type": "postgresql",
    "host": "localhost",
    "database": "app_db"
  },
  "assessment_goals": ["modernization", "security", "scalability"],
  "generate_report": true
}
```

### 14. `sytra_execute_workflow`

Execute a custom or pre-defined workflow.

**Parameters:**
- `workflowId` (string): ID of pre-defined workflow
- `workflowDefinition` (object): Custom workflow definition
- `inputs` (object, required): Workflow input parameters
- `async` (boolean): Execute asynchronously (default: false)

### 15. `sytra_list_workflows`

List available pre-defined workflows.

**Parameters:**
- `category` (string): Filter by category
- `tags` (array): Filter by tags

### 16. `sytra_get_workflow_status`

Get status of a running workflow.

**Parameters:**
- `workflowId` (string, required): Workflow execution ID
- `includeStepDetails` (boolean): Include detailed step information

## Pre-defined Workflows

### 1. Large Codebase Analysis

**NEW** - **ID:** `large-codebase-analysis`
**Duration:** 30-60 minutes
**Steps:** 8

Comprehensive analysis of 50GB+ repositories with 700+ files using incremental indexing, semantic search, dependency analysis, and complexity metrics.

**Required Inputs:**
- `repo_url` or `repo_id`: Repository to analyze
- `analysis_type`: Type of analysis (full, incremental, targeted)

**Features:**
- Incremental indexing with caching
- Semantic code search for understanding structure
- Dependency analysis with impact radius
- Code complexity metrics
- Hotspot identification
- Comprehensive analysis report

### 2. Database Modernization

**NEW** - **ID:** `database-modernization`
**Duration:** 15-30 minutes
**Steps:** 9

Complete database schema analysis, optimization, and modernization planning with relationship detection and query pattern analysis.

**Required Inputs:**
- `connection`: Database connection details OR
- `schema_id`: Existing schema ID

**Features:**
- Schema extraction from multiple database types
- Automatic relationship detection
- Data profiling and quality checks
- Query pattern analysis (N+1 detection)
- Index suggestions
- ERD generation in Mermaid format
- Comprehensive documentation
- Optimization recommendations

### 3. Legacy System Assessment

**NEW** - **ID:** `legacy-system-assessment`
**Duration:** 20-45 minutes
**Steps:** 12

Complete evaluation of legacy systems (COBOL, mainframe, etc.) for modernization including business logic extraction, anti-pattern detection, and migration planning.

**Required Inputs:**
- `source_language`: Legacy language (cobol, fortran, assembly, rpg, jcl)
- `legacy_code_path`: Path to legacy codebase (optional)

**Features:**
- Legacy code parsing and structure analysis
- Business logic extraction
- Data structure analysis (copybooks, JCL)
- Dependency mapping
- Anti-pattern detection
- Complexity assessment
- Risk assessment
- Translation preview to modern language
- Comprehensive migration plan
- Detailed assessment report

### 4. Secure Code Generation

**ID:** `secure-code-generation`
**Duration:** 5-10 minutes
**Steps:** 6

Generates code with security validation, token optimization, test generation, and documentation.

**Required Inputs:**
- `requirements`: Code requirements
- `language`: Target programming language
- `framework`: Framework to use (optional)

### 5. Legacy Modernization (Basic)

**ID:** `legacy-modernization`
**Duration:** 10-20 minutes
**Steps:** 10

Modernizes legacy code through parsing, analysis, translation, optimization, and migration planning.

**Required Inputs:**
- `legacy_code`: Legacy code to modernize
- `source_language`: Source language (cobol, fortran, etc.)
- `target_language`: Target modern language

### 6. Full SDLC Cycle

**ID:** `full-sdlc-cycle`
**Duration:** 15-30 minutes
**Steps:** 13

Complete software development lifecycle from requirements analysis to CI/CD setup.

**Required Inputs:**
- `requirements`: Project requirements
- `language`: Programming language
- `framework`: Framework to use

### 7. Performance Optimization

**ID:** `performance-optimization`
**Duration:** 10-15 minutes
**Steps:** 11

Comprehensive performance analysis and optimization including CPU, memory, I/O profiling.

**Required Inputs:**
- `code`: Code to optimize
- `language`: Programming language

## Workflow Features

### Dependency Resolution

The workflow engine automatically resolves dependencies between steps and determines optimal execution order:

```json
{
  "steps": [
    {
      "id": "step1",
      "service": "codegen",
      "tool": "generate_code"
    },
    {
      "id": "step2",
      "service": "security",
      "tool": "scan_code",
      "dependsOn": ["step1"]
    }
  ]
}
```

### Parallel Execution

Independent steps are executed in parallel for optimal performance:

```json
{
  "steps": [
    { "id": "profile-cpu", "service": "performance", "tool": "profile_cpu" },
    { "id": "profile-memory", "service": "performance", "tool": "profile_memory" },
    { "id": "analyze", "service": "codegen", "tool": "analyze", "dependsOn": ["profile-cpu", "profile-memory"] }
  ]
}
```

### Variable Interpolation

Reference outputs from previous steps using `{{variable}}` syntax:

```json
{
  "inputs": {
    "code": "{{generate-code.output}}",
    "language": "{{language}}"
  }
}
```

### Conditional Execution

Execute steps conditionally based on previous results:

```json
{
  "condition": "{{security-scan.score}} >= 80"
}
```

### Error Handling

Configure error handling strategies per workflow:

```json
{
  "errorHandling": {
    "onStepFailure": "stop",
    "notifyOnError": true
  }
}
```

### Retry Policies

Configure retry behavior for individual steps:

```json
{
  "retryPolicy": {
    "maxAttempts": 3,
    "backoffMs": 1000,
    "backoffMultiplier": 2
  }
}
```

## Creating Custom Workflows

Create a JSON file in the `workflows/` directory:

```json
{
  "id": "my-custom-workflow",
  "name": "My Custom Workflow",
  "description": "Description of what this workflow does",
  "version": "1.0.0",
  "metadata": {
    "category": "development",
    "tags": ["custom", "example"]
  },
  "steps": [
    {
      "id": "step1",
      "service": "codegen",
      "tool": "generate_code",
      "inputs": {
        "requirements": "{{requirements}}",
        "language": "{{language}}"
      },
      "outputs": ["code"],
      "retryPolicy": {
        "maxAttempts": 2,
        "backoffMs": 1000,
        "backoffMultiplier": 2
      }
    }
  ],
  "errorHandling": {
    "onStepFailure": "stop"
  },
  "timeout": 600000
}
```

## Proactive AI Response System

### Overview

The Proactive Response System allows SYTRA to automatically monitor conversations and offer assistance when relevant, without being explicitly invoked. This feature uses pattern matching and confidence scoring to detect scenarios where SYTRA can provide value.

### Features

- **Automatic Pattern Detection**: Monitors for errors, questions, security concerns, performance issues, and more
- **Confidence Scoring**: Only responds when confidence threshold is met (default: 75%)
- **Rate Limiting**: Prevents intrusive behavior with cooldown periods and hourly limits
- **User Feedback Learning**: Adjusts confidence scores based on user acceptance/rejection
- **Extensible Patterns**: Easy to add new detection patterns
- **Comprehensive Logging**: Tracks all proactive responses for analysis

### Configuration

The proactive response system is configured via `proactive-config.json`:

```json
{
  "enabled": false,
  "confidenceThreshold": 0.75,
  "cooldownPeriodMs": 300000,
  "maxProactiveResponsesPerHour": 10,
  "patterns": {
    "errors": {
      "enabled": true,
      "confidence": 0.9,
      "keywords": ["error", "exception", "failed", "crash"],
      "response": "I noticed an error. Would you like me to investigate?"
    }
  }
}
```

### Enabling Proactive Responses

1. **Edit Configuration File**:
   ```bash
   cd mcp-servers/orchestrator
   # Edit proactive-config.json
   ```

2. **Set `enabled` to `true`**:
   ```json
   {
     "enabled": true,
     "confidenceThreshold": 0.75
   }
   ```

3. **Restart the Orchestrator**:
   ```bash
   npm run build
   # Restart your MCP server
   ```

### Detection Patterns

The system includes 8 built-in detection patterns:

#### 1. **Errors** (Confidence: 0.9)
Detects error messages, exceptions, stack traces, and crashes.

**Keywords**: error, exception, failed, crash, stack trace, undefined, null reference

**Example Trigger**: "TypeError: Cannot read property 'name' of undefined"

#### 2. **Code Questions** (Confidence: 0.8)
Detects questions about code or development.

**Keywords**: how do i, how to, what is, why does, can you explain

**Example Trigger**: "How do I implement authentication in Express?"

#### 3. **Code Review** (Confidence: 0.7)
Detects requests for code review or feedback.

**Keywords**: review this, check this code, is this correct, feedback on

**Example Trigger**: "Does this look good? Can you review it?"

#### 4. **Security** (Confidence: 0.95)
Detects security-related concerns (highest priority).

**Keywords**: security, vulnerability, injection, xss, csrf, password, credential

**Example Trigger**: "Is this SQL query vulnerable to injection?"

#### 5. **Performance** (Confidence: 0.75)
Detects performance issues and optimization needs.

**Keywords**: slow, performance, optimize, bottleneck, memory leak, latency

**Example Trigger**: "This query is taking too long to execute"

#### 6. **Architecture** (Confidence: 0.7)
Detects architectural and design pattern discussions.

**Keywords**: architecture, design pattern, refactor, scalable, maintainable

**Example Trigger**: "What's the best architecture for a microservices system?"

#### 7. **Testing** (Confidence: 0.75)
Detects testing-related discussions.

**Keywords**: test, unit test, integration test, coverage, mock

**Example Trigger**: "I need to write tests for this function"

#### 8. **Documentation** (Confidence: 0.7)
Detects documentation needs.

**Keywords**: document, documentation, readme, comment, explain

**Example Trigger**: "This code needs better documentation"

### Configuration Options

#### Global Settings

- **`enabled`** (boolean): Master switch for proactive responses
- **`confidenceThreshold`** (number, 0-1): Minimum confidence to trigger response
- **`cooldownPeriodMs`** (number): Milliseconds between proactive responses (default: 300000 = 5 minutes)
- **`maxProactiveResponsesPerHour`** (number): Maximum responses per hour (default: 10)

#### Pattern Settings

Each pattern can be configured with:

- **`enabled`** (boolean): Enable/disable this specific pattern
- **`confidence`** (number, 0-1): Base confidence score for this pattern
- **`keywords`** (array): Keywords to match (case-insensitive)
- **`response`** (string): Message to display when triggered

#### Context Window

- **`maxMessages`** (number): Maximum conversation messages to track (default: 5)
- **`maxTokensPerMessage`** (number): Maximum tokens per message (default: 1000)

#### Logging

- **`logProactiveResponses`** (boolean): Log when proactive responses trigger
- **`logPatternMatches`** (boolean): Log pattern matches
- **`logConfidenceScores`** (boolean): Log confidence scores

#### User Feedback

- **`enabled`** (boolean): Enable feedback tracking
- **`trackAcceptance`** (boolean): Track user acceptance/rejection
- **`adjustConfidenceBasedOnFeedback`** (boolean): Auto-adjust confidence scores

### Example Scenarios

#### Scenario 1: Error Detection

**User Message**: "I'm getting this error: TypeError: Cannot read property 'map' of undefined"

**SYTRA Response**:
```
🤖 SYTRA Proactive Assistant

I noticed an error in your output. I can help analyze and fix this issue. Would you like me to investigate?

📋 Error Analysis:
- Type: runtime
- Severity: high

Matched Keywords: error, undefined, cannot read property
Confidence: 92.5%

Reply with "yes" or "proceed" to accept my assistance, or continue with your task.
```

#### Scenario 2: Security Concern

**User Message**: "I'm storing passwords like this: password = request.body.password"

**SYTRA Response**:
```
🤖 SYTRA Proactive Assistant

I detected a potential security concern. I can perform a security audit and provide recommendations. Would you like me to analyze this?

🔒 Security Concern:
- Type: password_storage
- This requires immediate attention

Matched Keywords: password
Confidence: 95.0%

Reply with "yes" or "proceed" to accept my assistance, or continue with your task.
```

#### Scenario 3: Performance Issue

**User Message**: "This database query is really slow, taking 5+ seconds"

**SYTRA Response**:
```
🤖 SYTRA Proactive Assistant

I noticed a performance-related discussion. I can analyze and suggest optimizations. Would you like me to help?

⚡ Performance Issue:
- Type: slow_query

Matched Keywords: slow, query
Confidence: 82.3%

Reply with "yes" or "proceed" to accept my assistance, or continue with your task.
```

### Customizing Patterns

You can add custom patterns to `proactive-config.json`:

```json
{
  "patterns": {
    "myCustomPattern": {
      "enabled": true,
      "confidence": 0.8,
      "keywords": [
        "custom keyword 1",
        "custom keyword 2"
      ],
      "response": "I can help with this custom scenario. Would you like assistance?"
    }
  }
}
```

### Disabling Specific Patterns

To disable a pattern without removing it:

```json
{
  "patterns": {
    "errors": {
      "enabled": false
    }
  }
}
```

### Adjusting Sensitivity

To make SYTRA more or less proactive:

**More Proactive** (lower threshold):
```json
{
  "confidenceThreshold": 0.6,
  "cooldownPeriodMs": 180000,
  "maxProactiveResponsesPerHour": 15
}
```

**Less Proactive** (higher threshold):
```json
{
  "confidenceThreshold": 0.85,
  "cooldownPeriodMs": 600000,
  "maxProactiveResponsesPerHour": 5
}
```

### Monitoring and Analytics

The system tracks:

- Total messages analyzed
- Proactive responses triggered
- Pattern matches by type
- Average confidence scores
- User acceptance rates

Access statistics through the monitor's `getStats()` method or check logs.

### Best Practices

1. **Start Disabled**: Test patterns before enabling in production
2. **Adjust Thresholds**: Fine-tune confidence thresholds based on feedback
3. **Monitor Logs**: Review proactive response logs regularly
4. **User Feedback**: Encourage users to provide feedback on helpfulness
5. **Pattern Refinement**: Add/remove keywords based on false positives/negatives
6. **Rate Limiting**: Keep cooldown periods reasonable to avoid annoyance
7. **Context Awareness**: Ensure patterns are specific enough to avoid false triggers

### Troubleshooting Proactive Responses

#### Too Many False Positives

- Increase `confidenceThreshold`
- Refine pattern keywords to be more specific
- Increase `cooldownPeriodMs`
- Reduce `maxProactiveResponsesPerHour`

#### Missing Relevant Triggers

- Decrease `confidenceThreshold`
- Add more keywords to patterns
- Check if pattern is enabled
- Review logs for near-misses

#### Performance Impact

- Reduce `maxMessages` in context window
- Disable logging if not needed
- Disable unused patterns

### Security Considerations

- Proactive responses respect all security middleware
- No sensitive data is logged in proactive responses
- Pattern matching is performed on sanitized content
- User feedback is stored locally and not transmitted
## Parallel Task Execution

### Overview

SYTRA includes an intelligent parallel execution system that automatically classifies tasks by complexity and executes them accordingly:

- **Simple/Medium Tasks**: Run in parallel for maximum efficiency
- **Complex Tasks**: Run individually for focused attention and resource allocation

### Task Complexity Classification

Tasks are automatically classified into three categories:

#### Simple Tasks (Score: 0-29)
- Syntax checking, code formatting, linting
- File reading, basic validation
- **Execution**: Parallel (up to 5 tasks simultaneously)

#### Medium Tasks (Score: 30-59)
- Code review, test generation, documentation
- Code generation, bug fixing
- **Execution**: Parallel (up to 5 tasks simultaneously)

#### Complex Tasks (Score: 60+)
- Full system assessment, legacy modernization
- Database migration, security audit
- Architecture design, large codebase analysis
- **Execution**: Sequential (one at a time)

### Configuration

Configure parallel execution in `proactive-config.json`:

```json
{
  "parallelExecution": {
    "enabled": true,
    "maxParallelTasks": 5,
    "maxConcurrentBatches": 2,
    "timeoutMs": 300000,
    "retryFailedTasks": true,
    "maxRetries": 2,
    "complexityThresholds": {
      "simple": 30,
      "medium": 60
    }
  }
}
```

### Performance Benefits

- **Up to 5x faster** for multiple simple tasks
- **Optimized resource usage** for complex operations
- **Automatic load balancing** across task types
- **Intelligent timeout management** based on complexity

### Best Practices

1. **Batch Similar Tasks**: Group similar complexity tasks together
2. **Monitor Performance**: Review execution statistics regularly
3. **Adjust Thresholds**: Fine-tune complexity thresholds based on your workload
4. **Resource Planning**: Consider system resources when setting `maxParallelTasks`


## Troubleshooting

### Service Connection Errors

If you see connection errors:

1. Verify all services are running
2. Check service URLs in environment variables
3. Ensure network connectivity
4. Check service logs for errors

### Workflow Validation Errors

If workflow validation fails:

1. Check for circular dependencies
2. Verify all step IDs are unique
3. Ensure all dependencies reference existing steps
4. Validate JSON syntax

### Performance Issues

If workflows are slow:

1. Check service response times
2. Review parallel execution opportunities
3. Optimize step dependencies
4. Increase timeout values if needed

## Development

### Building

```bash
npm run build
```

### Watching for Changes

```bash
npm run watch
```

### Running Tests

```bash
npm test
```

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions, please visit the Sytra project repository.