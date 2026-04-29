/**
 * Security Middleware
 * Integrates all security components into a unified layer
 */

import { getSecurityGuardrails, GuardrailResult } from './guardrails.js';
import { getWorkspaceValidator, ValidationResult } from './workspace-validator.js';
import { getAdminAuth } from './auth.js';
import { getCredentialRedactor, RedactionResult } from './credential-redactor.js';
import { logger } from '../utils/logger.js';

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  requiresAuth?: boolean;
  authPrompt?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  redacted?: boolean;
  redactionInfo?: RedactionResult;
}

export class SecurityMiddleware {
  private initialized: boolean = false;

  /**
   * Initialize security middleware with configuration
   */
  async initialize(config: {
    workspaceDir: string;
    securityConfig: any;
  }): Promise<void> {
    try {
      logger.info('Initializing security middleware');

      // Initialize workspace validator
      getWorkspaceValidator(config.workspaceDir, config.securityConfig.systemPaths);

      // Initialize security guardrails
      getSecurityGuardrails({
        sensitiveFilePatterns: config.securityConfig.sensitiveFilePatterns,
        dangerousOperations: config.securityConfig.dangerousOperations,
        systemPaths: config.securityConfig.systemPaths,
        workspaceOnly: config.securityConfig.workspaceOnly,
        requirePasswordFor: config.securityConfig.requirePasswordFor,
      });

      // Initialize credential redactor
      if (config.securityConfig.credentialRedaction) {
        getCredentialRedactor({
          enabled: config.securityConfig.credentialRedaction.enabled,
          patterns: config.securityConfig.credentialRedaction.patterns,
          filePatterns: config.securityConfig.credentialRedaction.filePatterns,
        });
        logger.info('Credential redaction initialized');
      }

      // Initialize admin auth
      const auth = getAdminAuth(config.securityConfig.rateLimiting);
      await auth.initialize();

      this.initialized = true;
      logger.info('Security middleware initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize security middleware', error as Error);
      throw error;
    }
  }

  /**
   * Check if middleware is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Perform comprehensive security check on tool execution
   */
  async checkToolExecution(
    toolName: string,
    args: Record<string, any>
  ): Promise<SecurityCheckResult> {
    if (!this.initialized) {
      logger.warn('Security middleware not initialized, allowing operation');
      return { allowed: true };
    }

    try {
      const guardrails = getSecurityGuardrails();
      const validator = getWorkspaceValidator();

      // Step 1: Validate tool arguments for security risks
      const guardrailResult = guardrails.validateToolExecution(toolName, args);
      if (!guardrailResult.allowed) {
        return {
          allowed: false,
          reason: guardrailResult.reason,
          requiresAuth: guardrailResult.requiresAuth,
          severity: guardrailResult.severity,
          authPrompt: guardrailResult.requiresAuth
            ? 'This operation requires admin authentication due to security concerns.'
            : undefined,
        };
      }

      // Step 2: Validate workspace boundaries
      const pathValidation = validator.validateToolArgs(toolName, args);
      if (!pathValidation.valid) {
        return {
          allowed: false,
          reason: pathValidation.reason,
          requiresAuth: pathValidation.requiresAuth,
          severity: 'high',
          authPrompt: pathValidation.requiresAuth
            ? 'This operation requires admin authentication because it accesses paths outside the workspace.'
            : undefined,
        };
      }

      // Step 3: Check for specific dangerous operations
      const operationCheck = this.checkDangerousOperation(toolName, args);
      if (!operationCheck.allowed) {
        return operationCheck;
      }

      // All checks passed
      logger.debug('Security checks passed', { toolName });
      return { allowed: true };
    } catch (error) {
      logger.error('Security check failed', error as Error, { toolName });
      return {
        allowed: false,
        reason: `Security check error: ${(error as Error).message}`,
        severity: 'high',
      };
    }
  }

