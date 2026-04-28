# Stark MCP Servers - Testing Guide

This guide provides comprehensive instructions for testing and verifying MCP servers in the Stark ecosystem.

## Table of Contents

- [Quick Verification](#quick-verification)
- [Testing Methods](#testing-methods)
- [Testing Individual Servers](#testing-individual-servers)
- [Testing with MCP Inspector](#testing-with-mcp-inspector)
- [Manual stdio Testing](#manual-stdio-testing)
- [Verifying Server Responses](#verifying-server-responses)
- [Testing in Production](#testing-in-production)
- [Troubleshooting Test Failures](#troubleshooting-test-failures)

## Quick Verification

After installation, verify servers are working with these quick checks:

### 1. Check Build Artifacts

```bash
# Verify all servers built successfully
ls mcp-servers/*/build/index.js

# Expected output: index.js files for all 10 servers
```

### 2. Verify Backend Services

```bash
# Check all Stark services are running
curl http://localhost:8001/health  # Security Guardrails
curl http://localhost:8002/health  # Code Generation
curl http://localhost:8003/health  # Memory Management
curl http://localhost:8004/health  # Intelligence Amplification
curl http://localhost:8005/health  # Token Optimization
curl http://localhost:8006/health  # SDLC Integration
curl http://localhost:8007/health  # Legacy Support
curl http://localhost:8008/health  # Schema Intelligence
curl http://localhost:8009/health  # Performance Optimizer

# All should return: {"status": "healthy"}
```

### 3. Test in Claude Desktop

1. Open Claude Desktop
2. Look for MCP server indicators in the UI
3. Try a simple command: "classify this data as public"
4. Verify you get a response from the security-guardrails server

## Testing Methods

### Method 1: MCP Inspector (Recommended)

The MCP Inspector provides an interactive web interface for testing servers.

**Advantages:**
- Visual interface for testing tools
- Real-time request/response inspection
- Easy parameter input
- No client configuration needed

**Best for:** Development, debugging, and initial testing

### Method 2: Claude Desktop Integration

Test servers in their production environment.

**Advantages:**
- Tests actual usage scenario
- Validates full integration
- Tests with real AI interactions

**Best for:** End-to-end testing and validation

### Method 3: Manual stdio Testing

Direct communication with servers via stdin/stdout.

**Advantages:**
- Low-level debugging
- No dependencies
- Precise control over messages

**Best for:** Debugging protocol issues and server startup problems

## Testing Individual Servers

### Orchestrator Server

The orchestrator provides high-level tools that route to specialized servers.

```bash
# Start MCP Inspector
npx @modelcontextprotocol/inspector node mcp-servers/orchestrator/build/index.js
```

**Test Cases:**

1. **Code Analysis Tool**
   ```json
   {
     "name": "stark_analyze_code",
     "arguments": {
       "code": "function add(a, b) { return a + b; }",
       "language": "javascript",
       "includeSecurityScan": true
     }
   }
   ```

2. **Workflow Execution**
   ```json
   {
     "name": "stark_execute_workflow",
     "arguments": {
       "workflow_name": "secure-code-generation",
       "context": {
         "language": "python",
         "requirements": "Create a secure password validator"
       }
     }
   }
   ```

**Expected Results:**
- Tool list shows 15 high-level tools
- Responses include data from multiple backend services
- Workflow execution shows step-by-step progress

### Intelligence Amplification Server

Tests prompt optimization, RAG, and reasoning capabilities.

```bash
npx @modelcontextprotocol/inspector node mcp-servers/intelligence-amplification/build/index.js
```

**Test Cases:**

1. **Prompt Optimization**
   ```json
   {
     "name": "optimize_prompt",
     "arguments": {
       "prompt": "Write code",
       "task_type": "generation",
       "optimization_goals": ["clarity", "specificity"]
     }
   }
   ```

2. **RAG Query**
   ```json
   {
     "name": "rag_query",
     "arguments": {
       "query": "How do I implement authentication?",
       "knowledge_base": "technical_docs",
       "top_k": 5
     }
   }
   ```

**Expected Results:**
- Tool list shows 12 intelligence tools
- Optimized prompts are more detailed and structured
- RAG responses include relevant context

### Schema Intelligence Server

Tests database schema analysis and optimization.

```bash
npx @modelcontextprotocol/inspector node mcp-servers/schema-intelligence/build/index.js
```

**Test Cases:**

1. **Schema Analysis**
   ```json
   {
     "name": "analyze_schema",
     "arguments": {
       "schema": "CREATE TABLE users (id INT, name VARCHAR(100));",
       "database_type": "postgresql"
     }
   }
   ```

2. **Migration Planning**
   ```json
   {
     "name": "plan_migration",
     "arguments": {
       "source_schema": "...",
       "target_database": "postgresql",
       "migration_strategy": "incremental"
     }
   }
   ```

**Expected Results:**
- Tool list shows 10 schema tools
- Analysis identifies optimization opportunities
- Migration plans include step-by-step instructions

### Security Guardrails Server

Tests data classification and security controls.

```bash
npx @modelcontextprotocol/inspector node mcp-servers/security-guardrails/build/index.js
```

**Test Cases:**

1. **Data Classification**
   ```json
   {
     "name": "classify_data",
     "arguments": {
       "content": "User email: john@example.com, SSN: 123-45-6789",
       "context": "user_profile"
     }
   }
   ```

2. **Security Scan**
   ```json
   {
     "name": "scan_code",
     "arguments": {
       "code": "password = 'hardcoded123'",
       "language": "python"
     }
   }
   ```

**Expected Results:**
- Tool list shows 10 security tools
- Classification identifies PII and sensitive data
- Security scans detect vulnerabilities

### Code Generation Server

Tests code generation and validation.

```bash
npx @modelcontextprotocol/inspector node mcp-servers/code-generation/build/index.js
```

**Test Cases:**

1. **Generate Code**
   ```json
   {
     "name": "generate_code",
     "arguments": {
       "requirements": "Create a function to validate email addresses",
       "language": "python",
       "style_guide": "pep8"
     }
   }
   ```

2. **Validate Code**
   ```json
   {
     "name": "validate_code",
     "arguments": {
       "code": "def validate_email(email): return '@' in email",
       "language": "python"
     }
   }
   ```

**Expected Results:**
- Tool list shows 10 code generation tools
- Generated code follows style guidelines
- Validation identifies syntax and logic issues

### Memory Management Server

Tests context storage and retrieval.

```bash
npx @modelcontextprotocol/inspector node mcp-servers/memory-management/build/index.js
```

**Test Cases:**

1. **Store Context**
   ```json
   {
     "name": "store_context",
     "arguments": {
       "key": "project_requirements",
       "content": "Build a REST API with authentication",
       "metadata": {"project": "api_v1"}
     }
   }
   ```

2. **Retrieve Context**
   ```json
   {
     "name": "retrieve_context",
     "arguments": {
       "key": "project_requirements"
     }
   }
   ```

**Expected Results:**
- Tool list shows 10 memory tools
- Stored context is retrievable
- Metadata enables filtering

### Token Optimization Server

Tests token counting and optimization.

```bash
npx @modelcontextprotocol/inspector node mcp-servers/token-optimization/build/index.js
```

**Test Cases:**

1. **Count Tokens**
   ```json
   {
     "name": "count_tokens",
     "arguments": {
       "text": "This is a test message for token counting.",
       "model": "gpt-4"
     }
   }
   ```

2. **Optimize Context**
   ```json
   {
     "name": "optimize_context",
     "arguments": {
       "text": "Very long text...",
       "max_tokens": 1000,
       "strategy": "summarize"
     }
   }
   ```

**Expected Results:**
- Tool list shows 10 token tools
- Token counts are accurate
- Optimization reduces token usage

### SDLC Integration Server

Tests requirements analysis and code review.

```bash
npx @modelcontextprotocol/inspector node mcp-servers/sdlc-integration/build/index.js
```

**Test Cases:**

1. **Analyze Requirements**
   ```json
   {
     "name": "analyze_requirements",
     "arguments": {
       "requirements": "Users should be able to login with email and password",
       "format": "user_story"
     }
   }
   ```

2. **Review Code**
   ```json
   {
     "name": "review_code",
     "arguments": {
       "code": "def login(email, password): return True",
       "review_type": "security"
     }
   }
   ```

**Expected Results:**
- Tool list shows 10 SDLC tools
- Requirements are structured and detailed
- Code reviews identify issues and improvements

### Legacy Support Server

Tests legacy code analysis and modernization.

```bash
npx @modelcontextprotocol/inspector node mcp-servers/legacy-support/build/index.js
```

**Test Cases:**

1. **Parse Legacy Code**
   ```json
   {
     "name": "parse_legacy_code",
     "arguments": {
       "code": "IDENTIFICATION DIVISION. PROGRAM-ID. HELLO.",
       "language": "cobol"
     }
   }
   ```

2. **Plan Modernization**
   ```json
   {
     "name": "plan_modernization",
     "arguments": {
       "legacy_code": "...",
       "target_language": "java",
       "modernization_approach": "gradual"
     }
   }
   ```

**Expected Results:**
- Tool list shows 10 legacy tools
- Legacy code is parsed correctly
- Modernization plans are detailed

### Performance Optimizer Server

Tests performance analysis and optimization.

```bash
npx @modelcontextprotocol/inspector node mcp-servers/performance-optimizer/build/index.js
```

**Test Cases:**

1. **Profile Code**
   ```json
   {
     "name": "profile_code",
     "arguments": {
       "code": "for i in range(1000000): print(i)",
       "language": "python"
     }
   }
   ```

2. **Optimize Performance**
   ```json
   {
     "name": "optimize_performance",
     "arguments": {
       "code": "...",
       "optimization_target": "speed"
     }
   }
   ```

**Expected Results:**
- Tool list shows 10 performance tools
- Profiling identifies bottlenecks
- Optimizations improve performance metrics

## Testing with MCP Inspector

The MCP Inspector is the recommended tool for interactive testing.

### Installation

```bash
npm install -g @modelcontextprotocol/inspector
```

### Basic Usage

```bash
# Test a specific server
npx @modelcontextprotocol/inspector node mcp-servers/[server-name]/build/index.js

# Example: Test orchestrator
npx @modelcontextprotocol/inspector node mcp-servers/orchestrator/build/index.js
```

### Inspector Interface

1. **Server Info Tab**: Shows server metadata and capabilities
2. **Tools Tab**: Lists all available tools with descriptions
3. **Resources Tab**: Shows available resources (if any)
4. **Prompts Tab**: Shows available prompts (if any)

### Testing Workflow

1. **Start Inspector**: Launch with target server
2. **Verify Tools**: Check tool list matches expected count
3. **Test Tool**: Select tool and provide test parameters
4. **Inspect Response**: Verify response format and content
5. **Test Edge Cases**: Try invalid inputs and edge cases

### Common Test Scenarios

**Valid Input Test:**
```json
{
  "name": "classify_data",
  "arguments": {
    "content": "john@example.com",
    "context": "email"
  }
}
```

**Invalid Input Test:**
```json
{
  "name": "classify_data",
  "arguments": {
    "content": "",
    "context": "invalid"
  }
}
```

**Missing Parameter Test:**
```json
{
  "name": "classify_data",
  "arguments": {
    "content": "test"
  }
}
```

## Manual stdio Testing

For low-level debugging, test servers directly via stdio.

### Basic stdio Test

```bash
# Start server
node mcp-servers/[server-name]/build/index.js

# Send initialization message
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}' | node mcp-servers/orchestrator/build/index.js
```

### Test Message Sequence

1. **Initialize**
   ```json
   {
     "jsonrpc": "2.0",
     "id": 1,
     "method": "initialize",
     "params": {
       "protocolVersion": "2024-11-05",
       "capabilities": {},
       "clientInfo": {"name": "test-client", "version": "1.0.0"}
     }
   }
   ```

2. **List Tools**
   ```json
   {
     "jsonrpc": "2.0",
     "id": 2,
     "method": "tools/list"
   }
   ```

3. **Call Tool**
   ```json
   {
     "jsonrpc": "2.0",
     "id": 3,
     "method": "tools/call",
     "params": {
       "name": "classify_data",
       "arguments": {
         "content": "test data",
         "context": "general"
       }
     }
   }
   ```

### Expected Response Format

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Classification result..."
      }
    ]
  }
}
```

## Verifying Server Responses

### Response Structure Validation

All MCP tool responses should follow this structure:

```json
{
  "jsonrpc": "2.0",
  "id": "<request-id>",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "<response-content>"
      }
    ]
  }
}
```

### Content Validation

**Security Guardrails Response:**
```json
{
  "classification": "confidential",
  "confidence": 0.95,
  "detected_types": ["email", "pii"],
  "recommendations": ["encrypt", "access_control"]
}
```

**Code Generation Response:**
```json
{
  "generated_code": "def validate_email(email): ...",
  "language": "python",
  "quality_score": 0.9,
  "suggestions": ["add error handling"]
}
```

**Intelligence Amplification Response:**
```json
{
  "optimized_prompt": "Enhanced prompt text...",
  "improvements": ["added context", "clarified requirements"],
  "effectiveness_score": 0.85
}
```

### Error Response Validation

Error responses should follow MCP error format:

```json
{
  "jsonrpc": "2.0",
  "id": "<request-id>",
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": {
      "details": "Missing required parameter: content"
    }
  }
}
```

## Testing in Production

### Health Check Endpoints

Before testing MCP servers, verify backend services:

```bash
# Create health check script
cat > check_services.sh << 'EOF'
#!/bin/bash
services=(
  "8001:Security Guardrails"
  "8002:Code Generation"
  "8003:Memory Management"
  "8004:Intelligence Amplification"
  "8005:Token Optimization"
  "8006:SDLC Integration"
  "8007:Legacy Support"
  "8008:Schema Intelligence"
  "8009:Performance Optimizer"
)

