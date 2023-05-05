import * as core from '@actions/core';
import fetch from 'node-fetch';
// import * as http from '@actions/http-client';
import { Octokit } from 'octokit';
import {JIRA_CONFIG} from './config/config';

function run(): void {
  // const githubIssue: any = core.getInput('issue', {required: true});
  // core.notice(`Data: ${githubIssue}`);

  const token = core.getInput('JIRADEV_AUTHORIZATION_TOKEN')

  fetch('https://jiradev.bmc.com/rest/api/2/issue/createmeta', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  })
    .then(response => {
      console.log(
        `Response: ${response.status} ${response.statusText}`
      );
      return response.json();
    })
    .then((text: any) => console.log(text['projects'].length))
    .catch(err => core.notice(err));
}

run();
