const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'hayao-k',
  authorAddress: '30886141+hayao-k@users.noreply.github.com',
  autoApproveOptions: {
    allowedUsernames: ['hayao-k'],
  },
  cdkVersion: '2.10.0',
  compat: true,
  defaultReleaseBranch: 'main',
  description: 'cdk-organizations-list-accounts is an AWS CDK building library that outputs a list of AWS organization accounts in CSV format.',
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve'],
    },
  },
  keywords: ['aws', 'organizations', 'cdk', 'csv'],
  name: 'cdk-organizations-list-accounts',
  publishToPypi: {
    distName: 'cdk-organizations-list-accounts',
    module: 'cdk_organizations_list_accounts',
  },
  repositoryUrl: 'https://github.com/hayao-k/cdk-organizations-list-accounts.git',
  stability: 'experimental',
});

const common_exclude = ['cdk.out', 'cdk.context.json', 'yarn-error.log', 'coverage'];
project.gitignore.exclude(...common_exclude);
project.npmignore.exclude(...common_exclude, 'images');

project.synth();