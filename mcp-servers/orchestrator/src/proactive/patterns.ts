/**
 * Pattern Definitions for Proactive Response System
 * Defines patterns and matching logic for detecting when SYTRA should proactively respond
 */

export interface PatternConfig {
  enabled: boolean;
  confidence: number;
  keywords: string[];
  response: string;
}

export interface PatternMatch {
  patternType: string;
  confidence: number;
  matchedKeywords: string[];
  response: string;
}

export interface ProactiveConfig {
  enabled: boolean;
  confidenceThreshold: number;
  cooldownPeriodMs: number;
  maxProactiveResponsesPerHour: number;
  patterns: Record<string, PatternConfig>;
  contextWindow: {
    maxMessages: number;
    maxTokensPerMessage: number;
  };
  logging: {
    logProactiveResponses: boolean;
    logPatternMatches: boolean;
    logConfidenceScores: boolean;
  };
  userFeedback: {
    enabled: boolean;
    trackAcceptance: boolean;
    adjustConfidenceBasedOnFeedback: boolean;
  };
}

/**
 * Pattern Matcher class for detecting relevant patterns in user messages
 */
export class PatternMatcher {
  private config: ProactiveConfig;
  private feedbackHistory: Map<string, { accepted: number; rejected: number }>;

  constructor(config: ProactiveConfig) {
    this.config = config;
    this.feedbackHistory = new Map();
  }

  /**
   * Analyze a message and return matching patterns
   */
  analyzeMessage(message: string): PatternMatch[] {
    if (!this.config.enabled) {
      return [];
    }

    const normalizedMessage = message.toLowerCase();
    const matches: PatternMatch[] = [];

    for (const [patternType, patternConfig] of Object.entries(this.config.patterns)) {
      if (!patternConfig.enabled) {
        continue;
      }

      const match = this.matchPattern(normalizedMessage, patternType, patternConfig);
      if (match && match.confidence >= this.config.confidenceThreshold) {
        matches.push(match);
      }
    }

    // Sort by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);

    return matches;
  }

  /**
   * Match a specific pattern against a message
   */
  private matchPattern(
    message: string,
    patternType: string,
    config: PatternConfig
  ): PatternMatch | null {
    const matchedKeywords: string[] = [];
    let totalMatches = 0;

    // Check for keyword matches
    for (const keyword of config.keywords) {
      const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'gi');
      const matches = message.match(regex);
      if (matches) {
        matchedKeywords.push(keyword);
        totalMatches += matches.length;
      }
    }

    if (matchedKeywords.length === 0) {
      return null;
    }

    // Calculate confidence score
    let confidence = this.calculateConfidence(
      matchedKeywords.length,
      config.keywords.length,
      totalMatches,
      message.length
    );

    // Apply base confidence from config
    confidence = Math.min(confidence * config.confidence, 1.0);

    // Adjust based on user feedback if enabled
    if (this.config.userFeedback.adjustConfidenceBasedOnFeedback) {
      confidence = this.adjustConfidenceByFeedback(patternType, confidence);
    }

