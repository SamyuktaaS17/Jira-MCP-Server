#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';
import { JiraClient } from './JiraClient.js';
import { loadConfig, validateConfig } from './config.js';
import { WorkflowManager } from './WorkflowManager.js';
import * as dotenv from 'dotenv';

dotenv.config();

let config;
try {
    config = loadConfig();
    validateConfig(config);
} catch (error) {
  console.error('Configuration error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
}

const server = new Server({
  name: 'jira-mcp-server',
  version: '1.0.0',
  capabilities: {
    tools: {},
  },
});

const jiraClient = new JiraClient(config);
const workflowManager = new WorkflowManager();

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'get_projects',
                description: 'Get all projects from Jira',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_project',
        description: 'Get a specific project by key',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: {
              type: 'string',
              description: 'The key of the project to get',
            },
          },
          required: ['projectKey'],
        },
      },
      {
        name: 'search_issues',
        description: 'Search for issues using JQL (Jira Query Language)',
        inputSchema: {
          type: 'object',
          properties: {
            jql: {
              type: 'string',
              description: 'JQL query string (e.g., "project = PROJECTKEY AND status = \'In Progress\'")',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return (default: 50)',
            },
          },
          required: ['jql'],
        },
      },
      {
        name: 'get_issue',
        description: 'Get a specific issue by key',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: {
              type: 'string',
              description: 'The key of the issue to get (e.g., "PROJECT-123")',
            },
          },
          required: ['issueKey'],
        },
      },
      {
        name: 'get_project_issues',
        description: 'Get all issues for a specific project',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: {
              type: 'string',
              description: 'The key of the project',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return (default: 50)',
            },
          },
          required: ['projectKey'],
        },
      },
      {
        name: 'get_my_issues',
        description: 'Get issues assigned to the current user',
        inputSchema: {
          type: 'object',
          properties: {
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return (default: 50)',
            },
          },
        },
      },
      {
        name: 'get_open_issues',
        description: 'Get open/unresolved issues',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: {
              type: 'string',
              description: 'The key of the project (optional)',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return (default: 50)',
            },
          },
        },
      },
      {
        name: 'get_bugs',
        description: 'Get bug issues',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: {
              type: 'string',
              description: 'The key of the project (optional)',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return (default: 50)',
            },
          },
        },
      },
      {
        name: 'get_tasks',
        description: 'Get task issues',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: {
              type: 'string',
              description: 'The key of the project (optional)',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return (default: 50)',
            },
          },
        },
      },
      {
        name: 'get_stories',
        description: 'Get story issues',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: {
              type: 'string',
              description: 'The key of the project (optional)',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return (default: 50)',
            },
          },
        },
      },
      {
        name: 'create_issue',
        description: 'Create a new issue',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: {
              type: 'string',
              description: 'The key of the project',
            },
            summary: {
              type: 'string',
              description: 'Summary/title of the issue',
            },
            description: {
              type: 'string',
              description: 'Description of the issue',
            },
            issueType: {
              type: 'string',
              description: 'Type of issue (Task, Bug, Story, etc.)',
            },
          },
          required: ['projectKey', 'summary', 'description'],
        },
      },
      {
        name: 'add_comment',
        description: 'Add a comment to an issue',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: {
              type: 'string',
              description: 'The key of the issue (e.g., "PROJECT-123")',
            },
            comment: {
              type: 'string',
              description: 'The comment text to add',
            },
          },
          required: ['issueKey', 'comment'],
        },
      },
      {
        name: 'get_issue_types',
        description: 'Get available issue types for a project',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: {
              type: 'string',
              description: 'The key of the project',
            },
          },
          required: ['projectKey'],
        },
      },
      {
        name: 'get_project_components',
        description: 'Get components for a project',
                inputSchema: {
                    type: 'object',
                    properties: {
            projectKey: {
                            type: 'string',
              description: 'The key of the project',
            },
          },
          required: ['projectKey'],
        },
      },
      {
        name: 'get_workflow_step',
        description: 'Get the current step of an active workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'The ID of the workflow to check',
            },
          },
          required: ['workflowId'],
        },
      },
      {
        name: 'respond_to_workflow',
        description: 'Respond to the current step of an active workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'The ID of the workflow to respond to',
            },
            response: {
              type: 'string',
              description: 'The response to the current workflow step',
            },
          },
          required: ['workflowId', 'response'],
        },
      },
      {
        name: 'get_active_workflows',
        description: 'Get all currently active workflows',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'cancel_workflow',
        description: 'Cancel an active workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'The ID of the workflow to cancel',
            },
          },
          required: ['workflowId'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_projects': {
        const projects = await jiraClient.getProjects();
        return {
          content: [
            {
              type: 'text',
              text: `Found ${projects.length} projects:\n\n${projects.map(project => 
                `**${project.name}** (${project.key})\n` +
                `Type: ${project.projectTypeKey}\n` +
                `Lead: ${project.lead.displayName}\n` +
                `Private: ${project.isPrivate ? 'Yes' : 'No'}\n` +
                `Archived: ${project.archived ? 'Yes' : 'No'}\n`
              ).join('\n---\n')}`,
            },
          ],
        };
      }

      case 'get_project': {
        const project = await jiraClient.getProject(args?.projectKey as string);
        return {
          content: [
            {
              type: 'text',
              text: `Project Details:\n\n` +
                `**${project.name}** (${project.key})\n` +
                `Type: ${project.projectTypeKey}\n` +
                `Lead: ${project.lead.displayName}\n` +
                `Private: ${project.isPrivate ? 'Yes' : 'No'}\n` +
                `Archived: ${project.archived ? 'Yes' : 'No'}\n` +
                `Category: ${project.projectCategory?.name || 'N/A'}\n` +
                `Issue Types: ${project.issueTypes?.length || 0}\n` +
                `Components: ${project.components?.length || 0}`,
            },
          ],
        };
      }

      case 'search_issues': {
        const searchResponse = await jiraClient.searchIssues(
          args?.jql as string,
          args?.maxResults as number || 50
        );
        return {
          content: [
            {
              type: 'text',
              text: `Found ${searchResponse.total} issues (showing ${searchResponse.issues.length}):\n\n${searchResponse.issues.map(issue => 
                `**${issue.key}** - ${issue.fields.summary}\n` +
                `Type: ${issue.fields.issuetype.name}\n` +
                `Status: ${issue.fields.status.name}\n` +
                `Priority: ${issue.fields.priority.name}\n` +
                `Assignee: ${issue.fields.assignee?.displayName || 'Unassigned'}\n` +
                `Reporter: ${issue.fields.reporter.displayName}\n` +
                `Created: ${new Date(issue.fields.created).toLocaleDateString()}\n` +
                `Updated: ${new Date(issue.fields.updated).toLocaleDateString()}\n`
              ).join('\n---\n')}`,
            },
          ],
        };
      }

      case 'get_issue': {
        const issue = await jiraClient.getIssue(args?.issueKey as string);
        
        // Check if there's a workflow that should be triggered
        const workflow = workflowManager.triggerWorkflow('get_issue', { issue });
        
        let workflowMessage = '';
        if (workflow) {
          const workflowState = workflowManager.startWorkflow(workflow.id, { issue });
          const currentStep = workflowManager.getCurrentStep(workflow.id);
          
          if (currentStep) {
            workflowMessage = `\n\n---\n**Workflow Triggered: ${workflow.name}**\n\n${currentStep.message}`;
            if (currentStep.options) {
              workflowMessage += `\n\nOptions: ${currentStep.options.join(', ')}`;
            }
            workflowMessage += `\n\nUse the 'respond_to_workflow' tool with workflowId '${workflow.id}' to continue.`;
          }
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Issue Details:\n\n` +
                `**${issue.key}** - ${issue.fields.summary}\n` +
                `Type: ${issue.fields.issuetype.name}\n` +
                `Status: ${issue.fields.status.name}\n` +
                `Priority: ${issue.fields.priority.name}\n` +
                `Assignee: ${issue.fields.assignee?.displayName || 'Unassigned'}\n` +
                `Reporter: ${issue.fields.reporter.displayName}\n` +
                `Created: ${new Date(issue.fields.created).toLocaleDateString()}\n` +
                `Updated: ${new Date(issue.fields.updated).toLocaleDateString()}\n` +
                `Description: ${issue.fields.description || 'No description'}\n` +
                `Resolution: ${issue.fields.resolution?.name || 'Unresolved'}` +
                workflowMessage,
            },
          ],
        };
      }

      case 'get_project_issues': {
        const issues = await jiraClient.getProjectIssues(args?.projectKey as string, args?.maxResults as number || 50);
        return {
          content: [
            {
              type: 'text',
              text: `Found ${issues.length} issues for project ${args?.projectKey}:\n\n${issues.map(issue => 
                `**${issue.key}** - ${issue.fields.summary}\n` +
                `Type: ${issue.fields.issuetype.name}\n` +
                `Status: ${issue.fields.status.name}\n` +
                `Priority: ${issue.fields.priority.name}\n` +
                `Assignee: ${issue.fields.assignee?.displayName || 'Unassigned'}\n` +
                `Created: ${new Date(issue.fields.created).toLocaleDateString()}\n`
              ).join('\n---\n')}`,
            },
          ],
        };
      }

      case 'get_my_issues': {
        const issues = await jiraClient.getMyIssues(args?.maxResults as number || 50);
        return {
          content: [
            {
              type: 'text',
              text: `Found ${issues.length} issues assigned to you:\n\n${issues.map(issue => 
                `**${issue.key}** - ${issue.fields.summary}\n` +
                `Type: ${issue.fields.issuetype.name}\n` +
                `Status: ${issue.fields.status.name}\n` +
                `Priority: ${issue.fields.priority.name}\n` +
                `Project: ${issue.fields.project.name}\n` +
                `Updated: ${new Date(issue.fields.updated).toLocaleDateString()}\n`
              ).join('\n---\n')}`,
            },
          ],
        };
      }

      case 'get_open_issues': {
        const issues = await jiraClient.getOpenIssues(args?.projectKey as string, args?.maxResults as number || 50);
        return {
          content: [
            {
              type: 'text',
              text: `Found ${issues.length} open issues${args?.projectKey ? ` for project ${args.projectKey}` : ''}:\n\n${issues.map(issue => 
                `**${issue.key}** - ${issue.fields.summary}\n` +
                `Type: ${issue.fields.issuetype.name}\n` +
                `Status: ${issue.fields.status.name}\n` +
                `Priority: ${issue.fields.priority.name}\n` +
                `Assignee: ${issue.fields.assignee?.displayName || 'Unassigned'}\n` +
                `Project: ${issue.fields.project.name}\n`
              ).join('\n---\n')}`,
            },
          ],
        };
      }

      case 'get_bugs': {
        const bugs = await jiraClient.getBugs(args?.projectKey as string, args?.maxResults as number || 50);
        return {
          content: [
            {
              type: 'text',
              text: `Found ${bugs.length} bugs${args?.projectKey ? ` for project ${args.projectKey}` : ''}:\n\n${bugs.map(issue => 
                `**${issue.key}** - ${issue.fields.summary}\n` +
                `Status: ${issue.fields.status.name}\n` +
                `Priority: ${issue.fields.priority.name}\n` +
                `Assignee: ${issue.fields.assignee?.displayName || 'Unassigned'}\n` +
                `Project: ${issue.fields.project.name}\n` +
                `Created: ${new Date(issue.fields.created).toLocaleDateString()}\n`
              ).join('\n---\n')}`,
            },
          ],
        };
      }

      case 'get_tasks': {
        const tasks = await jiraClient.getTasks(args?.projectKey as string, args?.maxResults as number || 50);
        return {
          content: [
            {
              type: 'text',
              text: `Found ${tasks.length} tasks${args?.projectKey ? ` for project ${args.projectKey}` : ''}:\n\n${tasks.map(issue => 
                `**${issue.key}** - ${issue.fields.summary}\n` +
                `Status: ${issue.fields.status.name}\n` +
                `Priority: ${issue.fields.priority.name}\n` +
                `Assignee: ${issue.fields.assignee?.displayName || 'Unassigned'}\n` +
                `Project: ${issue.fields.project.name}\n` +
                `Created: ${new Date(issue.fields.created).toLocaleDateString()}\n`
              ).join('\n---\n')}`,
            },
          ],
        };
      }

      case 'get_stories': {
        const stories = await jiraClient.getStories(args?.projectKey as string, args?.maxResults as number || 50);
        return {
          content: [
            {
              type: 'text',
              text: `Found ${stories.length} stories${args?.projectKey ? ` for project ${args.projectKey}` : ''}:\n\n${stories.map(issue => 
                `**${issue.key}** - ${issue.fields.summary}\n` +
                `Status: ${issue.fields.status.name}\n` +
                `Priority: ${issue.fields.priority.name}\n` +
                `Assignee: ${issue.fields.assignee?.displayName || 'Unassigned'}\n` +
                `Project: ${issue.fields.project.name}\n` +
                `Created: ${new Date(issue.fields.created).toLocaleDateString()}\n`
              ).join('\n---\n')}`,
            },
          ],
        };
      }

      case 'create_issue': {
        const newIssue = await jiraClient.createIssue(
          args?.projectKey as string,
          args?.summary as string,
          args?.description as string,
          args?.issueType as string || 'Task'
        );
        return {
          content: [
            {
              type: 'text',
              text: `Issue created successfully:\n\n` +
                `**${newIssue.key}** - ${newIssue.fields.summary}\n` +
                `Type: ${newIssue.fields.issuetype.name}\n` +
                `Status: ${newIssue.fields.status.name}\n` +
                `Project: ${newIssue.fields.project.name}\n` +
                `Created: ${new Date(newIssue.fields.created).toLocaleDateString()}`,
            },
          ],
        };
      }

      case 'add_comment': {
        const comment = await jiraClient.addComment(args?.issueKey as string, args?.comment as string);
        return {
          content: [
            {
              type: 'text',
              text: `Comment added successfully to ${args?.issueKey}:\n\n` +
                `Comment ID: ${comment.id}\n` +
                `Author: ${comment.author.displayName}\n` +
                `Created: ${new Date(comment.created).toLocaleDateString()}\n` +
                `Body: ${comment.body}`,
            },
          ],
        };
      }

      case 'get_issue_types': {
        const issueTypes = await jiraClient.getIssueTypes(args?.projectKey as string);
        return {
          content: [
            {
              type: 'text',
              text: `Available issue types for project ${args?.projectKey}:\n\n${issueTypes.map(type => 
                `**${type.name}** (${type.id})\n` +
                `Description: ${type.description || 'No description'}\n` +
                `Hierarchy Level: ${type.hierarchyLevel}\n`
              ).join('\n---\n')}`,
            },
          ],
        };
      }

      case 'get_project_components': {
        const components = await jiraClient.getProjectComponents(args?.projectKey as string);
        return {
          content: [
            {
              type: 'text',
              text: `Components for project ${args?.projectKey}:\n\n${components.map(component => 
                `**${component.name}**\n` +
                `ID: ${component.id}\n` +
                `Description: ${component.description || 'No description'}\n` +
                `Lead: ${component.lead?.displayName || 'No lead'}\n`
              ).join('\n---\n')}`,
            },
          ],
        };
      }

      case 'get_workflow_step': {
        const workflowId = args?.workflowId as string;
        const currentStep = workflowManager.getCurrentStep(workflowId);
        
        if (!currentStep) {
          throw new McpError(ErrorCode.InvalidRequest, `No active workflow found with ID: ${workflowId}`);
        }
        
        let stepInfo = `**Current Step:** ${currentStep.id}\n\n**Message:** ${currentStep.message}`;
        if (currentStep.options) {
          stepInfo += `\n\n**Options:** ${currentStep.options.join(', ')}`;
        }
        if (currentStep.required) {
          stepInfo += `\n\n**Required:** Yes`;
        }
        
        return {
          content: [
            {
              type: 'text',
              text: stepInfo,
            },
          ],
        };
      }

      case 'respond_to_workflow': {
        const workflowId = args?.workflowId as string;
        const response = args?.response as string;
        
        try {
          const result = await workflowManager.processWorkflowResponse(workflowId, response);
          
          if (result.completed) {
            return {
              content: [
                {
                  type: 'text',
                  text: `**Workflow Completed Successfully!**\n\n${result.result?.message || 'Workflow has been completed.'}`,
                },
              ],
            };
          } else if (result.nextStep) {
            let nextStepInfo = `**Next Step:** ${result.nextStep.id}\n\n**Message:** ${result.nextStep.message}`;
            if (result.nextStep.options) {
              nextStepInfo += `\n\n**Options:** ${result.nextStep.options.join(', ')}`;
            }
            if (result.nextStep.required) {
              nextStepInfo += `\n\n**Required:** Yes`;
            }
            
            return {
              content: [
                {
                  type: 'text',
                  text: nextStepInfo,
                },
              ],
            };
          } else {
            return {
              content: [
                {
                  type: 'text',
                  text: 'Workflow step processed successfully.',
                },
              ],
            };
          }
        } catch (error) {
          throw new McpError(ErrorCode.InternalError, `Workflow error: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      case 'get_active_workflows': {
        const activeWorkflows = workflowManager.getActiveWorkflows();
        
        if (activeWorkflows.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No active workflows found.',
              },
            ],
          };
        }
        
        const workflowsList = activeWorkflows.map(workflow => 
          `**Workflow ID:** ${workflow.workflowId}\n` +
          `**Current Step:** ${workflow.currentStep}\n` +
          `**Status:** ${workflow.completed ? 'Completed' : 'Active'}`
        ).join('\n\n---\n\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `**Active Workflows:**\n\n${workflowsList}`,
            },
          ],
        };
      }

      case 'cancel_workflow': {
        const workflowId = args?.workflowId as string;
        const cancelled = workflowManager.cancelWorkflow(workflowId);
        
        if (cancelled) {
          return {
            content: [
              {
                type: 'text',
                text: `Workflow ${workflowId} has been cancelled successfully.`,
              },
            ],
          };
        } else {
          throw new McpError(ErrorCode.InvalidRequest, `No active workflow found with ID: ${workflowId}`);
        }
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Error calling Jira API: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Jira MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});