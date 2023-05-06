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
      // console.log(response.projects);

      const issueMetadata = isIssueTypeValid(response.projects[0].issuetypes);
      // console.log('issueMetadata:', issueMetadata);

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
      // console.log(response.projects[0].issuetypes[0].fields);
      const createIssueRequestBody = processIssueFields(response.projects[0].issuetypes[0].fields);

      if (createIssueRequestBody) {
        console.log(JSON.parse(core.getInput('issue'))['assignee']);
        // createIssueRequestBody['project'] = {
        //   id: JIRA_CONFIG.JIRA_PROJECT_ID
        // };
        // createIssueRequestBody['assignee'] = {
        //   name: core.getInput('issue')['assignee']['login']
        // };
        // createIssueRequestBody['summary'] = {
        //   name: core.getInput('issue')['title']
        // };
        // createIssueRequestBody['description'] = {
        //   name: core.getInput('issue')['body']
        // };
      }

      console.log('createIssueRequestBody', createIssueRequestBody);

    })
    .catch(err => console.log(err));
}

// check whether provided ISSUE_TYPE is valid issue type for the specified project
function isIssueTypeValid(issueTypes: IssueTypeIssueCreateMetadata[]): IssueTypeIssueCreateMetadata | undefined {
  if (issueTypes.length) {
    return issueTypes.find(issueType => issueType.name === JIRA_CONFIG.ISSUE_TYPE);
  }
}

function processIssueFields(fields: object): object | undefined {
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
          issueField[key] = field.allowedValues[field.allowedValues.length - 1];
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
