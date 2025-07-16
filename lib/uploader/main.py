from datetime import datetime
import json
import os
import uuid

import boto3
from botocore.config import Config


s3_client = boto3.client('s3', config=Config(signature_version='s3v4'))

BUCKET_NAME = os.getenv('BUCKET_NAME')


def lambda_handler(event, context):
    print(event)
    try:
        now = datetime.now()
        key = f"{now.year}/{now.month}/{now.day}/{uuid.uuid4()}.pdf"
        params = {
            "Bucket": BUCKET_NAME,
            "Key": key,
            "ContentType": "application/octet-stream",
            "Metadata": {
                "requestid": event['requestContext']['requestId']
            }
        }
        url = s3_client.generate_presigned_url(
            ClientMethod="put_object",
            Params=params,
            ExpiresIn=1000
        )
        return {
            "statusCode": 200,
            "body": json.dumps({"url": url, "requestid": event['requestContext']['requestId']})
        }
    except Exception as e:
        print(f"Error creating signed url: {str(e)}")
        raise