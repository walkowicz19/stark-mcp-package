#!/usr/bin/env node

/**
 * Sytra Orchestrator MCP Server
 * Main entry point for the orchestrator with intelligent routing and workflow engine
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { tools, toolHandlers } from './tools.js';
import { logger } from './utils/logger.js';
import { ErrorHandler } from './utils/error-handler.js';
import { getSecurityMiddleware } from './security/middleware.js';
import { getAutoRouter } from './routing/auto-router.js';
import { createProactiveMonitor } from './proactive/monitor.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load security configuration
 */
function loadSecurityConfig(): any {
  try {
    const configPath = path.join(process.cwd(), 'security-config.json');
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(configData);
    }
    logger.warn('Security config not found, using defaults');
    return {
      sensitiveFilePatterns: ['.env*', '*.key', '*.pem'],
      dangerousOperations: ['delete', 'rm', 'unlink'],
      systemPaths: [],
      workspaceOnly: true,
      requirePasswordFor: ['out-of-workspace', 'sensitive-files', 'dangerous-operations'],
      autoRouting: { enabled: true, confidenceThreshold: 0.7 },
      rateLimiting: { maxAttempts: 5, windowMs: 900000, blockDurationMs: 3600000 },
    };
  } catch (error) {
    logger.error('Failed to load security config', error as Error);
    throw error;
  }
}

/**
 * Get workspace directory from environment
 */
function getWorkspaceDir(): string {
  // Try to get from environment variable
  const envWorkspace = process.env.WORKSPACE_DIR || process.env.PWD || process.cwd();
  return path.resolve(envWorkspace);
}

/**
 * Create and configure the MCP server
 */
async function main() {
  logger.info('Starting Sytra Orchestrator MCP Server');

  // Load security configuration
  const securityConfig = loadSecurityConfig();
  const workspaceDir = getWorkspaceDir();
  
  logger.info('Workspace directory', { workspaceDir });

  // Initialize security middleware
  const securityMiddleware = getSecurityMiddleware();
  await securityMiddleware.initialize({
    workspaceDir,
    securityConfig,
  });

  // Initialize auto-router
  const autoRouter = getAutoRouter(securityConfig.autoRouting);

  // Initialize proactive monitor
  const proactiveMonitor = createProactiveMonitor();
  logger.info('Proactive monitor initialized', {
    enabled: proactiveMonitor.getConfig().enabled,
    confidenceThreshold: proactiveMonitor.getConfig().confidenceThreshold,
  });

  const server = new Server(
    {
      name: 'sytra-orchestrator',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  /**
   * List available tools
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug('Listing tools');
    
    return {
      tools: tools as Tool[],
    };
  });

  /**
   * Handle tool execution with security checks
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info('Tool execution requested', { tool: name });

    // Analyze message for proactive response (if it's a user message)
    if (args && typeof args === 'object' && 'message' in args && typeof args.message === 'string') {
      const proactiveResponse = await proactiveMonitor.analyzeMessage(args.message as string, 'user');
      
      if (proactiveResponse.triggered && proactiveResponse.message) {
        logger.proactive('Proactive response triggered', {
          patternType: proactiveResponse.patternMatch?.patternType,
          confidence: proactiveResponse.patternMatch?.confidence,
          responseId: proactiveResponse.responseId,
        });

        // Return proactive response as a notification
        // The user can then decide whether to accept the assistance
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                proactiveResponse: true,
                message: proactiveResponse.message,
                responseId: proactiveResponse.responseId,
                patternType: proactiveResponse.patternMatch?.patternType,
                confidence: proactiveResponse.patternMatch?.confidence,
              }, null, 2),
            },
          ],
        };
      }
    }

    try {
      // Security check: Validate tool execution
      const securityCheck = await securityMiddleware.checkToolExecution(name, args || {});
      
      if (!securityCheck.allowed) {
        securityMiddleware.logSecurityEvent({
          type: securityCheck.requiresAuth ? 'auth_required' : 'blocked',
          toolName: name,
          details: { reason: securityCheck.reason, severity: securityCheck.severity },
        });

        const errorMessage = securityCheck.requiresAuth
          ? `${securityCheck.reason}\n\n${securityCheck.authPrompt || 'Admin authentication required.'}\n\nTo configure admin password, set SYTRA_ADMIN_PASSWORD environment variable.`
          : securityCheck.reason;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: 'Security check failed',
                message: errorMessage,
                severity: securityCheck.severity,
                requiresAuth: securityCheck.requiresAuth,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }

      // Get the appropriate handler
      const handler = toolHandlers[name as keyof typeof toolHandlers];

      if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
      }

      // Log allowed operation
      securityMiddleware.logSecurityEvent({
        type: 'allowed',
        toolName: name,
        details: { args },
      });

      // Execute the tool
      const result = await handler(args || {});

      logger.info('Tool execution completed', { tool: name });

      // Track assistant responses in proactive monitor
      if (result && typeof result === 'object') {
        const resultStr = JSON.stringify(result);
        await proactiveMonitor.analyzeMessage(resultStr, 'assistant');
      }

      // Apply credential redaction to the result if needed
      let resultText = JSON.stringify(result, null, 2);
      
      // Check if this is a file read operation or contains file content
      if (name.includes('read') || name.includes('file') || name.includes('config')) {
        // Try to detect file paths in the arguments
        const filePath = (args?.path || args?.filePath || args?.file || '') as string;
        
        if (filePath && typeof filePath === 'string' && securityMiddleware.shouldRedactFile(filePath)) {
          const redactionResult = securityMiddleware.redactFileContent(resultText, filePath);
          resultText = redactionResult.content;
          
          if (redactionResult.redacted) {
            logger.warn('Credentials redacted from tool response', {
              tool: name,
              filePath,
              redactionCount: redactionResult.redactionCount,
              patterns: redactionResult.patterns,
            });
          }
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: resultText,
          },
        ],
      };
    } catch (error) {
      logger.error('Tool execution failed', error as Error, { tool: name });

      const sanitizedError = ErrorHandler.sanitizeError(error as Error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: sanitizedError.message,
              details: sanitizedError,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  /**
   * Start the server
   */
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('Sytra Orchestrator MCP Server started successfully');

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down Sytra Orchestrator MCP Server');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Shutting down Sytra Orchestrator MCP Server');
    await server.close();
    process.exit(0);
  });
}

// Run the server
main().catch((error) => {
  logger.error('Fatal error starting server', error);
  process.exit(1);
});

// Made with Bob
