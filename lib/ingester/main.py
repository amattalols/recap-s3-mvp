import json
import urllib.parse
import boto3


s3 = boto3.client('s3')


def lambda_handler(event, context):
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    try:
        response = s3.get_object(Bucket=bucket, Key=key)
        print("Got file. Sending to CL...")
        # POST https://some.url/recap -d '{"key": key}'
    except Exception as e:
        print('Error getting object {} from bucket {}.'.format(key, bucket))
        print(e)
        raise e
              
