import * as core from '@actions/core';
import fetch from 'node-fetch';
import {JIRA_CONFIG} from './config/config';
import {IssueTypeIssueCreateMetadata, JIRAIssueCreateMetadata, request} from './models/models';

function run(): void {
  // retrieve metadata about the options for creating JIRA issues.
  // This step is required as we firstly need to check whether provided issue type (ISSUE_TYPE input)
  // is valid type for the provided project (JIRA_PROJECT_ID)
  fetch(`${JIRA_CONFIG.JIRA_URI}${JIRA_CONFIG.JIRA_ISSUE_METADATA_ENDPOINT}?${new URLSearchParams({
      projectIds: JIRA_CONFIG.JIRA_PROJECT_ID
  })}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JIRA_CONFIG.JIRA_TOKEN}`,
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then((data) => data as JIRAIssueCreateMetadata)
    .then((response: JIRAIssueCreateMetadata) => {
      const issueMetadata = findIssueTypeMetadata(response.projects[0].issuetypes);

      if (!issueMetadata) {
        throw new Error('Such issue type does not allowed for the current project');
      }

      // get issue type metadata
      // https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-createmeta-get
      return fetch(`${JIRA_CONFIG.JIRA_URI}${JIRA_CONFIG.JIRA_ISSUE_METADATA_ENDPOINT}?${new URLSearchParams({
          projectIds: JIRA_CONFIG.JIRA_PROJECT_ID,
          issuetypeIds: issueMetadata.id,
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
    .then(response => response.json())
    .then(response => response as JIRAIssueCreateMetadata)
    .then((response: JIRAIssueCreateMetadata) => {
      // list of issue screen fields to update
      // need to filter by required to create JIRA ticket
      const githubIssue = JSON.parse(core.getInput('issue'));
      const createIssueRequestBody = {
        fields: {
          ...processIssueRequiredFields(response.projects[0].issuetypes[0].fields),
          project: {
            id: JIRA_CONFIG.JIRA_PROJECT_ID
          },
          issuetype: {
            name: JIRA_CONFIG.ISSUE_TYPE
          },
          assignee: {
            name: 'skozelet' //githubIssue['assignee']['login']
          },
          summary: githubIssue['title'],
          description: githubIssue['body']
        }
      };

      console.log('createIssueRequestBody', createIssueRequestBody);

      // create JIRA ticket
      return fetch(`${JIRA_CONFIG.JIRA_URI}${JIRA_CONFIG.JIRA_ISSUE_CREATION_ENDPOINT}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${JIRA_CONFIG.JIRA_TOKEN}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(createIssueRequestBody) //'fields', createIssueRequestBody
        })
    })
    .then(response => response.json())
    .then(response => console.log('JIRA ticket', response))
    .catch(err => {
      core.setFailed(err);
      console.log(err);
    });
}

// check whether provided ISSUE_TYPE is valid issue type for the specified project
function findIssueTypeMetadata(issueTypes: IssueTypeIssueCreateMetadata[]): IssueTypeIssueCreateMetadata | undefined {
  if (issueTypes.length) {
    return issueTypes.find(issueType => issueType.name === JIRA_CONFIG.ISSUE_TYPE);
  }
}

function processIssueRequiredFields(fields: object): object | undefined {
  if (fields) {
    const issueField: any = {};
    const issueFieldsArray: string[] = Object.keys(fields);

    issueFieldsArray.forEach((key: string) => {
      const field = fields[key];

      if (field.required && !field.hasDefaultValue) {
        // console.log(field);

        // explicitly check for fieldid = "issuetype"
        // if (field.fieldId === "issuetype") {
        //   issueField['issuetype'] = {
        //     name: 'Task'
        //   };
        // } else
          if (field.allowedValues?.length) {
          // set data for required field
          // check if allowedValues array is present
          issueField[key] = field.schema.type === 'array' ? [field.allowedValues[field.allowedValues.length - 1]] : field.allowedValues[field.allowedValues.length - 1];
        }
        // else if (field.fieldId === "summary") { // explicitly check for fieldid = "summary"
        //   issueField['summary'] = 'Issue summary';
        // }
      }
    });

    return issueField;
  }
}

run();
