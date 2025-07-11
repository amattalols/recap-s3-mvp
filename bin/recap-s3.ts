#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { RecapS3Stack } from '../lib/recap-s3-stack';

const app = new cdk.App();
new RecapS3Stack(app, 'RecapS3Stack');
