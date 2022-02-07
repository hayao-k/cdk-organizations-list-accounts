import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as target from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class OrganizationsListAccounts extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const csvBucket = new s3.Bucket(this, 'CSVBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
    });

    const listAccountsRole = new iam.Role(this, 'ListAccountsRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    const listAccountsPolicy = new iam.ManagedPolicy(
      this,
      'ListAccountsPolicy',
      {
        description: 'Allows Organizations Read Action and Put Obuject',
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'organizations:DescribeOrganizationalUnit',
              'organizations:ListAccountsForParent',
              'organizations:ListChildren',
              'organizations:ListParents',
              'organizations:ListRoots',
            ],
            resources: ['*'],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['s3:PutObject'],
            resources: [`${csvBucket.bucketArn}/*`],
          }),
        ],
      },
    );

    listAccountsRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaBasicExecutionRole',
      ),
    );
    listAccountsRole.addManagedPolicy(listAccountsPolicy);

    const handler = new lambda.Function(this, 'Function', {
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../function')),
      runtime: lambda.Runtime.PYTHON_3_9,
      timeout: cdk.Duration.minutes(3),
      role: listAccountsRole,
      environment: {
        BUCKET: csvBucket.bucketName,
      },
    });

    const ebTarget = new target.LambdaFunction(handler);
    new events.Rule(this, 'OrganizationsListAccounts', {
      ruleName: 'OrganizationsListAccountsRule',
      description: 'Output accounts list in CSV format',
      targets: [ebTarget],
      eventPattern: {
        detailType: ['AWS API Call via CloudTrail'],
        source: ['aws.organizations'],
        detail: {
          eventSource: ['organizations.amazonaws.com'],
          eventName: ['CreateAccount'],
        },
      },
    });
  }
}
