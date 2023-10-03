import * as core from '@actions/core';
import {context} from '@actions/github';
import fetch from 'node-fetch';
import {JIRA_CONFIG} from './config/config';
import {IssueTypeIssueCreateMetadata, JIRAIssueCreateMetadata, request} from './models/models';

function run(): void {
  console.log(process.env.GITHUB_ISSUE_ASSIGNEES);
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
