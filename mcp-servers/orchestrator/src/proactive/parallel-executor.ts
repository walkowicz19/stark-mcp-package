/**
 * Parallel Execution Manager
 * Manages parallel execution of simple/medium tasks while running complex tasks individually
 */

import { TaskClassifier, Task, TaskClassification, TaskComplexity } from './task-classifier.js';
import { logger } from '../utils/logger.js';

export interface ExecutionResult {
  taskId: string;
  success: boolean;
  result?: any;
  error?: Error;
  duration: number;
  startTime: Date;
  endTime: Date;
}

export interface ExecutionBatch {
  batchId: string;
  tasks: Task[];
  parallel: boolean;
  startTime: Date;
  endTime?: Date;
  results: ExecutionResult[];
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface ParallelExecutionConfig {
  enabled: boolean;
  maxParallelTasks: number;
  maxConcurrentBatches: number;
  timeoutMs: number;
  retryFailedTasks: boolean;
  maxRetries: number;
}

/**
 * Parallel Execution Manager
 */
export class ParallelExecutor {
  private config: ParallelExecutionConfig;
  private activeBatches: Map<string, ExecutionBatch>;
  private taskQueue: Task[];
  private executionHistory: ExecutionBatch[];

  constructor(config: ParallelExecutionConfig) {
    this.config = config;
    this.activeBatches = new Map();
    this.taskQueue = [];
    this.executionHistory = [];
  }

  /**
   * Execute multiple tasks with intelligent parallelization
   */
  async executeTasks(
    tasks: Task[],
    executor: (task: Task) => Promise<any>
  ): Promise<ExecutionResult[]> {
    if (!this.config.enabled) {
      logger.info('Parallel execution disabled, running tasks sequentially');
      return this.executeSequentially(tasks, executor);
    }

    logger.info('Analyzing tasks for parallel execution', { taskCount: tasks.length });

    // Classify and group tasks
    const { parallel, sequential, classifications } = TaskClassifier.groupTasksForExecution(tasks);

    logger.info('Task classification complete', {
      parallelTasks: parallel.length,
      sequentialTasks: sequential.length,
    });

    const results: ExecutionResult[] = [];

    // Execute complex tasks sequentially first
    if (sequential.length > 0) {
      logger.info('Executing complex tasks sequentially', { count: sequential.length });
      for (const task of sequential) {
        const classification = classifications.get(task.id);
        logger.info('Executing complex task', {
          taskId: task.id,
          complexity: classification?.complexity,
          reasoning: classification?.reasoning,
        });
        
        const result = await this.executeTask(task, executor, classification);
        results.push(result);
      }
    }

    // Execute simple/medium tasks in parallel
    if (parallel.length > 0) {
      logger.info('Executing simple/medium tasks in parallel', { count: parallel.length });
      const parallelResults = await this.executeInParallel(parallel, executor, classifications);
      results.push(...parallelResults);
    }

    return results;
  }

  /**
   * Execute tasks in parallel with batching
   */
  private async executeInParallel(
    tasks: Task[],
    executor: (task: Task) => Promise<any>,
    classifications: Map<string, TaskClassification>
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    const batches = this.createBatches(tasks);

    for (const batch of batches) {
      const batchId = this.generateBatchId();
      const executionBatch: ExecutionBatch = {
        batchId,
        tasks: batch,
        parallel: true,
        startTime: new Date(),
        results: [],
        status: 'running',
      };

      this.activeBatches.set(batchId, executionBatch);

      logger.info('Executing parallel batch', {
        batchId,
        taskCount: batch.length,
      });

      // Execute all tasks in batch concurrently
      const batchPromises = batch.map(task => 
        this.executeTask(task, executor, classifications.get(task.id))
      );

      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        for (let i = 0; i < batchResults.length; i++) {
          const promiseResult = batchResults[i];
          const task = batch[i];
          
          if (promiseResult.status === 'fulfilled') {
            results.push(promiseResult.value);
          } else {
            // Handle rejected promise
            const errorResult: ExecutionResult = {
              taskId: task.id,
              success: false,
              error: promiseResult.reason,
              duration: 0,
              startTime: new Date(),
              endTime: new Date(),
            };
            results.push(errorResult);
          }
        }

        executionBatch.results = results;
        executionBatch.status = 'completed';
        executionBatch.endTime = new Date();

        logger.info('Parallel batch completed', {
          batchId,
          successCount: results.filter(r => r.success).length,
          failureCount: results.filter(r => !r.success).length,
        });
      } catch (error) {
        executionBatch.status = 'failed';
        executionBatch.endTime = new Date();
        logger.error('Parallel batch failed', error as Error, { batchId });
      } finally {
        this.activeBatches.delete(batchId);
        this.executionHistory.push(executionBatch);
      }
    }

