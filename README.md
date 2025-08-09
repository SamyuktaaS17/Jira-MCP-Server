# Jira MCP Server

A Model Context Protocol (MCP) Server that enables Cursor and Claude to interact with Jira issues and projects. This server provides a comprehensive set of tools for querying, creating, and managing Jira items through natural language interactions.

## 🏗️ Code Structure

The project is organized into several key components:

### Core Files

- **`src/index.ts`** - Main MCP server implementation with tool definitions and request handlers
- **`src/JiraClient.ts`** - Jira API client that handles all HTTP requests to Jira
- **`src/config.ts`** - Configuration management and validation
- **`src/types.ts`** - TypeScript interfaces for Jira data structures

### Architecture Overview

```
Jira MCP Server
├── MCP Server Layer (index.ts)
│   ├── Tool Definitions
│   ├── Request Handlers
│   └── Error Handling
├── Jira Client Layer (JiraClient.ts)
│   ├── HTTP Client (Axios)
│   ├── Authentication
│   └── API Methods
├── Configuration Layer (config.ts)
│   ├── Environment Variables
│   └── Validation
└── Type Definitions (types.ts)
    ├── JiraConfig
    ├── JiraProject
    ├── JiraIssue
    └── JiraSearchResponse
```

## 🚀 Features

### Available Tools

The server provides the following MCP tools:

#### Project Management
- `get_projects` - Retrieve all projects from Jira
- `get_project` - Get a specific project by key

#### Issue Management
- `get_issue` - Retrieve a specific issue by key
- `search_issues` - Search issues using JQL (Jira Query Language)
- `get_project_issues` - Get all issues for a specific project
- `get_my_issues` - Get issues assigned to the current user
- `get_open_issues` - Get unresolved issues
- `get_bugs` - Get bug-type issues
- `get_tasks` - Get task-type issues
- `get_stories` - Get story-type issues

#### Issue Operations
- `create_issue` - Create a new issue
- `update_issue` - Update an existing issue
- `transition_issue` - Change issue status
- `add_comment` - Add comments to issues
- `get_transitions` - Get available status transitions

#### Project Details
- `get_issue_types` - Get available issue types for a project
- `get_project_components` - Get project components

## 📋 Prerequisites

Before running the Jira MCP Server, ensure you have:

1. **Node.js** (version 18 or higher)
2. **Jira Account** with API access
3. **Jira API Token** (not your password)

### Getting Jira API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a label (e.g., "MCP Server")
4. Copy the generated token

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd Jira-MCP-Server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
JIRA_DOMAIN=your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=your-api-token-here
```

**Important Notes:**
- `JIRA_DOMAIN` should be your Atlassian domain (e.g., `company.atlassian.net`)
- `JIRA_EMAIL` should be the email associated with your Jira account
- `JIRA_API_TOKEN` is the token you generated in the prerequisites step

### 3. Build the Project

```bash
npm run build
```

## 🚀 Running the Server

### Method 1: Direct Execution

```bash
npm start
```

### Method 2: Using Node

```bash
node dist/index.js
```

### Method 3: Development Mode

```bash
npm run dev
```

## 🔧 Integration with Cursor

### 1. Install MCP Extension

1. Open Cursor
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "MCP" and install the MCP extension

### 2. Configure MCP Server

1. Open Cursor Settings (Ctrl+,)
2. Search for "MCP"
3. Add a new MCP server configuration:

```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["/path/to/your/Jira-MCP-Server/dist/index.js"],
      "env": {
        "JIRA_DOMAIN": "your-domain.atlassian.net",
        "JIRA_EMAIL": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

### 3. Usage in Cursor

Once configured, you can use the Jira tools directly in Cursor:

- Ask questions like "Show me all open bugs in PROJECT-ABC"
- Request "Create a new task in PROJECT-XYZ with summary 'Fix login issue'"
- Query "What are my assigned issues?"

## 🔧 Integration with Claude

### 1. Claude Desktop Setup

1. Open Claude Desktop
2. Go to Settings → MCP Servers
3. Add a new server:

```json
{
  "name": "jira",
  "command": "node",
  "args": ["/path/to/your/Jira-MCP-Server/dist/index.js"],
  "env": {
    "JIRA_DOMAIN": "your-domain.atlassian.net",
    "JIRA_EMAIL": "your-email@example.com",
    "JIRA_API_TOKEN": "your-api-token-here"
  }
}
```

### 2. Usage in Claude

Claude can now:
- Query Jira projects and issues
- Create and update issues
- Search using JQL
- Manage issue transitions and comments

## 📖 Usage Examples

### Basic Queries

```
"Show me all projects"
"Get project details for PROJECT-ABC"
"Find all open bugs in PROJECT-XYZ"
"Show my assigned issues"
```

### Advanced JQL Queries

```
"Search for issues with 'login' in summary"
"Find high priority bugs created this week"
"Show issues assigned to john.doe@company.com"
```

### Issue Management

```
"Create a new bug in PROJECT-ABC with summary 'User cannot login'"
"Add comment 'Investigating the issue' to PROJECT-123"
"Move PROJECT-456 to 'In Progress' status"
```

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your JIRA_EMAIL and JIRA_API_TOKEN
   - Ensure the API token hasn't expired
   - Check if your Jira account has API access

2. **Connection Refused**
   - Verify JIRA_DOMAIN is correct
   - Ensure you're using the correct Atlassian domain format
   - Check if your network allows HTTPS connections

3. **Permission Denied**
   - Verify your Jira account has the necessary permissions
   - Check if the project you're trying to access is accessible

4. **Build Errors**
   - Ensure Node.js version 18+ is installed
   - Run `npm install` to install dependencies
   - Check TypeScript compilation errors

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=true npm start
```

## 🔒 Security Considerations

- **Never commit your `.env` file** to version control
- **Rotate API tokens** regularly
- **Use minimal permissions** for the API token
- **Monitor API usage** to detect unusual activity

## 📝 Development

### Project Structure

```
src/
├── index.ts          # MCP server implementation
├── JiraClient.ts     # Jira API client
├── config.ts         # Configuration management
└── types.ts          # TypeScript interfaces

dist/                 # Compiled JavaScript (after build)
node_modules/         # Dependencies
.env                  # Environment variables (create this)
```

### Adding New Tools

To add a new MCP tool:

1. Add the tool definition in `src/index.ts`
2. Implement the corresponding method in `src/JiraClient.ts`
3. Add any new types to `src/types.ts`
4. Update this README with the new tool

### Testing

```bash
# Run tests (when implemented)
npm test

# Lint code
npm run lint

# Type checking
npm run type-check
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the error logs
3. Verify your configuration
4. Open an issue on the repository

## 🔗 Related Links

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Jira REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Cursor IDE](https://cursor.sh/)
- [Claude Desktop](https://claude.ai/)
