import { JiraIssue } from './types.js';

export interface WorkflowStep {
  id: string;
  type: 'question' | 'input' | 'action';
  message: string;
  options?: string[];
  required?: boolean;
  nextStep?: string;
  action?: (data: any) => Promise<any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  trigger: string; // Tool name that triggers this workflow
}

export interface WorkflowState {
  workflowId: string;
  currentStep: string;
  data: Record<string, any>;
  completed: boolean;
}

export class WorkflowManager {
  private workflows: Map<string, Workflow> = new Map();
  private activeWorkflows: Map<string, WorkflowState> = new Map();

  constructor() {
    this.registerDefaultWorkflows();
  }

  private registerDefaultWorkflows() {
    // Register the test case generation workflow
    const testCaseWorkflow: Workflow = {
      id: 'test_case_generation',
      name: 'Test Case Generation',
      description: 'Generate test cases for a Jira issue',
      trigger: 'get_issue',
      steps: [
        {
          id: 'ask_generate_test_cases',
          type: 'question',
          message: 'Would you like to generate test cases for this issue?',
          options: ['Yes', 'No'],
          nextStep: 'get_filename'
        },
        {
          id: 'get_filename',
          type: 'input',
          message: 'Please provide the name for the test case workflow markdown file:',
          required: true,
          nextStep: 'generate_test_cases'
        },
        {
          id: 'generate_test_cases',
          type: 'action',
          message: 'Test case generation workflow completed. You can now use the provided filename to create your test cases.',
          action: async (data: any) => {
            const issue = data.issue as JiraIssue;
            const filename = data.filename as string;
            
            if (!issue || !filename) {
              throw new Error('Missing required data: issue or filename');
            }
            
            // Return the data for the user to handle test case generation in their repo
            return {
              success: true,
              issueKey: issue.key,
              issueSummary: issue.fields.summary,
              filename: filename,
              message: `Ready to generate test cases for ${issue.key} with filename: ${filename}`
            };
          }
        }
      ]
    };

    this.registerWorkflow(testCaseWorkflow);
  }

  registerWorkflow(workflow: Workflow) {
    this.workflows.set(workflow.id, workflow);
  }

  triggerWorkflow(triggerTool: string, context: any): Workflow | null {
    for (const workflow of this.workflows.values()) {
      if (workflow.trigger === triggerTool) {
        return workflow;
      }
    }
    return null;
  }

  startWorkflow(workflowId: string, context: any): WorkflowState {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const state: WorkflowState = {
      workflowId,
      currentStep: workflow.steps[0].id,
      data: { ...context },
      completed: false
    };

    this.activeWorkflows.set(workflowId, state);
    return state;
  }

  getCurrentStep(workflowId: string): WorkflowStep | null {
    const state = this.activeWorkflows.get(workflowId);
    if (!state) return null;

    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    return workflow.steps.find(step => step.id === state.currentStep) || null;
  }

  async processWorkflowResponse(workflowId: string, response: any): Promise<{ completed: boolean; result?: any; nextStep?: WorkflowStep }> {
    const state = this.activeWorkflows.get(workflowId);
    if (!state) {
      throw new Error(`No active workflow found for ${workflowId}`);
    }

    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const currentStep = workflow.steps.find(step => step.id === state.currentStep);
    if (!currentStep) {
      throw new Error(`Step ${state.currentStep} not found in workflow ${workflowId}`);
    }

    // Store the response in the workflow data
    state.data[currentStep.id] = response;

    // If this is an action step, execute it
    if (currentStep.type === 'action' && currentStep.action) {
      try {
        const result = await currentStep.action(state.data);
        state.data[`${currentStep.id}_result`] = result;
      } catch (error) {
        throw new Error(`Error executing workflow action: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Move to next step or complete workflow
    if (currentStep.nextStep) {
      state.currentStep = currentStep.nextStep;
      const nextStep = workflow.steps.find(step => step.id === state.currentStep);
      return { completed: false, nextStep };
    } else {
      state.completed = true;
      this.activeWorkflows.delete(workflowId);
      return { completed: true, result: state.data };
    }
  }

  getActiveWorkflows(): WorkflowState[] {
    return Array.from(this.activeWorkflows.values());
  }

  cancelWorkflow(workflowId: string): boolean {
    return this.activeWorkflows.delete(workflowId);
  }
}