    return results;
  }

  /**
   * Execute a single task
   */
  private async executeTask(
    task: Task,
    executor: (task: Task) => Promise<any>,
    classification?: TaskClassification
  ): Promise<ExecutionResult> {
    const startTime = new Date();
    
    try {
      logger.debug('Executing task', {
        taskId: task.id,
        type: task.type,
        complexity: classification?.complexity,
      });

      const result = await this.executeWithTimeout(
        executor(task),
        classification?.estimatedDuration || this.config.timeoutMs
      );

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      logger.debug('Task completed successfully', {
        taskId: task.id,
        duration,
      });

      return {
        taskId: task.id,
        success: true,
        result,
        duration,
        startTime,
        endTime,
      };
    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      logger.error('Task execution failed', error as Error, {
        taskId: task.id,
        duration,
      });

      return {
        taskId: task.id,
        success: false,
        error: error as Error,
        duration,
        startTime,
        endTime,
      };
    }
  }

  /**
   * Execute tasks sequentially
   */
  private async executeSequentially(
    tasks: Task[],
    executor: (task: Task) => Promise<any>
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];

    for (const task of tasks) {
      const result = await this.executeTask(task, executor);
      results.push(result);
    }

    return results;
  }

  /**
   * Create batches of tasks for parallel execution
   */
  private createBatches(tasks: Task[]): Task[][] {
    const batches: Task[][] = [];
    const batchSize = this.config.maxParallelTasks;

    for (let i = 0; i < tasks.length; i += batchSize) {
      batches.push(tasks.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Task execution timeout')), timeoutMs)
      ),
    ]);
  }

  /**
   * Generate unique batch ID
   */
  private generateBatchId(): string {
    return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active batches
   */
  getActiveBatches(): ExecutionBatch[] {
    return Array.from(this.activeBatches.values());
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit?: number): ExecutionBatch[] {
    if (limit) {
      return this.executionHistory.slice(-limit);
    }
    return [...this.executionHistory];
  }

  /**
   * Get execution statistics
   */
  getStatistics(): {
    totalBatches: number;
    totalTasks: number;
    successfulTasks: number;
    failedTasks: number;
    averageDuration: number;
    parallelExecutionRate: number;
  } {
    const totalBatches = this.executionHistory.length;
    let totalTasks = 0;
    let successfulTasks = 0;
    let failedTasks = 0;
    let totalDuration = 0;
    let parallelBatches = 0;

    for (const batch of this.executionHistory) {
      totalTasks += batch.tasks.length;
      if (batch.parallel) parallelBatches++;
      
      for (const result of batch.results) {
        if (result.success) successfulTasks++;
        else failedTasks++;
        totalDuration += result.duration;
      }
    }

    return {
      totalBatches,
      totalTasks,
      successfulTasks,
      failedTasks,
      averageDuration: totalTasks > 0 ? totalDuration / totalTasks : 0,
      parallelExecutionRate: totalBatches > 0 ? parallelBatches / totalBatches : 0,
    };
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executionHistory = [];
    logger.info('Execution history cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ParallelExecutionConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Parallel execution configuration updated', config);
  }

  /**
   * Get current configuration
   */
  getConfig(): ParallelExecutionConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create a parallel executor
 */
export function createParallelExecutor(config?: Partial<ParallelExecutionConfig>): ParallelExecutor {
  const defaultConfig: ParallelExecutionConfig = {
    enabled: true,
    maxParallelTasks: 5,
    maxConcurrentBatches: 2,
    timeoutMs: 300000, // 5 minutes
    retryFailedTasks: true,
    maxRetries: 2,
  };

  return new ParallelExecutor({ ...defaultConfig, ...config });
}

// Made with Bob