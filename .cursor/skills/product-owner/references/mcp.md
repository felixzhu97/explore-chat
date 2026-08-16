# Atlassian MCP Integration

This project uses `plugin-atlassian-atlassian` MCP Server for Jira operations.

## Configuration

| Property        | Value                                  |
| --------------- | -------------------------------------- |
| Site URL        | https://felixzhu.atlassian.net         |
| Cloud ID        | `75684fb5-daf5-4962-9581-c4948b9c12cf` |
| User Account ID | `62ee247ff15eecaf500efa39`             |
| Primary Project | `AI` (ExploreAI)                       |

### Available Projects

| Project Key | Name      | Issue Types                              |
| ----------- | --------- | ---------------------------------------- |
| `AI`        | ExploreAI | Epic, Story, Task, Subtask, Bug, Feature |
| `FVXI`      | Support   | Service Request, Incident, Task, Subtask |

> Always include `cloudId` when calling Jira MCP tools.

## Available Tools

| Tool                         | Purpose                                   |
| ---------------------------- | ----------------------------------------- |
| `getVisibleJiraProjects`     | List projects visible to the current user |
| `getJiraIssue`               | Get issue details by key                  |
| `createJiraIssue`            | Create a new issue                        |
| `editJiraIssue`              | Edit an existing issue                    |
| `addCommentToJiraIssue`      | Add a comment                             |
| `transitionJiraIssue`        | Transition issue status                   |
| `searchJiraIssuesUsingJql`   | Search issues using JQL                   |
| `getTransitionsForJiraIssue` | Get available status transitions          |
| `lookupJiraAccountId`        | Look up user account ID                   |

## Quick Reference

### Create Issue

```json
{
  "server": "plugin-atlassian-atlassian",
  "toolName": "createJiraIssue",
  "arguments": {
    "cloudId": "75684fb5-daf5-4962-9581-c4948b9c12cf",
    "projectKey": "AI",
    "issueTypeName": "Task",
    "summary": "Task title",
    "description": "Task description (supports wiki markup)",
    "assignee_account_id": "62ee247ff15eecaf500efa39"
  }
}
```

### Search Issues

```json
{
  "server": "plugin-atlassian-atlassian",
  "toolName": "searchJiraIssuesUsingJql",
  "arguments": {
    "cloudId": "75684fb5-daf5-4962-9581-c4948b9c12cf",
    "jql": "project = AI ORDER BY created DESC",
    "maxResults": 20
  }
}
```

### Add Comment

```json
{
  "server": "plugin-atlassian-atlassian",
  "toolName": "addCommentToJiraIssue",
  "arguments": {
    "cloudId": "75684fb5-daf5-4962-9581-c4948b9c12cf",
    "issueIdOrKey": "AI-123",
    "comment": "Comment content"
  }
}
```

## Workflow

1. Call `getVisibleJiraProjects` with `cloudId: "75684fb5-daf5-4962-9581-c4948b9c12cf"` to get project information
2. Use `createJiraIssue` to create a task (use `AI` project for software development)
3. Use `transitionJiraIssue` to advance the workflow
4. Use `addCommentToJiraIssue` to record progress

## MCP Tool Usage (Important)

**Required Parameters:**

- `cloudId` - Must be obtained from `getAccessibleAtlassianResources` tool first (or use fixed value: `75684fb5-daf5-4962-9581-c4948b9c12cf`)
- `issueTypeName` - **Must use the localized name from your Jira instance** (query via `getJiraProjectIssueTypesMetadata`; do not assume English names like `Task` will work)

**Common Issue Types (AI project — use localized names from Jira metadata):**
| Concept | Typical English label |
|---------|----------------------|
| Epic | Epic |
| Story | Story |
| Task | Task |
| Subtask | Subtask |
| Bug | Bug |
| Feature | Feature |

> **Important**: Using an incorrect or English-only name when Jira expects a localized label will fail with an invalid issue type error. Always fetch issue types from `getJiraProjectIssueTypesMetadata` and use the exact `name` value returned.

**Workflow:**

1. Call `getAccessibleAtlassianResources` to get `cloudId` (or use fixed value)
2. Use `cloudId` for all subsequent Jira operations
3. Use localized `issueTypeName` when creating issues
4. For `projectKey`, use `AI` for ExploreAI project
