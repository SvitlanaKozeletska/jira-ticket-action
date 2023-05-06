import fetch from 'node-fetch';
import {JIRA_CONFIG} from './config/config';

function run(): void {
  fetch(`${JIRA_CONFIG.JIRA_ISSUE_METADATA_ENDPOINT}?${new URLSearchParams({
      projectIds: JIRA_CONFIG.JIRA_PROJECT_ID
  })}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JIRA_CONFIG.JIRA_TOKEN}`,
        'Accept': 'application/json'
      }
    })
    .then(response => {
      console.log(
        `Response: ${response.status} ${response.statusText}`
      );
      return response.json();
    })
    .then((response: any) => {
      console.log(response.projects);

      const issueMetadata = isIssueTypeValid(response.projects['issuetypes']);
      console.log('issueMetadata:', issueMetadata);

      if (!issueMetadata) {
        throw new Error('Such issue type does not allowed for the current project');
      }

      // get issue type metadata
      return fetch(`${JIRA_CONFIG.JIRA_ISSUE_METADATA_ENDPOINT}?${new URLSearchParams({
          projectIds: JIRA_CONFIG.JIRA_PROJECT_ID,
          issuetypeIds: issueMetadata['id'],
          expand: 'projects.issuetypes.fields'
        })}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${JIRA_CONFIG.JIRA_TOKEN}`,
            'Accept': 'application/json'
          }
        })
    })
    .then((response: any) => {
      console.log(
        `Response: ${response}`
      );
      return response.json();
    })
    .then(response => console.log(response))
    .catch(err => console.log(err));
}

// check whether provided ISSUE_TYPE is valid issue type for the specified project
function isIssueTypeValid(issueTypes: any[]): boolean {
  return issueTypes.find(issueType => issueType.name === JIRA_CONFIG.ISSUE_TYPE);
}

run();