for service in "${services[@]}"; do
  port="${service%%:*}"
  name="${service##*:}"
  if curl -s "http://localhost:$port/health" > /dev/null; then
    echo "✓ $name (port $port) - OK"
  else
    echo "✗ $name (port $port) - FAILED"
  fi
done
EOF

chmod +x check_services.sh
./check_services.sh
```

### Load Testing

Test server performance under load:

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > load-test.yml << 'EOF'
config:
  target: 'http://localhost:8001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Health check"
    requests:
      - get:
          url: "/health"
EOF

# Run load test
artillery run load-test.yml
```

### Integration Testing

Test complete workflows:

```bash
# Test full workflow via orchestrator
npx @modelcontextprotocol/inspector node mcp-servers/orchestrator/build/index.js

# Execute workflow test
{
  "name": "stark_execute_workflow",
  "arguments": {
    "workflow_name": "secure-code-generation",
    "context": {
      "language": "python",
      "requirements": "Create a secure login function"
    }
  }
}
```

## Troubleshooting Test Failures

### Common Issues and Solutions

#### Server Won't Start

**Symptoms:**
- Inspector shows connection error
- Server process exits immediately

**Solutions:**
1. Check build artifacts exist:
   ```bash
   ls mcp-servers/[server-name]/build/index.js
   ```

