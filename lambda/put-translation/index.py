# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
import os
import boto3
import json


translate = boto3. client('translate')
event_bus = boto3.client('events')


def handler(event, context):
    body = json.loads(event["body"])
    
    translate_text = body["text"]
    target_lang_list = body["languages"]
    translations = [{
        "language": "en",
        "translation": translate_text,
    }]
    
    for target_lang in target_lang_list:
        resp = translate.translate_text(
            Text=translate_text,
            SourceLanguageCode="en",
            TargetLanguageCode=target_lang,
        )
        
        translations.append({
            "language": resp["TargetLanguageCode"],
            "translation": resp["TranslatedText"],
        })
        
    event_entries = []
    for trans in translations:
        trans['id'] = event["requestContext"]["requestId"]
        event_entries.append({
            "Source": 'website',
            "DetailType": "translation",
            "Detail": json.dumps(trans, ensure_ascii=False),
            "EventBusName": os.environ["TRANSLATE_BUS"],
        })
        
        
    event_bus.put_events(Entries=event_entries)
        
    return json.dumps({
        "id": event["requestContext"]["requestId"],
        "Items": translations,
    }, ensure_ascii=False)
