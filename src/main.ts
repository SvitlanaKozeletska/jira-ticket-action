import * as core from '@actions/core';
import fetch from 'node-fetch';

function run(): void {
  const token = core.getInput('JIRA_TOKEN');
  const projectId = core.getInput('JIRA_PROJECT_ID');


  fetch(`https://jiradev.bmc.com/rest/api/2/issue/createmeta?${new URLSearchParams({
      projectIds: projectId
  })}`,
    {
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
    .then((text: any) => console.log(text))
    .catch(err => core.notice(err));
}

run();