2. Verify dependencies:
   ```bash
   cd mcp-servers/[server-name]
   npm install
   ```

3. Check for TypeScript errors:
   ```bash
   npm run build
   ```

4. Test with verbose logging:
   ```bash
   DEBUG=* node mcp-servers/[server-name]/build/index.js
   ```

#### Tool Not Found

**Symptoms:**
- Tool list doesn't include expected tools
- "Tool not found" errors

**Solutions:**
1. Verify tool export in tools.ts:
   ```bash
   grep -n "name.*tool_name" mcp-servers/[server-name]/src/tools.ts
   ```

2. Check tool registration in index.ts:
   ```bash
   grep -n "tools" mcp-servers/[server-name]/src/index.ts
   ```

3. Rebuild server:
   ```bash
   cd mcp-servers/[server-name]
   npm run build
   ```

#### Backend Service Connection Failed

**Symptoms:**
- "ECONNREFUSED" errors
- Timeout errors

**Solutions:**
1. Verify service is running:
   ```bash
   curl http://localhost:8001/health
   ```

2. Check port configuration:
   ```bash
   netstat -tlnp | grep 8001
   ```

3. Verify environment variables:
   ```bash
   echo $SECURITY_API_URL
   ```

4. Test direct API call:
   ```bash
   curl -X POST http://localhost:8001/api/v1/classify \
     -H "Content-Type: application/json" \
     -d '{"content": "test"}'
   ```

