import * as core from '@actions/core';
import fetch from 'node-fetch';

function run(): void {
  const token = core.getInput('JIRA_TOKEN')


  fetch('https://jiradev.bmc.com/rest/api/2/issue/createmeta', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  })
    .then(response => {
      console.log(token);
      console.log(
        `Response: ${response.status} ${response.statusText}`
      );
      return response.json();
    })
    .then((text: any) => console.log(text['projects'].length))
    .catch(err => core.notice(err));
}

run();
