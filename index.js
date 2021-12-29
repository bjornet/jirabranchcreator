#!/usr/bin/env node
// import { config as dotenvConfig } from 'dotenv';

import { setupJiraConnector, getJiraIssue } from './getJiraIssue.js';
import { kebabCase, print, shellExec } from './utils/index.js';
import { getHelpMessage, getUsageMessage, getMissingArugmentsMessage } from './messages.js';
import { getArguments } from './arguments.js';

// dotenvConfig({
//   debug: true,
//   path: new URL('.env', import.meta.url),
// });

// const envtest = process.env.FOO;
// console.log(envtest);

const {
  type,
  code,
  yelp
} = getArguments();

const generateBranchName = ({ summary }) => {
  return kebabCase(`${type}/${code}-${summary}`);
};

const haltOnInitMessages = () => {
  if (yelp) {
    print(getUsageMessage);
    return true;
  }

  if (!type || type === true || !code || code === true) {
    print(getMissingArugmentsMessage.bind(null, {type, code}));
    print(getUsageMessage);

    return true;
  }

  return false;
};

const checkoutBranch = (branchName) => {
  shellExec(`git checkout -b ${branchName}`, (err, stdout) => {
    if(err){
      console.log(err);
      return;
    }

    console.log(stdout);
  });
};

const App = async () => {
  print(getHelpMessage);

  if (haltOnInitMessages()) {
    return;
  }

  await setupJiraConnector(code);

  checkoutBranch(
    generateBranchName(
      await getJiraIssue()
    )
  );
};

App();
