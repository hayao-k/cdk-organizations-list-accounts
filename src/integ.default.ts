import * as cdk from 'aws-cdk-lib';
import { OrganizationsListAccounts } from './index';

const App = new cdk.App();
const stack = new cdk.Stack(App, 'Stack', { env: { region: 'us-east-1' } });

new OrganizationsListAccounts(stack, 'Organizations-List-Accounts');
