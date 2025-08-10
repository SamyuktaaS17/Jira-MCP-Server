# Jira MCP Server - Workflow System

This Jira MCP Server includes a workflow system that can be triggered when certain tools are called. Currently, the system includes a test case generation workflow that triggers when the `get_issue` tool is used.

## How the Workflow System Works

### 1. Workflow Trigger
When you call the `get_issue` tool, the system automatically checks if there are any workflows that should be triggered. If a workflow is found, it will start automatically and display the first step.

### 2. Workflow Steps
The workflow system supports three types of steps:
- **Question**: Asks the user to choose from predefined options
- **Input**: Asks the user to provide text input
- **Action**: Performs an action based on the collected data

### 3. Workflow Management Tools

The following tools are available to manage workflows:

#### `get_workflow_step`
Get information about the current step of an active workflow.
- **Parameters**: `workflowId` (string)

#### `respond_to_workflow`
Respond to the current step of an active workflow.
- **Parameters**: 
  - `workflowId` (string)
  - `response` (string)

#### `get_active_workflows`
List all currently active workflows.
- **Parameters**: None

#### `cancel_workflow`
Cancel an active workflow.
- **Parameters**: `workflowId` (string)

## Test Case Generation Workflow

### Trigger
This workflow is automatically triggered when you call the `get_issue` tool.

### Steps
1. **Ask if user wants to generate test cases**
   - Type: Question
   - Options: "Yes", "No"
   - If "No" is selected, the workflow ends

2. **Get filename for test case document**
   - Type: Input
   - Required: Yes
   - Prompts for the name of the markdown file

3. **Complete workflow**
   - Type: Action
   - Provides the issue details and filename for the user to handle test case generation in their own repository

### Example Usage

1. Call `get_issue` with an issue key:
   ```
   get_issue(issueKey: "PROJECT-123")
   ```

2. The system will display the issue details and trigger the workflow:
   ```
   Issue Details:
   **PROJECT-123** - Fix login bug
   Type: Bug
   Status: In Progress
   ...

   ---
   Workflow Triggered: Test Case Generation

   Would you like to generate test cases for this issue?

   Options: Yes, No

   Use the 'respond_to_workflow' tool with workflowId 'test_case_generation' to continue.
   ```

3. Respond to the workflow:
   ```
   respond_to_workflow(workflowId: "test_case_generation", response: "Yes")
   ```

4. Provide the filename when prompted:
   ```
   respond_to_workflow(workflowId: "test_case_generation", response: "test-cases-PROJECT-123")
   ```

5. The workflow will complete and provide you with the issue details and filename to use for generating test cases in your repository.

## Extending the Workflow System

To add new workflows, you can modify the `WorkflowManager.ts` file and add new workflow definitions in the `registerDefaultWorkflows()` method. Each workflow should define:

- `id`: Unique identifier for the workflow
- `name`: Human-readable name
- `description`: Description of what the workflow does
- `trigger`: The tool name that triggers this workflow
- `steps`: Array of workflow steps

## Notes

- The workflow system is designed to be stateless and simple
- Test case generation is left to the user's repository - this system only provides the workflow framework
- Workflows can be cancelled at any time using the `cancel_workflow` tool
- Multiple workflows can be active simultaneously
