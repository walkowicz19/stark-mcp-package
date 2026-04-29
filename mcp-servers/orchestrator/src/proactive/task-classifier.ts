/**
 * Task Complexity Classifier
 * Classifies tasks as simple, medium, or complex to determine parallel execution eligibility
 */

export enum TaskComplexity {
  SIMPLE = 'simple',
  MEDIUM = 'medium',
  COMPLEX = 'complex',
}

export interface TaskClassification {
  complexity: TaskComplexity;
  canRunInParallel: boolean;
  estimatedDuration: number; // in milliseconds
  reasoning: string[];
  confidence: number;
}

export interface Task {
  id: string;
  type: string;
  description: string;
  inputs?: any;
  dependencies?: string[];
}

/**
 * Task Complexity Classifier
 */
export class TaskClassifier {
  /**
   * Classify a task based on its characteristics
   */
  static classifyTask(task: Task): TaskClassification {
    const factors = this.analyzeComplexityFactors(task);
    const complexity = this.determineComplexity(factors);
    const canRunInParallel = this.canExecuteInParallel(complexity, task);
    const estimatedDuration = this.estimateDuration(complexity, factors);
    
    return {
      complexity,
      canRunInParallel,
      estimatedDuration,
      reasoning: factors.reasoning,
      confidence: factors.confidence,
    };
  }

  /**
   * Analyze factors that contribute to task complexity
   */
  private static analyzeComplexityFactors(task: Task): {
    score: number;
    reasoning: string[];
    confidence: number;
  } {
    let score = 0;
    const reasoning: string[] = [];
    let confidence = 0.8;

    // Factor 1: Task type complexity
    const typeComplexity = this.getTypeComplexity(task.type);
    score += typeComplexity.score;
    reasoning.push(...typeComplexity.reasoning);

    // Factor 2: Input size and complexity
    if (task.inputs) {
      const inputComplexity = this.analyzeInputComplexity(task.inputs);
      score += inputComplexity.score;
      reasoning.push(...inputComplexity.reasoning);
    }

    // Factor 3: Dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      score += task.dependencies.length * 5;
      reasoning.push(`Has ${task.dependencies.length} dependencies`);
    }

    // Factor 4: Description analysis
    const descComplexity = this.analyzeDescription(task.description);
    score += descComplexity.score;
    reasoning.push(...descComplexity.reasoning);

