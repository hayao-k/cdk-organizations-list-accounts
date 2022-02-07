"""
AWS Organizations list accounts

Environment variables:
    BUCKET: S3 Bucket Name
"""
from logging import getLogger, INFO
import csv
import operator
import os
from botocore.exceptions import ClientError
import boto3

logger = getLogger()
logger.setLevel(INFO)

def upload_s3(output, key, bucket):
    """Upload csv to S3"""
    try:
        s3_resource = boto3.resource('s3')
        s3_bucket = s3_resource.Bucket(bucket)
        s3_bucket.upload_file(output, key, ExtraArgs={'ACL': 'bucket-owner-full-control'})
    except ClientError as err:
        logger.error(err.response['Error']['Message'])
        raise

def get_ou_ids(org, parent_id):
    """Recursively process list_children to create a list of OUs."""
    ou_ids = []

    try:
        paginator = org.get_paginator('list_children')
        iterator = paginator.paginate(
            ParentId=parent_id,
            ChildType='ORGANIZATIONAL_UNIT'
        )
        for page in iterator:
            for ou in page['Children']:
                ou_ids.append(ou['Id'])
                ou_ids.extend(get_ou_ids(org, ou['Id']))
    except ClientError as err:
        logger.error(err.response['Error']['Message'])
        raise
    else:
        return ou_ids

def get_ou_name(org, ou_id):
    """Return OU name"""
    try:
        ou_info = org.describe_organizational_unit(OrganizationalUnitId=ou_id)
    except ClientError as err:
        logger.error(err.response['Error']['Message'])
        raise
    else:
        return ou_info['OrganizationalUnit']['Name']

def get_ou_structure(org, child_id):
    """Recursively process list_parents and return the OU structure."""
    ou_structure = []

    try:
        parent_ou = org.list_parents(ChildId=child_id)['Parents'][0]
        if parent_ou['Id'][:2] == 'ou':
            ou_structure.append(get_ou_name(org, parent_ou['Id']))
            ou_structure.extend(get_ou_structure(org, parent_ou['Id']))
    except ClientError as err:
        logger.error(err.response['Error']['Message'])
        raise
    else:
        return ou_structure

def list_accounts():
    """Create accounts list"""
    org = boto3.client('organizations')
    accounts = []
    ou_structure = []

    try:
        root_id = org.list_roots()['Roots'][0]['Id']
        ou_id_list = [root_id]
        ou_id_list.extend(get_ou_ids(org, root_id))

        for ou_id in ou_id_list:
            if ou_id[:2] == 'ou':
                ou_structure = get_ou_structure(org, ou_id)
                ou_structure.reverse()
                ou_structure.append(get_ou_name(org, ou_id))
            paginator = org.get_paginator('list_accounts_for_parent')
            page_iterator = paginator.paginate(ParentId=ou_id)
            for page in page_iterator:
                for account in page['Accounts']:
                    item = [
                        account['Id'],
                        account['Name'],
                        account['Email'],
                        account['Status'],
                        account['JoinedMethod'],
                        account['JoinedTimestamp'].strftime('%Y-%m-%d %H:%M:%S'),
                        ou_id,
                    ]
                    accounts.append(item + ou_structure)
    except ClientError as err:
        logger.error(err.response['Error']['Message'])
        raise
    else:
        return sorted(accounts, key=operator.itemgetter(5))

def lambda_handler(event, context):
    """Lambda function to output the list of accounts in AWS organization in CSV format"""
    key = 'accounts.csv'
    output_file = '/tmp/accounts.csv'
    bucket = os.environ['BUCKET']
    header = [[
        'Account Id',
        'Account Name',
        'Account Email',
        'Account Status',
        'Joined Method',
        'Joined Timestamp',
        'OU Id',
        '1st Level OU',
        '2nd Level OU',
        '3rd Level OU',
        '4th Level OU',
        '5th Level OU'
    ]]
    account_list = list_accounts()

    with open(output_file, 'w', newline='', encoding='utf-8') as output:
        writer = csv.writer(output)
        writer.writerows(header)
        writer.writerows(account_list)

    upload_s3(output_file, key, bucket)
