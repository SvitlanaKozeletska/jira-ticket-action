import * as core from '@actions/core'

export const ZENHUB_CONFIG = {
  BASE_URI: 'https://zenhub.bmc.com/api/',
  GITHUB_REPO_ID: '1380',
  GITHUB_REPO_NAME: 'adapt-angular'
};

export const JIRA_CONFIG = {
  JIRA_TOKEN: core.getInput('JIRA_TOKEN'),
  JIRA_PROJECT_ID: core.getInput('JIRA_PROJECT_ID'),
  JIRA_PROJECT_NAME: core.getInput('JIRA_PROJECT_NAME'),
  JIRA_URI: core.getInput('JIRA_URI'),
  ISSUE_TYPE: core.getInput('ISSUE_TYPE'),
  JIRA_ISSUE_CREATION_ENDPOINT: '/rest/api/2/issue',
  JIRA_ISSUE_SEARCH_ENDPOINT: '/rest/api/2/search',
};

export const REST_CONFIG = {
  'Accept': 'application/json'
};
