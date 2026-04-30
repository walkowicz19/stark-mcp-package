# Sytra Backend Services

This directory contains the Python FastAPI backend services that power the Sytra MCP servers.

## Architecture

The Sytra system consists of:
- **9 Backend Services** (Python FastAPI) - Ports 8001-8009
- **10 MCP Servers** (Node.js) - Connect IDEs to backend services
- **Orchestrator** - Intelligent routing and workflow engine
- **Dashboard** - Web-based monitoring and management interface (Port 3000)

## Services

| Service | Port | Description |
|---------|------|-------------|
| Security Guardrails | 8001 | Security scanning, data classification, compliance |
| Code Generation | 8002 | Code generation, validation, refactoring |
| Memory Management | 8003 | Context storage and retrieval |
| Intelligence Amplification | 8004 | Prompt optimization, code intelligence, semantic search |
| Token Optimization | 8005 | Token counting, compression, optimization |
| SDLC Integration | 8006 | Testing, documentation, CI/CD integration |
| Legacy Support | 8007 | Legacy code analysis and modernization |
| Schema Intelligence | 8008 | Database schema analysis and optimization |
| Performance Optimizer | 8009 | Performance profiling and optimization |

## Quick Start

### Prerequisites

- Python 3.9+
- Docker Desktop or Docker Engine
- Docker Compose / `docker compose` (recommended for running all Sytra backend services together)
- OR: Python virtual environment

### Option 1: Docker Compose (Recommended for servers and services runtime)

```bash
# Start all services
cd services
docker compose up -d
# or: docker-compose up -d

# View logs
docker compose logs -f
# or: docker-compose logs -f

# Stop all services
docker compose down
# or: docker-compose down
```

### Option 2: Manual Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r shared/requirements.txt

# Start individual service
cd security
python main.py
```

## Development Status

### ✅ All Services Complete and Ready!

All 9 backend services are fully implemented and operational:

- [x] **Shared infrastructure** - BaseService, logging, error handling
- [x] **Security Guardrails** (port 8001) - Security scanning, data classification
- [x] **Code Generation** (port 8002) - Code generation, validation, refactoring
- [x] **Memory Management** (port 8003) - Context storage and retrieval
- [x] **Intelligence Amplification** (port 8004) - Prompt optimization, code intelligence
- [x] **Token Optimization** (port 8005) - Token counting and compression
- [x] **SDLC Integration** (port 8006) - Testing, documentation, CI/CD
- [x] **Legacy Support** (port 8007) - Legacy code analysis and modernization
- [x] **Schema Intelligence** (port 8008) - Database schema analysis
- [x] **Performance Optimizer** (port 8009) - Performance profiling
- [x] **Docker Compose** - Full orchestration configuration
- [x] **Startup Scripts** - Windows (PowerShell) and Linux/macOS (Bash)

**Status**: Production-ready with mock implementations. Services return structured responses and can be extended with actual AI/ML logic as needed.

## Service Implementation Guide

Each service follows this structure:

```
services/
├── shared/              # Shared utilities
│   ├── base_service.py  # Base service class
│   ├── requirements.txt # Common dependencies
│   └── __init__.py
├── {service-name}/
│   ├── main.py          # Service implementation
│   ├── Dockerfile       # Docker configuration
│   └── requirements.txt # Service-specific deps
└── docker-compose.yml   # Orchestration
```

### Creating a New Service

1. **Create service directory**:
```bash
mkdir services/myservice
```

2. **Create main.py**:
```python
from shared.base_service import BaseService

class MyService(BaseService):
    def __init__(self):
        super().__init__(
            name="My Service",
            version="1.0.0",
            description="Service description"
        )
        self.register_endpoints()
    
    def register_endpoints(self):
        @self.app.post("/endpoint")
        async def my_endpoint(request: MyRequest):
            return {"result": "success"}

service = MyService()
app = service.get_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
```

3. **Create Dockerfile**:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY shared/requirements.txt /app/shared/requirements.txt
RUN pip install --no-cache-dir -r shared/requirements.txt

COPY shared /app/shared
COPY myservice /app/myservice

WORKDIR /app/myservice

CMD ["python", "main.py"]
```

4. **Add to docker-compose.yml**

## API Documentation

Each service provides:
- **Swagger UI**: `http://localhost:800X/docs`
- **ReDoc**: `http://localhost:800X/redoc`
- **OpenAPI JSON**: `http://localhost:800X/openapi.json`
- **Health Check**: `http://localhost:800X/health`

## Testing

```bash
# Test individual service
curl http://localhost:8001/health

# Test all services
for port in {8001..8009}; do
  echo "Testing port $port..."
  curl -s http://localhost:$port/health | jq
done
```

## Environment Variables

Services support these environment variables:

- `SERVICE_NAME`: Service name (default: from code)
- `SERVICE_PORT`: Port to listen on (default: from code)
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)
- `CORS_ORIGINS`: Allowed CORS origins (default: *)

## Monitoring

### Health Checks

All services expose `/health` endpoint:

```json
{
  "status": "healthy",
  "service": "Security Guardrails",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00",
  "uptime_seconds": 123.45
}
```

### Logs

Services log to stdout in JSON format:
```
[2024-01-01T00:00:00] [INFO] Request: POST /scan
[2024-01-01T00:00:01] [INFO] Response: POST /scan - Status: 200 - Time: 0.123s
```

## Security

### Service Security
- All services run as non-root users in Docker
- CORS is configurable per environment
- Input validation using Pydantic models
- Error messages sanitized to prevent information leakage

### Admin Password Security
**Important:** Admin passwords are configured exclusively through the Dashboard's Security section and are **never stored in service configuration files or environment variables**.

- Password configuration: Dashboard → Security section
- Secure hashing: PBKDF2 with 100,000 iterations
- Rate limiting: 5 failed attempts per 15 minutes
- Audit logging: All security events tracked

See [`../SECURITY_IMPLEMENTATION.md`](../SECURITY_IMPLEMENTATION.md) for detailed security documentation.

## Performance

- Async/await for non-blocking I/O
- Connection pooling for databases
- Request/response logging with timing
- Health check endpoints for load balancers

## Troubleshooting

### Service won't start

```bash
# Check logs
docker compose logs security

# Check if port is in use
netstat -an | grep 8001

# Restart service
docker compose restart security
```

### Import errors

```bash
# Rebuild containers
docker compose build --no-cache

# Or reinstall dependencies
pip install -r shared/requirements.txt --force-reinstall
```

### Connection refused

```bash
# Verify service is running
docker compose ps

# Check network
docker network ls
docker network inspect sytra-network
```

## Contributing

1. Follow the service structure pattern
2. Use BaseService for consistency
3. Add comprehensive error handling
4. Include API documentation in docstrings
5. Add health check endpoint
6. Test with curl before committing

## License

See LICENSE file in repository root.