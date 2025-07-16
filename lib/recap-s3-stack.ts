import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

import * as path from 'node:path';

export class RecapS3Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Bucket for uploaded objects
    const s3Bucket = new s3.Bucket(this, 'upload-bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Lambda to generate and return presigned URL
    const uploaderFn = new lambda.Function(this, 'uploader-lambda', {
      runtime: lambda.Runtime.PYTHON_3_13,
      handler: 'main.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'uploader')),
      environment: {
        BUCKET_NAME: s3Bucket.bucketName,
      }
    });

    s3Bucket.grantPut(uploaderFn);

    // API endpoint for uploader Lambda
    const endpoint = new apigw.LambdaRestApi(this, `api`, {
      handler: uploaderFn,
      restApiName: `s3-upload-api`,
    });

    // Lambda to process new uploads
    const ingesterFn = new lambda.Function(this, 'ingester-lambda', {
      runtime: lambda.Runtime.PYTHON_3_13,
      handler: 'main.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'ingester'))
    });

    s3Bucket.grantRead(ingesterFn);

    s3Bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3n.LambdaDestination(ingesterFn)
    );
  }
}