    return {
      patternType,
      confidence,
      matchedKeywords,
      response: config.response,
    };
  }

  /**
   * Calculate confidence score based on matches
   */
  private calculateConfidence(
    matchedCount: number,
    totalKeywords: number,
    totalMatches: number,
    messageLength: number
  ): number {
    // Base confidence from keyword coverage
    const keywordCoverage = matchedCount / totalKeywords;
    
    // Bonus for multiple matches of same keyword
    const matchDensity = Math.min(totalMatches / 10, 0.3);
    
    // Penalty for very long messages (less focused)
    const lengthPenalty = messageLength > 500 ? 0.1 : 0;
    
    return Math.min(keywordCoverage + matchDensity - lengthPenalty, 1.0);
  }

  /**
   * Adjust confidence based on historical user feedback
   */
  private adjustConfidenceByFeedback(patternType: string, baseConfidence: number): number {
    const feedback = this.feedbackHistory.get(patternType);
    if (!feedback || (feedback.accepted + feedback.rejected) < 5) {
      return baseConfidence;
    }

    const acceptanceRate = feedback.accepted / (feedback.accepted + feedback.rejected);
    
    // Adjust confidence by ±20% based on acceptance rate
    const adjustment = (acceptanceRate - 0.5) * 0.4;
    
    return Math.max(0.1, Math.min(baseConfidence + adjustment, 1.0));
  }

  /**
   * Record user feedback for a pattern
   */
  recordFeedback(patternType: string, accepted: boolean): void {
    if (!this.config.userFeedback.enabled || !this.config.userFeedback.trackAcceptance) {
      return;
    }

    const feedback = this.feedbackHistory.get(patternType) || { accepted: 0, rejected: 0 };
    
    if (accepted) {
      feedback.accepted++;
    } else {
      feedback.rejected++;
    }
    
    this.feedbackHistory.set(patternType, feedback);
  }

  /**
   * Get feedback statistics for a pattern
   */
  getFeedbackStats(patternType: string): { accepted: number; rejected: number; rate: number } | null {
    const feedback = this.feedbackHistory.get(patternType);
    if (!feedback) {
      return null;
    }

    const total = feedback.accepted + feedback.rejected;
    const rate = total > 0 ? feedback.accepted / total : 0;

    return {
      accepted: feedback.accepted,
      rejected: feedback.rejected,
      rate,
    };
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Update configuration
   */
  updateConfig(config: ProactiveConfig): void {
    this.config = config;
  }

  /**
   * Get current configuration
   */
  getConfig(): ProactiveConfig {
    return this.config;
  }

  /**
   * Reset feedback history
   */
  resetFeedback(): void {
    this.feedbackHistory.clear();
  }

  /**
   * Export feedback history for persistence
   */
  exportFeedback(): Record<string, { accepted: number; rejected: number }> {
    const exported: Record<string, { accepted: number; rejected: number }> = {};
    for (const [key, value] of this.feedbackHistory.entries()) {
      exported[key] = { ...value };
    }
    return exported;
  }

  /**
   * Import feedback history from persistence
   */
  importFeedback(data: Record<string, { accepted: number; rejected: number }>): void {
    this.feedbackHistory.clear();
    for (const [key, value] of Object.entries(data)) {
      this.feedbackHistory.set(key, { ...value });
    }
  }
}

/**
 * Specialized pattern detectors for complex scenarios
 */
export class SpecializedDetectors {
  /**
   * Detect error patterns with stack trace analysis
   */
  static detectError(message: string): { isError: boolean; errorType?: string; severity?: string } {
    const errorPatterns = [
      { pattern: /error:/i, type: 'generic', severity: 'medium' },
      { pattern: /exception:/i, type: 'exception', severity: 'high' },
      { pattern: /fatal/i, type: 'fatal', severity: 'critical' },
      { pattern: /warning:/i, type: 'warning', severity: 'low' },
      { pattern: /stack trace|traceback/i, type: 'stack_trace', severity: 'high' },
      { pattern: /undefined is not|cannot read property/i, type: 'runtime', severity: 'high' },
      { pattern: /syntax error/i, type: 'syntax', severity: 'medium' },
    ];

    for (const { pattern, type, severity } of errorPatterns) {
      if (pattern.test(message)) {
        return { isError: true, errorType: type, severity };
      }
    }

    return { isError: false };
  }

  /**
   * Detect security-related concerns
   */
  static detectSecurityConcern(message: string): { isSecurity: boolean; concernType?: string } {
    const securityPatterns = [
      { pattern: /sql injection|sqli/i, type: 'sql_injection' },
      { pattern: /xss|cross-site scripting/i, type: 'xss' },
      { pattern: /csrf|cross-site request forgery/i, type: 'csrf' },
      { pattern: /password.*plain|plaintext.*password/i, type: 'password_storage' },
      { pattern: /api.*key.*exposed|leaked.*credential/i, type: 'credential_leak' },
      { pattern: /authentication.*bypass|auth.*vulnerability/i, type: 'auth_bypass' },
    ];

    for (const { pattern, type } of securityPatterns) {
      if (pattern.test(message)) {
        return { isSecurity: true, concernType: type };
      }
    }

    return { isSecurity: false };
  }

  /**
   * Detect performance issues
   */
  static detectPerformanceIssue(message: string): { isPerformance: boolean; issueType?: string } {
    const performancePatterns = [
      { pattern: /memory leak/i, type: 'memory_leak' },
      { pattern: /slow query|query.*slow/i, type: 'slow_query' },
      { pattern: /high cpu|cpu.*spike/i, type: 'cpu_usage' },
      { pattern: /timeout|timed out/i, type: 'timeout' },
      { pattern: /bottleneck/i, type: 'bottleneck' },
      { pattern: /n\+1.*query|n\+1.*problem/i, type: 'n_plus_one' },
    ];

    for (const { pattern, type } of performancePatterns) {
      if (pattern.test(message)) {
        return { isPerformance: true, issueType: type };
      }
    }

    return { isPerformance: false };
  }
}

// Made with Bob