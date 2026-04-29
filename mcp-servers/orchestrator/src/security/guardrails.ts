/**
 * Security Guardrails Layer
 * Detects and blocks dangerous file operations
 */

import * as path from 'path';
import { logger } from '../utils/logger.js';

export interface GuardrailResult {
  allowed: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  requiresAuth?: boolean;
  blockedOperation?: string;
}

export interface SecurityConfig {
  sensitiveFilePatterns: string[];
  dangerousOperations: string[];
  systemPaths: string[];
  workspaceOnly: boolean;
  requirePasswordFor: string[];
}

export class SecurityGuardrails {
  private config: SecurityConfig;
  private auditLog: Array<{
    timestamp: Date;
    operation: string;
    target: string;
    result: 'allowed' | 'blocked';
    reason?: string;
  }> = [];

  constructor(config: SecurityConfig) {
    this.config = config;
    logger.info('SecurityGuardrails initialized', {
      sensitivePatterns: config.sensitiveFilePatterns.length,
      dangerousOps: config.dangerousOperations.length,
    });
  }

  /**
   * Check if a file operation is allowed
   */
  checkOperation(operation: string, filePath: string, toolName?: string): GuardrailResult {
    const normalizedPath = path.normalize(filePath);
    const fileName = path.basename(normalizedPath);

    // Check for dangerous operations
    if (this.isDangerousOperation(operation)) {
      const isSensitive = this.isSensitiveFile(fileName, normalizedPath);
      
      if (isSensitive) {
        this.logOperation(operation, normalizedPath, 'blocked', 'Dangerous operation on sensitive file');
        return {
          allowed: false,
          reason: `Dangerous operation "${operation}" blocked on sensitive file: ${fileName}`,
          severity: 'critical',
          requiresAuth: true,
          blockedOperation: operation,
        };
      }

      // Dangerous operation on non-sensitive file still requires auth
      this.logOperation(operation, normalizedPath, 'blocked', 'Dangerous operation requires authentication');
      return {
        allowed: false,
        reason: `Dangerous operation "${operation}" requires admin authentication`,
        severity: 'high',
        requiresAuth: true,
        blockedOperation: operation,
      };
    }

    // Check for sensitive file access
    if (this.isSensitiveFile(fileName, normalizedPath)) {
      const isReadOnly = this.isReadOnlyOperation(operation);
      
      if (!isReadOnly) {
        this.logOperation(operation, normalizedPath, 'blocked', 'Write operation on sensitive file');
        return {
          allowed: false,
          reason: `Write operation blocked on sensitive file: ${fileName}`,
          severity: 'high',
          requiresAuth: true,
        };
      }

      // Check if this is an MCP config file - these require special handling
      if (this.isMCPConfigFile(normalizedPath)) {
        this.logOperation(operation, normalizedPath, 'allowed', 'Read operation on MCP config file (will be redacted)');
        logger.warn('MCP config file accessed - credentials will be redacted', {
          operation,
          path: normalizedPath,
          toolName
        });
      } else {
        // Read operations on other sensitive files are logged but allowed
        this.logOperation(operation, normalizedPath, 'allowed', 'Read operation on sensitive file');
        logger.warn('Sensitive file accessed', { operation, path: normalizedPath, toolName });
      }
    }

    // Operation is allowed
    this.logOperation(operation, normalizedPath, 'allowed');
    return { allowed: true };
  }

  /**
   * Check if operation is dangerous
   */
  private isDangerousOperation(operation: string): boolean {
    const opLower = operation.toLowerCase();
    return this.config.dangerousOperations.some(dangerous => 
      opLower.includes(dangerous.toLowerCase())
    );
  }

  /**
   * Check if file is sensitive
   */
  private isSensitiveFile(fileName: string, fullPath: string): boolean {
    return this.config.sensitiveFilePatterns.some(pattern => {
      // Convert glob pattern to regex
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      
      const regex = new RegExp(`^${regexPattern}$`, 'i');
      
      // Check both filename and full path
      return regex.test(fileName) || regex.test(fullPath);
    });
  }

  /**
   * Check if operation is read-only
   */
  private isReadOnlyOperation(operation: string): boolean {
    const readOnlyOps = [
      'read', 'get', 'fetch', 'load', 'view', 'show', 'list',
      'cat', 'head', 'tail', 'grep', 'search', 'find'
    ];
    
    const opLower = operation.toLowerCase();
    return readOnlyOps.some(readOp => opLower.includes(readOp));
  }

  /**
   * Check if file is an MCP config file
   */
  private isMCPConfigFile(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();
    
    // MCP config file patterns
    const mcpConfigPatterns = [
      /\/configs\/.*\.json$/,
      /\/config\/.*\.json$/,
      /mcp.*config.*\.json$/,
      /claude.*desktop.*config.*\.json$/,
      /antigravity\.json$/,
      /ibm-bob\.json$/,
      /kiro\.json$/,
      /cursor\.json$/,
      /windsurf\.json$/,
      /zed\.json$/,
      /vscode-continue\.json$/,
    ];

    return mcpConfigPatterns.some(pattern => pattern.test(normalizedPath));
  }

