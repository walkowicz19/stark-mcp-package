# Security Setup Guide

Quick guide to configure security features in Sytra MCP Orchestrator.

## Admin Password Setup

The orchestrator requires an admin password for dangerous operations (file deletion, system path access, etc.).

### Option 1: Environment Variable (Recommended)

Set the `SYTRA_ADMIN_PASSWORD` environment variable:

**Windows (PowerShell)**:
```powershell
$env:SYTRA_ADMIN_PASSWORD = "your-secure-password"
```

**Linux/Mac**:
```bash
export SYTRA_ADMIN_PASSWORD="your-secure-password"
```

**Permanent Setup** - Add to your IDE config (see below).

### Option 2: File-Based (Auto-Generated)

On first run, if no password is set, the system will prompt you to create one. The encrypted password is stored in `~/.sytra/admin.enc`.

**Password Requirements**:
- Minimum 8 characters
- Stored as bcrypt hash (12 rounds)
- File permissions: 0600 (owner read/write only)

## Workspace Configuration

Set your workspace directory to enforce file operation boundaries:

```powershell
$env:WORKSPACE_DIR = "C:\path\to\your\project"
```

All file operations are restricted to this directory unless admin password is provided.

## IDE Configuration

### Claude Desktop

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sytra-orchestrator": {
      "command": "node",
      "args": ["C:\\path\\to\\sytra-mcp\\mcp-servers\\orchestrator\\build\\index.js"],
      "env": {
        "SYTRA_ADMIN_PASSWORD": "your-secure-password",
        "WORKSPACE_DIR": "C:\\path\\to\\your\\project"
      }
    }
  }
}
```

### Cursor

Edit `.cursor/config.json` in your project:

```json
{
  "mcp": {
    "servers": {
      "sytra-orchestrator": {
        "command": "node",
        "args": ["C:\\path\\to\\sytra-mcp\\mcp-servers\\orchestrator\\build\\index.js"],
        "env": {
          "SYTRA_ADMIN_PASSWORD": "your-secure-password",
          "WORKSPACE_DIR": "${workspaceFolder}"
        }
      }
    }
  }
}
```

### Windsurf

Edit Windsurf settings:

```json
{
  "mcp.servers": {
    "sytra-orchestrator": {
      "command": "node",
      "args": ["C:\\path\\to\\sytra-mcp\\mcp-servers\\orchestrator\\build\\index.js"],
      "env": {
        "SYTRA_ADMIN_PASSWORD": "your-secure-password",
        "WORKSPACE_DIR": "${workspaceFolder}"
      }
    }
  }
}
```

## Security Features

### Credential Redaction
- **Automatic credential protection**: Passwords, tokens, and API keys are automatically redacted from file content
- **MCP config file protection**: Reading MCP configuration files (e.g., `configs/antigravity.json`) automatically redacts sensitive credentials
- **Comprehensive pattern matching**: Detects and redacts:
  - Passwords: `"password": "..."` → `"password": "[REDACTED]"`
  - Admin passwords: `"SYTRA_ADMIN_PASSWORD": "..."` → `"SYTRA_ADMIN_PASSWORD": "[REDACTED]"`
  - API keys: `"api_key": "..."`, `"apiKey": "..."` → `"[REDACTED]"`
  - Tokens: `"token": "..."`, Bearer tokens, JWT tokens → `"[REDACTED]"`
  - AWS credentials: `AWS_SECRET_ACCESS_KEY`, `AWS_ACCESS_KEY_ID` → `"[REDACTED]"`
  - Database connection strings: `postgres://user:password@host` → `postgres://user:[REDACTED]@host`
  - SSH private keys: Content between `-----BEGIN/END PRIVATE KEY-----` → `[REDACTED]`
- **Audit logging**: All redaction events are logged with file path, redaction count, and patterns matched
- **Zero configuration**: Enabled by default, no setup required