  /**
   * Check for dangerous operations that require special handling
   */
  private checkDangerousOperation(
    toolName: string,
    args: Record<string, any>
  ): SecurityCheckResult {
    const guardrails = getSecurityGuardrails();

    // Check if this is a file operation
    const fileOperationTools = [
      'write_to_file',
      'apply_diff',
      'insert_content',
      'execute_command',
    ];

    if (!fileOperationTools.some(tool => toolName.toLowerCase().includes(tool.toLowerCase()))) {
      return { allowed: true };
    }

    // Extract operation type and target
    let operation = toolName;
    let target = '';

    if (args.path) target = args.path;
    if (args.filePath) target = args.filePath;
    if (args.command) {
      operation = 'execute_command';
      target = args.command;
    }

    // Check with guardrails
    const result = guardrails.checkOperation(operation, target, toolName);
    
    return {
      allowed: result.allowed,
      reason: result.reason,
      requiresAuth: result.requiresAuth,
      severity: result.severity,
      authPrompt: result.requiresAuth
        ? `This operation (${operation}) requires admin authentication.`
        : undefined,
    };
  }

  /**
   * Validate admin password
   */
  async validateAdminPassword(password: string, context: string = 'tool-execution'): Promise<boolean> {
    try {
      const auth = getAdminAuth();
      return await auth.validatePassword(password, context);
    } catch (error) {
      logger.error('Admin password validation failed', error as Error);
      throw error;
    }
  }

  /**
   * Check if admin password is configured
   */
  isAdminPasswordConfigured(): boolean {
    try {
      const auth = getAdminAuth();
      return auth.isConfigured();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    guardrails: any;
    workspace: string;
    authConfigured: boolean;
  } {
    try {
      const guardrails = getSecurityGuardrails();
      const validator = getWorkspaceValidator();
      const auth = getAdminAuth();

      return {
        guardrails: guardrails.getStatistics(),
        workspace: validator.getWorkspaceDir(),
        authConfigured: auth.isConfigured(),
      };
    } catch (error) {
      logger.error('Failed to get security stats', error as Error);
      return {
        guardrails: {},
        workspace: 'unknown',
        authConfigured: false,
      };
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(limit?: number): any[] {
    try {
      const guardrails = getSecurityGuardrails();
      return guardrails.getAuditLog(limit);
    } catch (error) {
      logger.error('Failed to get audit log', error as Error);
      return [];
    }
  }

  /**
   * Log security event
   */
  logSecurityEvent(event: {
    type: 'allowed' | 'blocked' | 'auth_required' | 'auth_success' | 'auth_failed';
    toolName: string;
    details?: any;
  }): void {
    logger.info('Security event', event);
  }

  /**
   * Redact credentials from file content
   */
  redactFileContent(content: string, filePath: string): RedactionResult {
    try {
      const redactor = getCredentialRedactor();
      return redactor.redactContent(content, filePath);
    } catch (error) {
      logger.error('Failed to redact file content', error as Error, { filePath });
      // Return original content if redaction fails
      return {
        content,
        redacted: false,
        redactionCount: 0,
        patterns: [],
      };
    }
  }

  /**
   * Check if a file should be redacted
   */
  shouldRedactFile(filePath: string): boolean {
    try {
      const redactor = getCredentialRedactor();
      return redactor.shouldRedactFile(filePath);
    } catch (error) {
      logger.error('Failed to check if file should be redacted', error as Error, { filePath });
      return false;
    }
  }

  /**
   * Get redaction statistics
   */
  getRedactionStats(): any {
    try {
      const redactor = getCredentialRedactor();
      return redactor.getStatistics();
    } catch (error) {
      logger.error('Failed to get redaction stats', error as Error);
      return {
        totalRedactions: 0,
        filesRedacted: 0,
        mostCommonPatterns: [],
      };
    }
  }

  /**
   * Get redaction log
   */
  getRedactionLog(limit?: number): any[] {
    try {
      const redactor = getCredentialRedactor();
      return redactor.getRedactionLog(limit);
    } catch (error) {
      logger.error('Failed to get redaction log', error as Error);
      return [];
    }
  }
}

// Singleton instance
let middlewareInstance: SecurityMiddleware | null = null;

export function getSecurityMiddleware(): SecurityMiddleware {
  if (!middlewareInstance) {
    middlewareInstance = new SecurityMiddleware();
  }
  return middlewareInstance;
}

// Made with Bob