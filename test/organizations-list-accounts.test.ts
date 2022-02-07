import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { OrganizationsListAccounts } from '../src/index';

const mockApp = new App();
const stack = new Stack(mockApp);
new OrganizationsListAccounts(stack, 'testing-stack');
const template = Template.fromStack(stack);

test('Lambda functions should be configured with appropriate properties and execution roles', () => {
  template.hasResourceProperties('AWS::Lambda::Function', {
    Handler: 'lambda_function.lambda_handler',
    Runtime: 'python3.9',
    Timeout: 180,
  });

  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
  });

  template.hasResourceProperties('AWS::IAM::ManagedPolicy', {
    PolicyDocument: {
      Statement: Match.arrayWith([
        {
          Action: [
            'organizations:DescribeOrganizationalUnit',
            'organizations:ListAccountsForParent',
            'organizations:ListChildren',
            'organizations:ListParents',
            'organizations:ListRoots',
          ],
          Effect: 'Allow',
          Resource: '*',
        },
      ]),
    },
  });
});

test('Event rule should have an event pattern for CreateAccount', () => {
  template.hasResourceProperties('AWS::Events::Rule', {
    EventPattern: {
      'detail-type': ['AWS API Call via CloudTrail'],
      'source': ['aws.organizations'],
      'detail': {
        eventSource: ['organizations.amazonaws.com'],
        eventName: ['CreateAccount'],
      },
    },
    State: 'ENABLED',
    Targets: Match.anyValue(),
  });
});

test('S3 buckets should have the appropriate properties set', () => {
  template.hasResourceProperties('AWS::S3::Bucket', {
    PublicAccessBlockConfiguration: Match.objectEquals({
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    }),
    BucketEncryption: {
      ServerSideEncryptionConfiguration: [
        {
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: 'AES256',
          },
        },
      ],
    },
    OwnershipControls: {
      Rules: [
        {
          ObjectOwnership: 'BucketOwnerEnforced',
        },
      ],
    },
  });
});
