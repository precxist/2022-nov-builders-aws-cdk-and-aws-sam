# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
import os
import boto3
import json


ddb = boto3.resource('dynamodb')


def handler(event, context):
    item = event["detail"]
    
    table = ddb.Table(os.environ["TRANSLATE_TABLE"])
    resp = table.put_item(Item=item)
        
    return resp
