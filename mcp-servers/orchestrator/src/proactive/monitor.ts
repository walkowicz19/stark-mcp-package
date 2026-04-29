/**
 * Proactive Monitor
 * Monitors conversations and triggers proactive responses when appropriate
 */

import { PatternMatcher, PatternMatch, ProactiveConfig, SpecializedDetectors } from './patterns.js';
import { logger } from '../utils/logger.js';
import * as fs from 'fs';
import * as path from 'path';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ProactiveResponse {
  triggered: boolean;
  patternMatch?: PatternMatch;
  message?: string;
  timestamp: Date;
  responseId: string;
}

export interface MonitorStats {
  totalMessagesAnalyzed: number;
  proactiveResponsesTriggered: number;
  patternMatchesByType: Record<string, number>;
  averageConfidence: number;
  lastProactiveResponse?: Date;
  responsesThisHour: number;
}

/**
 * Proactive Monitor class
 */
export class ProactiveMonitor {
  private config: ProactiveConfig;
  private patternMatcher: PatternMatcher;
  private conversationHistory: ConversationMessage[];
  private lastProactiveResponse: Date | null;
  private proactiveResponseCount: number;
  private stats: MonitorStats;
  private responseHistory: ProactiveResponse[];
  private hourlyResponseCount: number;
  private hourlyResetTime: Date;

  constructor(config: ProactiveConfig) {
    this.config = config;
    this.patternMatcher = new PatternMatcher(config);
    this.conversationHistory = [];
    this.lastProactiveResponse = null;
    this.proactiveResponseCount = 0;
    this.responseHistory = [];
    this.hourlyResponseCount = 0;
    this.hourlyResetTime = new Date(Date.now() + 3600000); // 1 hour from now
    
    this.stats = {
      totalMessagesAnalyzed: 0,
      proactiveResponsesTriggered: 0,
      patternMatchesByType: {},
      averageConfidence: 0,
      responsesThisHour: 0,
    };

    // Load feedback history if exists
    this.loadFeedbackHistory();
  }

  /**
   * Analyze a user message and determine if proactive response is needed
   */
  async analyzeMessage(message: string, role: 'user' | 'assistant' = 'user'): Promise<ProactiveResponse> {
    // Add to conversation history
    this.addToHistory(message, role);

    // Only analyze user messages
    if (role !== 'user') {
      return {
        triggered: false,
        timestamp: new Date(),
        responseId: this.generateResponseId(),
      };
    }

    this.stats.totalMessagesAnalyzed++;

    // Check if proactive responses are enabled
    if (!this.config.enabled) {
      if (this.config.logging.logPatternMatches) {
        logger.debug('Proactive responses disabled');
      }
      return {
        triggered: false,
        timestamp: new Date(),
        responseId: this.generateResponseId(),
      };
    }

    // Check cooldown period
    if (!this.canRespond()) {
      if (this.config.logging.logPatternMatches) {
        logger.debug('Proactive response in cooldown period');
      }
      return {
        triggered: false,
        timestamp: new Date(),
        responseId: this.generateResponseId(),
      };
    }

    // Check hourly rate limit
    if (!this.checkHourlyLimit()) {
      if (this.config.logging.logPatternMatches) {
        logger.debug('Hourly rate limit reached for proactive responses');
      }
      return {
        triggered: false,
        timestamp: new Date(),
        responseId: this.generateResponseId(),
      };
    }

    // Analyze with pattern matcher
    const matches = this.patternMatcher.analyzeMessage(message);

    if (this.config.logging.logPatternMatches && matches.length > 0) {
      logger.debug('Pattern matches found', {
        matchCount: matches.length,
        topMatch: matches[0]?.patternType,
        confidence: matches[0]?.confidence,
      });
    }

    // Check if we have a high-confidence match
    if (matches.length === 0) {
      return {
        triggered: false,
        timestamp: new Date(),
        responseId: this.generateResponseId(),
      };
    }

    const topMatch = matches[0];

    // Use specialized detectors for enhanced analysis
    const enhancedAnalysis = this.enhancedAnalysis(message, topMatch);

    // Create proactive response
    const response: ProactiveResponse = {
      triggered: true,
      patternMatch: topMatch,
      message: this.formatProactiveMessage(topMatch, enhancedAnalysis),
      timestamp: new Date(),
      responseId: this.generateResponseId(),
    };

    // Update tracking
    this.lastProactiveResponse = response.timestamp;
    this.proactiveResponseCount++;
    this.hourlyResponseCount++;
    this.stats.proactiveResponsesTriggered++;
    this.stats.lastProactiveResponse = response.timestamp;
    this.stats.responsesThisHour = this.hourlyResponseCount;

    // Update pattern statistics
    if (!this.stats.patternMatchesByType[topMatch.patternType]) {
      this.stats.patternMatchesByType[topMatch.patternType] = 0;
    }
    this.stats.patternMatchesByType[topMatch.patternType]++;

    // Update average confidence
    const totalConfidence = this.stats.averageConfidence * (this.stats.proactiveResponsesTriggered - 1) + topMatch.confidence;
    this.stats.averageConfidence = totalConfidence / this.stats.proactiveResponsesTriggered;

    // Add to response history
    this.responseHistory.push(response);

    // Log proactive response
    if (this.config.logging.logProactiveResponses) {
      logger.info('Proactive response triggered', {
        patternType: topMatch.patternType,
        confidence: topMatch.confidence,
        responseId: response.responseId,
      });
    }

    return response;
  }

