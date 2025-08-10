# Jira MCP Server

A Model Context Protocol (MCP) Server for Jira integration with Cursor and Claude.

## Features

- **Jira Integration**: Connect to your Jira instance and manage issues, projects, and more
- **Test Case Generation**: When you get an issue, the system asks if you want to generate test cases
- **Simple Workflow**: No complex workflow management - just a simple prompt when you retrieve an issue

## Setup

1. Copy `env.example` to `.env` and fill in your Jira credentials:
   ```
   JIRA_DOMAIN=your-domain.atlassian.net
   JIRA_EMAIL=your-email@example.com
   JIRA_API_TOKEN=your-api-token
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Test Case Generation

When you use the `get_issue` tool to retrieve a Jira issue, the system will automatically ask if you want to generate test cases for that issue. If you respond with "yes", you can provide a filename for the test case markdown file.

### Example Usage

1. Call `get_issue` with an issue key:
   ```
   get_issue(issueKey: "PROJECT-123")
   ```

2. The system will display the issue details and ask:
   ```
   Issue Details:
   **PROJECT-123** - Fix login bug
   Type: Bug
   Status: In Progress
   ...

   ---

   Would you like to generate test cases for this issue? If yes, please provide the name for the test case markdown file.
   ```

3. You can then provide the filename and handle test case generation in your own repository.

## Available Tools

- `get_projects` - Get all projects from Jira
- `get_project` - Get a specific project by key
- `search_issues` - Search for issues using JQL
- `get_issue` - Get a specific issue by key (triggers test case prompt)
- `get_project_issues` - Get all issues for a specific project
- `get_my_issues` - Get issues assigned to the current user
- `get_open_issues` - Get open/unresolved issues
- `get_bugs` - Get bug issues
- `get_tasks` - Get task issues
- `get_stories` - Get story issues
- `create_issue` - Create a new issue
- `add_comment` - Add a comment to an issue
- `get_issue_types` - Get available issue types for a project
- `get_project_components` - Get components for a project

## Notes

- The test case generation is intentionally simple - it just prompts you and lets you handle the actual generation in your repository
- No complex workflow management or state persistence
- Clean and straightforward approach
