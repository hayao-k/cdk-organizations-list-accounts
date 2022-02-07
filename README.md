[![NPM version](https://badge.fury.io/js/cdk-organizations-list-accounts.svg)](https://badge.fury.io/js/cdk-organizations-list-accounts)
[![PyPI version](https://badge.fury.io/py/cdk-organizations-list-accounts.svg)](https://badge.fury.io/py/cdk-organizations-list-accounts)
![Release](https://github.com/hayao-k/cdk-organizations-list-accounts/workflows/release/badge.svg)

# cdk-organizations-list-accounts
Want to keep an up-to-date list of your AWS accounts?

cdk-organizations-list-accounts is an AWS CDK building library that outputs a list of AWS organization accounts in CSV format.

## Overview
Amazon EventBridge detects the account creation event and starts a Lambda function.  
An accounts list, including the organization structure, will be output to S3 bucket in CSV format.

Output Example:

```csv
Id,Name,Email,Status,Joined Method,Joined Timestamp,OU Id,1st Level OU,2nd Level OU,3rd Level OU,4th Level OU,5th Level OU
000000000000,account-mgmt,account+mgmt@example.com,ACTIVE,INVITED,2022-01-31 07:19:57,r-xxxx
111111111111,account-0001,account+0001@example.com,ACTIVE,INVITED,2022-01-31 07:25:38,ou-xxxx-yyyyyyyy,Suspended
222222222222,account-0002,account+0002@example.com,ACTIVE,CREATED,2022-01-31 07:31:28,ou-xxxx-zzzzzzzz,Sample System,Additional,Workloads,Prod
333333333333,account-0003,account+0003@example.com,ACTIVE,CREATED,2022-01-31 08:15:49,ou-xxxx-zzzzzzzz,Sample System,Additional,Workloads,SDLC
444444444444,account-0004,account+0004@example.com,ACTIVE,CREATED,2022-01-31 09:18:50,ou-xxxx-zzzzzzzz,Sample System,Foundational,Security,Prod
555555555555,account-0005,account+0005@example.com,ACTIVE,CREATED,2022-01-31 10:21:30,ou-xxxx-zzzzzzzz,Sample System,Foundational,Infrastructure,Prod
666666666666,account-0006,account+0006@example.com,ACTIVE,CREATED,2022-01-31 11:21:05,ou-xxxx-zzzzzzzz,Sample System,Foundational,Infrastructure,SDLC
```

## Limitations at present
* Must deploy to AWS Organization's management account
* Events other than CreateAccount are not supported

## Getting Started
### TypeScript
Installation

```
$ yarn add cdk-organizations-list-accounts
```

Usage

```ts
import * as cdk from 'aws-cdk-lib';
import { OrganizationsListAccounts } from 'cdk-organizations-list-accounts';

const App = new cdk.App();
const stack = new cdk.Stack(App, 'Stack', { env: { region: 'us-east-1' } });
new OrganizationsListAccounts(stack, 'Organizations-List-Accounts');
```

Deploy!

```
$ cdk deploy
```

### Python
Installation

```
$ pip install cdk-organizations-list-accounts
```

Usage

```py
import aws_cdk as cdk
from cdk_organizations_list_accounts import OrganizationsListAccounts

app = cdk.App()
stack = cdk.Stack(app, "Stack", env={"region": "us-east-1"})
OrganizationsListAccounts(stack, "Organizations-List-Accounts")
app.synth()
```

Deploy!

```
$ cdk deploy
```
