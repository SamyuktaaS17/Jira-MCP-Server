import { JiraConfig } from './types.js';

export function loadConfig(): JiraConfig {
  const config: JiraConfig = {
    domain: process.env.JIRA_DOMAIN || '',
    email: process.env.JIRA_EMAIL || '',
    api_token: process.env.JIRA_API_TOKEN || ''
  };

  if (!config.api_token) {
    throw new Error('JIRA_API_TOKEN environment variable is required');
  }

  if (!config.email) {
    throw new Error('JIRA_EMAIL environment variable is required');
  }

  if (!config.domain) {
    throw new Error('JIRA_DOMAIN environment variable is required');
  }

  return config;
}

export function validateConfig(config: JiraConfig): void {
  if (!config.domain) {
    throw new Error('Jira domain is required');
  }

  if (!config.email) {
    throw new Error('Jira email is required');
  }

  if (!config.api_token) {
    throw new Error('Jira API token is required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(config.email)) {
    throw new Error(`Invalid email format: ${config.email}`);
  }

  // Validate domain format (basic check)
  if (!config.domain.includes('.') || config.domain.length < 3) {
    throw new Error(`Invalid domain format: ${config.domain}`);
  }
} 