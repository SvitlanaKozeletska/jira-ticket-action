import * as core from '@actions/core'

function run(): void {
  const issue = core.getInput('issue', {required: true});
  core.notice(`Data: ${issue}`);

  const response = `Awesome!`;
  core.setOutput('http-response', response);
}

run();
