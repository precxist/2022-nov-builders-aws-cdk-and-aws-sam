#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Nov2022BuildersAwsCdkAndAwsSamStack } from '../lib/2022-nov-builders-aws-cdk-and-aws-sam-stack';

const app = new cdk.App();
const nov2022BuildersAwsCdkAndAwsSamStack = new Nov2022BuildersAwsCdkAndAwsSamStack(
    app, 'Nov2022BuildersAwsCdkAndAwsSamStack', {}
);