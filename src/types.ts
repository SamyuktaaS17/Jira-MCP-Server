export interface JiraConfig {
    domain: string,
    email: string,
    api_token: string
}

export interface JiraProjects {
    id: number,
    key: string,
    name: string,
    projectTypeKey: string
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  lead: {
    self: string;
    accountId: string;
    avatarUrls: Record<string, string>;
    displayName: string;
    active: boolean;
  };
  components: any[];
  issueTypes: any[];
  assigneeType: string;
  versions: any[];
  archived: boolean;
  projectCategory: {
    self: string;
    id: string;
    name: string;
    description: string;
  };
  projectKeys: string[];
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      id: string;
      name: string;
      statusCategory: {
        id: number;
        key: string;
        colorName: string;
        name: string;
      };
    };
    priority: {
      id: string;
      name: string;
    };
    assignee?: {
      accountId: string;
      displayName: string;
      emailAddress: string;
    };
    reporter: {
      accountId: string;
      displayName: string;
      emailAddress: string;
    };
    created: string;
    updated: string;
    resolution?: {
      id: string;
      name: string;
    };
    issuetype: {
      id: string;
      name: string;
      hierarchyLevel: number;
    };
    project: {
      id: string;
      key: string;
      name: string;
    };
  };
}

export interface JiraSearchResponse {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
}