  /**
   * Analyze tool arguments for security risks
   */
  analyzeToolArgs(toolName: string, args: Record<string, any>): GuardrailResult {
    const risks: string[] = [];
    let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let requiresAuth = false;

    // Check for dangerous patterns in arguments
    const dangerousPatterns = [
      { pattern: /rm\s+-rf/i, severity: 'critical' as const, desc: 'Force recursive delete' },
      { pattern: /sudo/i, severity: 'critical' as const, desc: 'Elevated privileges' },
      { pattern: /chmod\s+777/i, severity: 'high' as const, desc: 'Insecure permissions' },
      { pattern: /eval\(/i, severity: 'high' as const, desc: 'Code evaluation' },
      { pattern: /exec\(/i, severity: 'high' as const, desc: 'Command execution' },
      { pattern: /\$\{.*\}/i, severity: 'medium' as const, desc: 'Variable interpolation' },
      { pattern: /`.*`/i, severity: 'medium' as const, desc: 'Command substitution' },
    ];

    // Recursively check all string values in arguments
    const checkValue = (value: any, key: string) => {
      if (typeof value === 'string') {
        for (const { pattern, severity, desc } of dangerousPatterns) {
          if (pattern.test(value)) {
            risks.push(`${desc} detected in ${key}: ${value.substring(0, 50)}...`);
            if (this.compareSeverity(severity, maxSeverity) > 0) {
              maxSeverity = severity;
            }
            if (severity === 'critical' || severity === 'high') {
              requiresAuth = true;
            }
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        for (const [k, v] of Object.entries(value)) {
          checkValue(v, `${key}.${k}`);
        }
      }
    };

    for (const [key, value] of Object.entries(args)) {
      checkValue(value, key);
    }

    if (risks.length > 0) {
      this.logOperation(toolName, JSON.stringify(args), 'blocked', risks.join('; '));
      return {
        allowed: false,
        reason: `Security risks detected:\n${risks.join('\n')}`,
        severity: maxSeverity,
        requiresAuth,
      };
    }

    return { allowed: true };
  }

  /**
   * Compare severity levels
   */
  private compareSeverity(a: string, b: string): number {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[a as keyof typeof levels] - levels[b as keyof typeof levels];
  }

  /**
   * Log operation to audit trail
   */
  private logOperation(
    operation: string,
    target: string,
    result: 'allowed' | 'blocked',
    reason?: string
  ): void {
    const entry = {
      timestamp: new Date(),
      operation,
      target,
      result,
      reason,
    };

    this.auditLog.push(entry);

    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }

    // Log to main logger
    if (result === 'blocked') {
      logger.warn('Operation blocked by guardrails', entry);
    } else {
      logger.debug('Operation allowed by guardrails', entry);
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(limit?: number): typeof this.auditLog {
    if (limit) {
      return this.auditLog.slice(-limit);
    }
    return [...this.auditLog];
  }

  /**
   * Get blocked operations count
   */
  getBlockedCount(since?: Date): number {
    const filtered = since
      ? this.auditLog.filter(entry => entry.timestamp >= since && entry.result === 'blocked')
      : this.auditLog.filter(entry => entry.result === 'blocked');
    
    return filtered.length;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalOperations: number;
    blockedOperations: number;
    allowedOperations: number;
    blockRate: number;
  } {
    const total = this.auditLog.length;
    const blocked = this.auditLog.filter(e => e.result === 'blocked').length;
    const allowed = total - blocked;

    return {
      totalOperations: total,
      blockedOperations: blocked,
      allowedOperations: allowed,
      blockRate: total > 0 ? blocked / total : 0,
    };
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
    logger.info('Audit log cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Security configuration updated', config);
  }

  /**
   * Check if a tool requires special permissions
   */
  requiresSpecialPermissions(toolName: string): boolean {
    const privilegedTools = [
      'execute_command',
      'write_to_file',
      'apply_diff',
      'insert_content',
    ];

    return privilegedTools.some(tool => toolName.toLowerCase().includes(tool.toLowerCase()));
  }

  /**
   * Validate tool execution context
   */
  validateToolExecution(
    toolName: string,
    args: Record<string, any>
  ): GuardrailResult {
    // First check tool arguments for security risks
    const argsResult = this.analyzeToolArgs(toolName, args);
    if (!argsResult.allowed) {
      return argsResult;
    }

    // Check if tool requires special permissions
    if (this.requiresSpecialPermissions(toolName)) {
      logger.info('Tool requires special permissions', { toolName });
    }

    return { allowed: true };
  }
}

// Singleton instance
let guardrailsInstance: SecurityGuardrails | null = null;

export function getSecurityGuardrails(config?: SecurityConfig): SecurityGuardrails {
  if (!guardrailsInstance && config) {
    guardrailsInstance = new SecurityGuardrails(config);
  } else if (!guardrailsInstance) {
    throw new Error('SecurityGuardrails not initialized. Provide config on first call.');
  }
  return guardrailsInstance;
}

// Made with Bob