  /**
   * Enhanced analysis using specialized detectors
   */
  private enhancedAnalysis(message: string, match: PatternMatch): any {
    const analysis: any = {};

    // Check for errors
    const errorDetection = SpecializedDetectors.detectError(message);
    if (errorDetection.isError) {
      analysis.error = errorDetection;
    }

    // Check for security concerns
    const securityDetection = SpecializedDetectors.detectSecurityConcern(message);
    if (securityDetection.isSecurity) {
      analysis.security = securityDetection;
    }

    // Check for performance issues
    const performanceDetection = SpecializedDetectors.detectPerformanceIssue(message);
    if (performanceDetection.isPerformance) {
      analysis.performance = performanceDetection;
    }

    return analysis;
  }

  /**
   * Format the proactive message
   */
  private formatProactiveMessage(match: PatternMatch, enhancedAnalysis: any): string {
    let message = `🤖 **SYTRA Proactive Assistant**\n\n`;
    message += `${match.response}\n\n`;

    // Add specific insights based on enhanced analysis
    if (enhancedAnalysis.error) {
      message += `📋 **Error Analysis:**\n`;
      message += `- Type: ${enhancedAnalysis.error.errorType}\n`;
      message += `- Severity: ${enhancedAnalysis.error.severity}\n\n`;
    }

    if (enhancedAnalysis.security) {
      message += `🔒 **Security Concern:**\n`;
      message += `- Type: ${enhancedAnalysis.security.concernType}\n`;
      message += `- This requires immediate attention\n\n`;
    }

    if (enhancedAnalysis.performance) {
      message += `⚡ **Performance Issue:**\n`;
      message += `- Type: ${enhancedAnalysis.performance.issueType}\n\n`;
    }

    message += `**Matched Keywords:** ${match.matchedKeywords.join(', ')}\n`;
    message += `**Confidence:** ${(match.confidence * 100).toFixed(1)}%\n\n`;
    message += `*Reply with "yes" or "proceed" to accept my assistance, or continue with your task.*`;

    return message;
  }

  /**
   * Check if we can respond (cooldown period)
   */
  private canRespond(): boolean {
    if (!this.lastProactiveResponse) {
      return true;
    }

    const timeSinceLastResponse = Date.now() - this.lastProactiveResponse.getTime();
    return timeSinceLastResponse >= this.config.cooldownPeriodMs;
  }

  /**
   * Check hourly rate limit
   */
  private checkHourlyLimit(): boolean {
    // Reset hourly counter if needed
    if (Date.now() >= this.hourlyResetTime.getTime()) {
      this.hourlyResponseCount = 0;
      this.hourlyResetTime = new Date(Date.now() + 3600000);
    }

    return this.hourlyResponseCount < this.config.maxProactiveResponsesPerHour;
  }

