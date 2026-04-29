/**
 * Credential Redactor
 * Detects and redacts sensitive credentials in file content
 */

import { logger } from '../utils/logger.js';

export interface RedactionResult {
  content: string;
  redacted: boolean;
  redactionCount: number;
  patterns: string[];
}

export interface RedactionConfig {
  enabled: boolean;
  patterns: string[];
  filePatterns: string[];
}

export class CredentialRedactor {
  private config: RedactionConfig;
  private redactionLog: Array<{
    timestamp: Date;
    filePath: string;
    redactionCount: number;
    patterns: string[];
  }> = [];

  constructor(config: RedactionConfig) {
    this.config = config;
    logger.info('CredentialRedactor initialized', {
      enabled: config.enabled,
      patterns: config.patterns.length,
      filePatterns: config.filePatterns.length,
    });
  }

  /**
   * Redact credentials from file content
   */
  redactContent(content: string, filePath: string): RedactionResult {
    if (!this.config.enabled) {
      return {
        content,
        redacted: false,
        redactionCount: 0,
        patterns: [],
      };
    }

    let redactedContent = content;
    let redactionCount = 0;
    const matchedPatterns: string[] = [];

    // Define redaction patterns with their regex
    const redactionPatterns = [
      // JSON credential patterns
      {
        name: 'password',
        regex: /("password"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      {
        name: 'SYTRA_ADMIN_PASSWORD',
        regex: /("SYTRA_ADMIN_PASSWORD"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      {
        name: 'token',
        regex: /("token"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      {
        name: 'api_key',
        regex: /("api_key"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      {
        name: 'apiKey',
        regex: /("apiKey"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      {
        name: 'secret',
        regex: /("secret"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      {
        name: 'SECRET',
        regex: /("SECRET"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      {
        name: 'PASSWORD',
        regex: /("PASSWORD"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      {
        name: 'TOKEN',
        regex: /("TOKEN"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      {
        name: 'privateKey',
        regex: /("privateKey"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      {
        name: 'private_key',
        regex: /("private_key"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      // AWS credentials
      {
        name: 'AWS_SECRET_ACCESS_KEY',
        regex: /("AWS_SECRET_ACCESS_KEY"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      {
        name: 'AWS_ACCESS_KEY_ID',
        regex: /("AWS_ACCESS_KEY_ID"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      {
        name: 'AWS_SESSION_TOKEN',
        regex: /("AWS_SESSION_TOKEN"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      // Database connection strings
      {
        name: 'database_url',
        regex: /((?:postgres|mysql|mongodb|redis):\/\/[^:]+:)[^@]+(@)/gi,
        replacement: '$1[REDACTED]$2',
      },
      {
        name: 'connection_string',
        regex: /("(?:connection_string|connectionString|DATABASE_URL)"\s*:\s*"[^:]+:\/\/[^:]+:)[^@"]+(@[^"]+)/gi,
        replacement: '$1[REDACTED]$2',
      },
      // Environment variable patterns
      {
        name: 'env_password',
        regex: /((?:PASSWORD|SECRET|TOKEN|KEY)=)[^\s\n;]*/gi,
        replacement: '$1[REDACTED]',
      },
      // Bearer tokens
      {
        name: 'bearer_token',
        regex: /(Bearer\s+)[A-Za-z0-9\-._~+/]+=*/gi,
        replacement: '$1[REDACTED]',
      },
      // JWT tokens
      {
        name: 'jwt_token',
        regex: /(eyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_.+/=]*)/gi,
        replacement: '[REDACTED_JWT]',
      },
      // SSH private keys
      {
        name: 'ssh_private_key',
        regex: /(-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----)([\s\S]*?)(-----END (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----)/gi,
        replacement: '$1\n[REDACTED]\n$3',
      },
      // Generic secret patterns in JSON
      {
        name: 'generic_secret',
        regex: /("(?:[a-zA-Z_]*[sS]ecret[a-zA-Z_]*)"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      {
        name: 'generic_key',
        regex: /("(?:[a-zA-Z_]*[kK]ey[a-zA-Z_]*)"\s*:\s*)"[^"]*"/gi,
        replacement: '$1"[REDACTED]"',
      },
      // API keys in various formats
      {
        name: 'api_key_value',
        regex: /(api[_-]?key\s*[:=]\s*)['"]?[A-Za-z0-9\-_]{20,}['"]?/gi,
        replacement: '$1"[REDACTED]"',
      },
    ];

    // Apply each redaction pattern
    for (const pattern of redactionPatterns) {
      const matches = redactedContent.match(pattern.regex);
      if (matches && matches.length > 0) {
        redactedContent = redactedContent.replace(pattern.regex, pattern.replacement);
        redactionCount += matches.length;
        matchedPatterns.push(pattern.name);
      }
    }

    // Log redaction event if any credentials were redacted
    if (redactionCount > 0) {
      this.logRedaction(filePath, redactionCount, matchedPatterns);
      logger.warn('Credentials redacted from file', {
        filePath,
        redactionCount,
        patterns: matchedPatterns,
      });
    }

    return {
      content: redactedContent,
      redacted: redactionCount > 0,
      redactionCount,
      patterns: matchedPatterns,
    };
  }

  /**
   * Check if a file should be redacted based on file patterns
   */
  shouldRedactFile(filePath: string): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();

    return this.config.filePatterns.some(pattern => {
      // Convert glob pattern to regex
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '.');

      const regex = new RegExp(regexPattern, 'i');
      return regex.test(normalizedPath);
    });
  }

  /**
   * Log redaction event
   */
  private logRedaction(filePath: string, redactionCount: number, patterns: string[]): void {
    const entry = {
      timestamp: new Date(),
      filePath,
      redactionCount,
      patterns,
    };

    this.redactionLog.push(entry);

    // Keep only last 500 entries
    if (this.redactionLog.length > 500) {
      this.redactionLog.shift();
    }
  }

  /**
   * Get redaction log
   */
  getRedactionLog(limit?: number): typeof this.redactionLog {
    if (limit) {
      return this.redactionLog.slice(-limit);
    }
    return [...this.redactionLog];
  }

  /**
   * Get redaction statistics
   */
  getStatistics(): {
    totalRedactions: number;
    filesRedacted: number;
    mostCommonPatterns: Array<{ pattern: string; count: number }>;
  } {
    const totalRedactions = this.redactionLog.reduce(
      (sum, entry) => sum + entry.redactionCount,
      0
    );
    const filesRedacted = new Set(this.redactionLog.map(e => e.filePath)).size;

    // Count pattern occurrences
    const patternCounts = new Map<string, number>();
    for (const entry of this.redactionLog) {
      for (const pattern of entry.patterns) {
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
      }
    }

    const mostCommonPatterns = Array.from(patternCounts.entries())
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRedactions,
      filesRedacted,
      mostCommonPatterns,
    };
  }

  /**
   * Clear redaction log
   */
  clearRedactionLog(): void {
    this.redactionLog = [];
    logger.info('Redaction log cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RedactionConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Credential redaction configuration updated', config);
  }

  /**
   * Check if redaction is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Singleton instance
let redactorInstance: CredentialRedactor | null = null;

export function getCredentialRedactor(config?: RedactionConfig): CredentialRedactor {
  if (!redactorInstance && config) {
    redactorInstance = new CredentialRedactor(config);
  } else if (!redactorInstance) {
    throw new Error('CredentialRedactor not initialized. Provide config on first call.');
  }
  return redactorInstance;
}

// Made with Bob