import axios, { AxiosInstance, AxiosError } from 'axios';
import { JiraConfig, JiraProject, JiraIssue, JiraSearchResponse } from './types.js';

export class JiraClient {
  private client: AxiosInstance;
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;
    
    // Create base64 encoded credentials
    const credentials = Buffer.from(`${config.email}:${config.api_token}`).toString('base64');
    
    this.client = axios.create({
      baseURL: `https://${config.domain}/rest/api/2`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      timeout: 30000
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          throw new Error('Authentication failed. Please check your Jira email and API token.');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied. Please check your Jira permissions.');
        }
        if (error.response?.status === 404) {
          throw new Error('Resource not found. Please check your project key or issue key.');
        }
        if (error.code === 'ECONNREFUSED') {
          throw new Error(`Cannot connect to Jira server at ${this.config.domain}. Please check the domain and ensure the server is running.`);
        }
        throw new Error(`Jira API error: ${error.message}`);
      }
    );
  }

  async getProjects(): Promise<JiraProject[]> {
    try {
      const response = await this.client.get<JiraProject[]>('/project');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getProject(projectKey: string): Promise<JiraProject> {
    try {
      const response = await this.client.get<JiraProject>(`/project/${projectKey}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch project ${projectKey}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async searchIssues(jql: string, maxResults: number = 50, startAt: number = 0): Promise<JiraSearchResponse> {
    try {
      const response = await this.client.post<JiraSearchResponse>('/search', {
        jql,
        startAt,
        maxResults,
        fields: [
          'summary',
          'description',
          'status',
          'priority',
          'assignee',
          'reporter',
          'created',
          'updated',
          'resolution',
          'issuetype',
          'project'
        ]
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search issues: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getIssue(issueKey: string): Promise<JiraIssue> {
    try {
      const response = await this.client.get<JiraIssue>(`/issue/${issueKey}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch issue ${issueKey}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getProjectIssues(projectKey: string, maxResults: number = 50): Promise<JiraIssue[]> {
    const jql = `project = ${projectKey} ORDER BY created DESC`;
    const response = await this.searchIssues(jql, maxResults);
    return response.issues;
  }

  async getMyIssues(maxResults: number = 50): Promise<JiraIssue[]> {
    const jql = `assignee = currentUser() ORDER BY updated DESC`;
    const response = await this.searchIssues(jql, maxResults);
    return response.issues;
  }

  async getOpenIssues(projectKey?: string, maxResults: number = 50): Promise<JiraIssue[]> {
    const projectFilter = projectKey ? `project = ${projectKey} AND ` : '';
    const jql = `${projectFilter}status != "Done" AND status != "Closed" ORDER BY priority DESC, updated DESC`;
    const response = await this.searchIssues(jql, maxResults);
    return response.issues;
  }

  async getBugs(projectKey?: string, maxResults: number = 50): Promise<JiraIssue[]> {
    const projectFilter = projectKey ? `project = ${projectKey} AND ` : '';
    const jql = `${projectFilter}issuetype = "Bug" ORDER BY priority DESC, created DESC`;
    const response = await this.searchIssues(jql, maxResults);
    return response.issues;
  }

  async getTasks(projectKey?: string, maxResults: number = 50): Promise<JiraIssue[]> {
    const projectFilter = projectKey ? `project = ${projectKey} AND ` : '';
    const jql = `${projectFilter}issuetype = "Task" ORDER BY priority DESC, created DESC`;
    const response = await this.searchIssues(jql, maxResults);
    return response.issues;
  }

  async getStories(projectKey?: string, maxResults: number = 50): Promise<JiraIssue[]> {
    const projectFilter = projectKey ? `project = ${projectKey} AND ` : '';
    const jql = `${projectFilter}issuetype = "Story" ORDER BY priority DESC, created DESC`;
    const response = await this.searchIssues(jql, maxResults);
    return response.issues;
  }

  async createIssue(projectKey: string, summary: string, description: string, issueType: string = 'Task'): Promise<JiraIssue> {
    try {
      const response = await this.client.post<JiraIssue>('/issue', {
        fields: {
          project: {
            key: projectKey
          },
          summary,
          description,
          issuetype: {
            name: issueType
          }
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create issue: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateIssue(issueKey: string, fields: any): Promise<void> {
    try {
      await this.client.put(`/issue/${issueKey}`, {
        fields
      });
    } catch (error) {
      throw new Error(`Failed to update issue ${issueKey}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async transitionIssue(issueKey: string, transitionId: string): Promise<void> {
    try {
      await this.client.post(`/issue/${issueKey}/transitions`, {
        transition: {
          id: transitionId
        }
      });
    } catch (error) {
      throw new Error(`Failed to transition issue ${issueKey}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async addComment(issueKey: string, comment: string): Promise<any> {
    try {
      const response = await this.client.post(`/issue/${issueKey}/comment`, {
        body: comment
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add comment to issue ${issueKey}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getTransitions(issueKey: string): Promise<any> {
    try {
      const response = await this.client.get(`/issue/${issueKey}/transitions`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get transitions for issue ${issueKey}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getIssueTypes(projectKey: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/project/${projectKey}`);
      return response.data.issueTypes;
    } catch (error) {
      throw new Error(`Failed to get issue types for project ${projectKey}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getProjectComponents(projectKey: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/project/${projectKey}/components`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get components for project ${projectKey}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
