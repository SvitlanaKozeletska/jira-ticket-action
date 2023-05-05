import * as core from '@actions/core';
const fetch = require('node-fetch');
// import * as http from '@actions/http-client';
import { Octokit } from 'octokit';
import {JIRA_CONFIG} from './config/config';

function run(): void {
  const githubIssue: any = core.getInput('issue', {required: true});
  core.notice(`Data: ${githubIssue}`);

  fetch('https://jiradev.bmc.com/rest/api/2/issue/createmeta', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer MDM1Njg4NDM2MzM1OhpnvHrEr4LxicgqnZvTM/BMQv8d`,
      'Accept': 'application/json'
    }
  })
    .then(response => {
      core.notice(
        `Response: ${response.status} ${response.statusText}`
      );
      return response.text();
    })
    .then(text => {
      core.setOutput('http-response', text);
    })
    .catch(err => console.error(err));

  // const response = `Awesome awesome!`;
  // core.setOutput('http-response', response);
}

run();