    return { score, reasoning, confidence };
  }

  /**
   * Get complexity score based on task type
   */
  private static getTypeComplexity(type: string): { score: number; reasoning: string[] } {
    const complexTypes: Record<string, { score: number; reason: string }> = {
      // Complex tasks (50-100 points)
      'full_system_assessment': { score: 100, reason: 'Full system assessment requires comprehensive analysis' },
      'legacy_modernization': { score: 90, reason: 'Legacy modernization involves complex transformations' },
      'database_migration': { score: 85, reason: 'Database migration requires careful planning' },
      'security_audit': { score: 80, reason: 'Security audit needs thorough investigation' },
      'architecture_design': { score: 75, reason: 'Architecture design requires deep analysis' },
      'large_codebase_analysis': { score: 70, reason: 'Large codebase analysis is resource-intensive' },
      'performance_optimization': { score: 65, reason: 'Performance optimization needs profiling and testing' },
      'refactoring': { score: 60, reason: 'Refactoring requires understanding existing code' },
      
      // Medium tasks (25-49 points)
      'code_review': { score: 45, reason: 'Code review requires careful examination' },
      'test_generation': { score: 40, reason: 'Test generation needs code understanding' },
      'documentation': { score: 35, reason: 'Documentation requires comprehensive coverage' },
      'code_generation': { score: 30, reason: 'Code generation needs validation' },
      'bug_fix': { score: 25, reason: 'Bug fixing requires investigation' },
      
      // Simple tasks (0-24 points)
      'syntax_check': { score: 10, reason: 'Syntax checking is straightforward' },
      'format_code': { score: 10, reason: 'Code formatting is automated' },
      'lint': { score: 10, reason: 'Linting is rule-based' },
      'simple_query': { score: 15, reason: 'Simple queries are quick' },
      'file_read': { score: 5, reason: 'File reading is basic I/O' },
      'validation': { score: 20, reason: 'Validation is rule-based' },
    };

    const match = complexTypes[type.toLowerCase().replace(/\s+/g, '_')];
    if (match) {
      return { score: match.score, reasoning: [match.reason] };
    }

    // Default: medium complexity
    return { score: 35, reasoning: ['Unknown task type, assuming medium complexity'] };
  }

  /**
   * Analyze input complexity
   */
  private static analyzeInputComplexity(inputs: any): { score: number; reasoning: string[] } {
    let score = 0;
    const reasoning: string[] = [];

    // Check input size
    const inputStr = JSON.stringify(inputs);
    const inputSize = inputStr.length;

    if (inputSize > 10000) {
      score += 30;
      reasoning.push('Large input size (>10KB)');
    } else if (inputSize > 5000) {
      score += 20;
      reasoning.push('Medium input size (5-10KB)');
    } else if (inputSize > 1000) {
      score += 10;
      reasoning.push('Small input size (1-5KB)');
    }

    // Check for complex data structures
    if (typeof inputs === 'object') {
      const depth = this.getObjectDepth(inputs);
      if (depth > 5) {
        score += 20;
        reasoning.push('Deep nested data structure');
      } else if (depth > 3) {
        score += 10;
        reasoning.push('Moderately nested data structure');
      }

      const keys = Object.keys(inputs);
      if (keys.length > 20) {
        score += 15;
        reasoning.push('Many input parameters');
      } else if (keys.length > 10) {
        score += 10;
        reasoning.push('Several input parameters');
      }
    }

    return { score, reasoning };
  }

  /**
   * Analyze task description for complexity indicators
   */
  private static analyzeDescription(description: string): { score: number; reasoning: string[] } {
    let score = 0;
    const reasoning: string[] = [];
    const lowerDesc = description.toLowerCase();

    // Complex keywords
    const complexKeywords = [
      'comprehensive', 'complete', 'full', 'entire', 'all',
      'analyze', 'assess', 'evaluate', 'investigate',
      'optimize', 'refactor', 'modernize', 'migrate',
      'security', 'performance', 'architecture',
    ];

    const mediumKeywords = [
      'review', 'check', 'validate', 'test',
      'generate', 'create', 'implement',
      'update', 'modify', 'improve',
    ];

    const simpleKeywords = [
      'format', 'lint', 'syntax', 'read',
      'list', 'show', 'display', 'get',
    ];

    let complexCount = 0;
    let mediumCount = 0;
    let simpleCount = 0;

    for (const keyword of complexKeywords) {
      if (lowerDesc.includes(keyword)) complexCount++;
    }
    for (const keyword of mediumKeywords) {
      if (lowerDesc.includes(keyword)) mediumCount++;
    }
    for (const keyword of simpleKeywords) {
      if (lowerDesc.includes(keyword)) simpleCount++;
    }

    if (complexCount > 0) {
      score += complexCount * 15;
      reasoning.push(`Contains ${complexCount} complex operation indicator(s)`);
    }
    if (mediumCount > 0) {
      score += mediumCount * 8;
      reasoning.push(`Contains ${mediumCount} medium operation indicator(s)`);
    }
    if (simpleCount > 0 && complexCount === 0) {
      score -= simpleCount * 5;
      reasoning.push(`Contains ${simpleCount} simple operation indicator(s)`);
    }

    // Check description length
    if (description.length > 500) {
      score += 10;
      reasoning.push('Detailed description suggests complexity');
    }

    return { score, reasoning };
  }

  /**
   * Determine complexity level from score
   */
  private static determineComplexity(factors: { score: number }): TaskComplexity {
    const score = factors.score;

    if (score >= 60) {
      return TaskComplexity.COMPLEX;
    } else if (score >= 30) {
      return TaskComplexity.MEDIUM;
    } else {
      return TaskComplexity.SIMPLE;
    }
  }

  /**
   * Determine if task can run in parallel
   */
  private static canExecuteInParallel(complexity: TaskComplexity, task: Task): boolean {
    // Complex tasks should run individually
    if (complexity === TaskComplexity.COMPLEX) {
      return false;
    }

    // Tasks with many dependencies should run sequentially
    if (task.dependencies && task.dependencies.length > 3) {
      return false;
    }

    // Simple and medium tasks can run in parallel
    return true;
  }

  /**
   * Estimate task duration based on complexity
   */
  private static estimateDuration(complexity: TaskComplexity, factors: { score: number }): number {
    const baseTime: Record<TaskComplexity, number> = {
      [TaskComplexity.SIMPLE]: 5000,    // 5 seconds
      [TaskComplexity.MEDIUM]: 30000,   // 30 seconds
      [TaskComplexity.COMPLEX]: 120000, // 2 minutes
    };

    // Adjust based on score within complexity range
    const base = baseTime[complexity];
    const adjustment = factors.score * 100; // 100ms per score point
    
    return base + adjustment;
  }

  /**
   * Get object depth
   */
  private static getObjectDepth(obj: any, depth: number = 0): number {
    if (typeof obj !== 'object' || obj === null) {
      return depth;
    }

    const depths = Object.values(obj).map(value => 
      this.getObjectDepth(value, depth + 1)
    );

    return depths.length > 0 ? Math.max(...depths) : depth;
  }

  /**
   * Batch classify multiple tasks
   */
  static classifyTasks(tasks: Task[]): Map<string, TaskClassification> {
    const classifications = new Map<string, TaskClassification>();
    
    for (const task of tasks) {
      classifications.set(task.id, this.classifyTask(task));
    }

    return classifications;
  }

  /**
   * Group tasks by complexity for parallel execution
   */
  static groupTasksForExecution(tasks: Task[]): {
    parallel: Task[];
    sequential: Task[];
    classifications: Map<string, TaskClassification>;
  } {
    const classifications = this.classifyTasks(tasks);
    const parallel: Task[] = [];
    const sequential: Task[] = [];

    for (const task of tasks) {
      const classification = classifications.get(task.id);
      if (classification?.canRunInParallel) {
        parallel.push(task);
      } else {
        sequential.push(task);
      }
    }

    return { parallel, sequential, classifications };
  }
}

// Made with Bob