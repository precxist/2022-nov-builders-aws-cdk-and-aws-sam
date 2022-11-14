# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
import os
import boto3
import json


ddb = boto3.resource('dynamodb')
TABLE_NAME = os.environ["TRANSLATE_TABLE"]
table = ddb.Table(TABLE_NAME)


def get_one(id):
    return table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key('id').eq(id),
    )
    
    
def get_all():
    return table.scan(
        FilterExpression=boto3.dynamodb.conditions.Attr('language').eq('en')
    )
        

def handler(event, context):
    if "pathParameters" in event and "id" in event["pathParameters"]:
        resp = get_one(event["pathParameters"]["id"])
    else:
        resp = get_all()
    
    return json.dumps({
        "Items": resp['Items']
    })