**Example - Reading MCP Config**:
```json
// Original file content (configs/antigravity.json):
{
  "SYTRA_ADMIN_PASSWORD": "mysecretpassword123",
  "api_key": "sk-1234567890abcdef"
}

// What the agent sees (automatically redacted):
{
  "SYTRA_ADMIN_PASSWORD": "[REDACTED]",
  "api_key": "[REDACTED]"
}
```

### Workspace Boundary Enforcement
- All file paths validated against workspace directory
- Path traversal attempts blocked (`../`, symlinks outside workspace)
- System paths require admin authentication

### Security Guardrails
- Dangerous operations blocked (delete, rm -rf, sudo, chmod 777)
- Sensitive files protected (.env, .key, credentials.*)
- MCP config files protected (configs/*.json)
- All operations logged in audit trail

### Admin Authentication
- Rate limiting: 5 attempts per 15 minutes
- Automatic blocking: 1 hour after max attempts
- Bcrypt password hashing

## Testing Your Setup

1. **Test workspace validation**:
   ```
   Try to read a file outside workspace - should require auth
   ```

2. **Test sensitive file protection**:
   ```
   Try to delete .env file - should be blocked
   ```

3. **Test admin password**:
   ```
   Provide password when prompted for dangerous operations
   ```

## Troubleshooting

### "Admin password not configured"
- Set `SYTRA_ADMIN_PASSWORD` environment variable
- Or run once to create `~/.sytra/admin.enc`

### "Too many failed attempts"
- Wait 1 hour or restart the orchestrator
- Check password is correct

### "Path is outside workspace boundaries"
- Set `WORKSPACE_DIR` environment variable
- Or provide admin password for out-of-workspace access

### Rate limit issues
- Check `~/.sytra/admin.enc` file permissions (should be 0600)
- Verify password is correct
- Wait for rate limit window to expire

## Security Best Practices

1. **Use strong passwords**: Minimum 12 characters, mix of letters, numbers, symbols
2. **Rotate passwords**: Change admin password periodically
3. **Limit workspace scope**: Set workspace to project directory only
4. **Review audit logs**: Check for suspicious activity
5. **Keep credentials secure**: Never commit passwords to version control

## Advanced Configuration

Edit `mcp-servers/orchestrator/security-config.json`:

```json
{
  "workspaceOnly": true,
  "requirePasswordFor": ["delete", "execute_command"],
  "sensitiveFilePatterns": [
    ".env*",
    "*.key",
    "credentials.*",
    "**/configs/*.json",
    "**/*config*.json"
  ],
  "dangerousOperations": ["delete", "rm", "sudo"],
  "systemPaths": ["/etc", "/sys", "/proc", "C:\\Windows"],
  "credentialRedaction": {
    "enabled": true,
    "patterns": [
      "password",
      "token",
      "api_key",
      "apiKey",
      "secret",
      "SYTRA_ADMIN_PASSWORD",
      "AWS_SECRET_ACCESS_KEY",
      "private_key"
    ],
    "filePatterns": [
      "**/configs/*.json",
      "**/*config*.json",
      "**/.env*",
      "**/credentials*",
      "**/*.pem",
      "**/*.key"
    ]
  }
}
```

### Credential Redaction Configuration

- **enabled**: Enable/disable automatic credential redaction (default: `true`)
- **patterns**: List of credential field names to redact (case-insensitive matching)
- **filePatterns**: Glob patterns for files that should have credentials redacted

**To disable credential redaction** (not recommended):
```json
{
  "credentialRedaction": {
    "enabled": false
  }
}
```

**To add custom patterns**:
```json
{
  "credentialRedaction": {
    "enabled": true,
    "patterns": [
      "password",
      "my_custom_secret",
      "internal_token"
    ]
  }
}
```

## Support

For issues or questions:
- Check logs in orchestrator output
- Review audit trail for blocked operations
- See SECURITY_TESTING.md for test cases