  /**
   * Add message to conversation history
   */
  private addToHistory(content: string, role: 'user' | 'assistant'): void {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date(),
    });

    // Trim history to max messages
    const maxMessages = this.config.contextWindow.maxMessages;
    if (this.conversationHistory.length > maxMessages) {
      this.conversationHistory = this.conversationHistory.slice(-maxMessages);
    }
  }

  /**
   * Generate unique response ID
   */
  private generateResponseId(): string {
    return `proactive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Record user feedback for a proactive response
   */
  recordFeedback(responseId: string, accepted: boolean): void {
    const response = this.responseHistory.find(r => r.responseId === responseId);
    if (!response || !response.patternMatch) {
      logger.warn('Response not found for feedback', { responseId });
      return;
    }

    this.patternMatcher.recordFeedback(response.patternMatch.patternType, accepted);

    if (this.config.logging.logProactiveResponses) {
      logger.info('Feedback recorded', {
        responseId,
        patternType: response.patternMatch.patternType,
        accepted,
      });
    }

    // Save feedback history
    this.saveFeedbackHistory();
  }

  /**
   * Get monitor statistics
   */
  getStats(): MonitorStats {
    return { ...this.stats };
  }

  /**
   * Get recent proactive responses
   */
  getRecentResponses(limit: number = 10): ProactiveResponse[] {
    return this.responseHistory.slice(-limit);
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
    logger.info('Conversation history cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(config: ProactiveConfig): void {
    this.config = config;
    this.patternMatcher.updateConfig(config);
    logger.info('Proactive monitor configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): ProactiveConfig {
    return this.config;
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalMessagesAnalyzed: 0,
      proactiveResponsesTriggered: 0,
      patternMatchesByType: {},
      averageConfidence: 0,
      responsesThisHour: 0,
    };
    logger.info('Monitor statistics reset');
  }

  /**
   * Save feedback history to disk
   */
  private saveFeedbackHistory(): void {
    try {
      const feedbackData = this.patternMatcher.exportFeedback();
      const feedbackPath = path.join(process.cwd(), 'proactive-feedback.json');
      fs.writeFileSync(feedbackPath, JSON.stringify(feedbackData, null, 2));
    } catch (error) {
      logger.error('Failed to save feedback history', error as Error);
    }
  }

  /**
   * Load feedback history from disk
   */
  private loadFeedbackHistory(): void {
    try {
      const feedbackPath = path.join(process.cwd(), 'proactive-feedback.json');
      if (fs.existsSync(feedbackPath)) {
        const feedbackData = JSON.parse(fs.readFileSync(feedbackPath, 'utf-8'));
        this.patternMatcher.importFeedback(feedbackData);
        logger.info('Feedback history loaded');
      }
    } catch (error) {
      logger.warn('Failed to load feedback history', { error: (error as Error).message });
    }
  }

  /**
   * Export monitor state for persistence
   */
  exportState(): any {
    return {
      stats: this.stats,
      lastProactiveResponse: this.lastProactiveResponse,
      proactiveResponseCount: this.proactiveResponseCount,
      hourlyResponseCount: this.hourlyResponseCount,
      hourlyResetTime: this.hourlyResetTime,
      feedback: this.patternMatcher.exportFeedback(),
    };
  }

  /**
   * Import monitor state from persistence
   */
  importState(state: any): void {
    if (state.stats) this.stats = state.stats;
    if (state.lastProactiveResponse) this.lastProactiveResponse = new Date(state.lastProactiveResponse);
    if (state.proactiveResponseCount) this.proactiveResponseCount = state.proactiveResponseCount;
    if (state.hourlyResponseCount) this.hourlyResponseCount = state.hourlyResponseCount;
    if (state.hourlyResetTime) this.hourlyResetTime = new Date(state.hourlyResetTime);
    if (state.feedback) this.patternMatcher.importFeedback(state.feedback);
    
    logger.info('Monitor state imported');
  }
}

/**
 * Factory function to create a proactive monitor
 */
export function createProactiveMonitor(configPath?: string): ProactiveMonitor {
  const defaultConfigPath = path.join(process.cwd(), 'proactive-config.json');
  const actualConfigPath = configPath || defaultConfigPath;

  let config: ProactiveConfig;

  try {
    if (fs.existsSync(actualConfigPath)) {
      const configData = fs.readFileSync(actualConfigPath, 'utf-8');
      config = JSON.parse(configData);
      logger.info('Proactive config loaded', { path: actualConfigPath });
    } else {
      throw new Error('Config file not found');
    }
  } catch (error) {
    logger.warn('Failed to load proactive config, using defaults', { error: (error as Error).message });
    
    // Default configuration
    config = {
      enabled: false,
      confidenceThreshold: 0.75,
      cooldownPeriodMs: 300000,
      maxProactiveResponsesPerHour: 10,
      patterns: {},
      contextWindow: {
        maxMessages: 5,
        maxTokensPerMessage: 1000,
      },
      logging: {
        logProactiveResponses: true,
        logPatternMatches: true,
        logConfidenceScores: true,
      },
      userFeedback: {
        enabled: true,
        trackAcceptance: true,
        adjustConfidenceBasedOnFeedback: true,
      },
    };
  }

  return new ProactiveMonitor(config);
}

// Made with Bob