#### Invalid Response Format

**Symptoms:**
- Malformed JSON responses
- Missing required fields

**Solutions:**
1. Check API response format:
   ```bash
   curl -v http://localhost:8001/api/v1/classify
   ```

2. Verify client.ts error handling:
   ```bash
   grep -n "catch\|error" mcp-servers/[server-name]/src/client.ts
   ```

3. Add response validation:
   ```typescript
   // In client.ts
   console.error('API Response:', JSON.stringify(response, null, 2));
   ```

#### Performance Issues

**Symptoms:**
- Slow response times
- Timeout errors

**Solutions:**
1. Monitor resource usage:
   ```bash
   # Linux/Mac
   top -p $(pgrep node)
   
   # Windows
   tasklist | findstr node
   ```

2. Increase timeout values:
   ```typescript
   // In client.ts
   const client = new StarkApiClient(
     { baseUrl: API_BASE_URL, timeout: 60000 },
     "Service Name"
   );
   ```

3. Profile API endpoints:
   ```bash
   time curl http://localhost:8001/api/v1/classify
   ```

### Debug Logging

Enable debug logging for detailed troubleshooting:

```typescript
// Add to index.ts
console.error(`[${new Date().toISOString()}] Tool called: ${name}`);
console.error(`[${new Date().toISOString()}] Arguments:`, JSON.stringify(args, null, 2));
```

### Test Automation

Create automated test scripts:

```bash
# Create test runner
cat > test-all-servers.sh << 'EOF'
#!/bin/bash
servers=(
  "orchestrator"
  "intelligence-amplification"
  "schema-intelligence"
  "security-guardrails"
  "code-generation"
  "memory-management"
  "token-optimization"
  "sdlc-integration"
  "legacy-support"
  "performance-optimizer"
)

for server in "${servers[@]}"; do
  echo "Testing $server..."
  if node mcp-servers/$server/build/index.js --test 2>/dev/null; then
    echo "✓ $server - OK"
  else
    echo "✗ $server - FAILED"
  fi
done
EOF

chmod +x test-all-servers.sh
./test-all-servers.sh
```

## Next Steps

After successful testing:

1. Review the [Usage Guide](USAGE_GUIDE.md) for practical examples
2. Check the [Troubleshooting Guide](TROUBLESHOOTING.md) for ongoing issues
3. Explore individual server READMEs for advanced features
4. Set up monitoring for production deployments

For additional help, see the [Installation Guide](INSTALLATION.md) or contact support.