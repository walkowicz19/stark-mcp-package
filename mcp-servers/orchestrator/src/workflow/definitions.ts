/**
 * Workflow Definitions
 * Pre-defined workflow templates and loader
 */

import { Workflow } from '../types/workflow.js';
import { logger } from '../utils/logger.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class WorkflowDefinitions {
  private workflows: Map<string, Workflow> = new Map();
  private workflowsDir: string;

  constructor(workflowsDir?: string) {
    // Allow configuration via environment variable or parameter
    // Default to a relative path from the build directory
    this.workflowsDir = workflowsDir ||
                        process.env.WORKFLOWS_DIR ||
                        path.join(__dirname, '..', '..', 'workflows');
    this.loadWorkflows();
  }

  /**
   * Load all workflow definitions from the workflows directory
   */
  private loadWorkflows(): void {
    try {
      if (!fs.existsSync(this.workflowsDir)) {
        logger.warn('Workflows directory not found', { dir: this.workflowsDir });
        return;
      }

      const files = fs.readdirSync(this.workflowsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.workflowsDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const workflow = JSON.parse(content) as Workflow;

          this.workflows.set(workflow.id, workflow);
          logger.info('Loaded workflow definition', {
            id: workflow.id,
            name: workflow.name,
            file,
          });
        } catch (error) {
          logger.error('Failed to load workflow', error as Error, { file });
        }
      }

      logger.info('Workflow definitions loaded', { count: this.workflows.size });
    } catch (error) {
      logger.error('Failed to load workflows', error as Error);
    }
  }

  /**
   * Get a workflow by ID
   */
  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  /**
   * Get all workflow definitions
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflows by category
   */
  getWorkflowsByCategory(category: string): Workflow[] {
    return this.getAllWorkflows().filter(w =>
      w.metadata?.category === category
    );
  }

  /**
   * Get workflows by tags
   */
  getWorkflowsByTags(tags: string[]): Workflow[] {
    return this.getAllWorkflows().filter(w => {
      const workflowTags = w.metadata?.tags || [];
      return tags.some(tag => workflowTags.includes(tag));
    });
  }

  /**
   * Search workflows by name or description
   */
  searchWorkflows(query: string): Workflow[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllWorkflows().filter(w =>
      w.name.toLowerCase().includes(lowerQuery) ||
      w.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Register a new workflow definition
   */
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
    logger.info('Registered workflow', { id: workflow.id, name: workflow.name });
  }

  /**
   * Reload all workflow definitions
   */
  reload(): void {
    this.workflows.clear();
    this.loadWorkflows();
  }

  /**
   * Get workflow metadata
   */
  getWorkflowMetadata(id: string): Record<string, any> | undefined {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      return undefined;
    }

    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      version: workflow.version,
      stepCount: workflow.steps.length,
      metadata: workflow.metadata,
    };
  }

  /**
   * List all workflow IDs
   */
  listWorkflowIds(): string[] {
    return Array.from(this.workflows.keys());
  }

  /**
   * Check if a workflow exists
   */
  hasWorkflow(id: string): boolean {
    return this.workflows.has(id);
  }
}

// Export singleton instance
export const workflowDefinitions = new WorkflowDefinitions();

// Made with Bob
