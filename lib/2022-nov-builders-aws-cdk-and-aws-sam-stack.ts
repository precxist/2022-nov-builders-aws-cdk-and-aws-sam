import * as cdk from 'aws-cdk-lib';
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class Nov2022BuildersAwsCdkAndAwsSamStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        
        // ###################################################
        // Translation DDB table
        // ###################################################
        const translateTable = new Table(this, "TranslateTable", {
            partitionKey: {name: 'id', type: AttributeType.STRING},
            sortKey: {name: 'language', type: AttributeType.STRING},
            tableName: "TranslateTable",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
    
        // ###################################################
        // Translation EventBridge bus
        // ###################################################
        const translateBus = new EventBus(this, "TranslateBus", {
            eventBusName: "TranslateBus"
        });

        // ###################################################
        // Put translation function
        const putTranslationFunction = new Function(this, "PutTranslationFunction", {
            runtime: Runtime.PYTHON_3_9,
            handler: 'index.handler',
            code: Code.fromAsset('lambda/put-translation'),
            tracing: Tracing.ACTIVE,
            environment: {
                'TRANSLATE_BUS': translateBus.eventBusName
            }
        });

        translateBus.grantPutEventsTo(putTranslationFunction);

        const translatePolicyStatement = new PolicyStatement({
            actions: ['translate:TranslateText'],
            resources: ['*']
        });

        putTranslationFunction.role?.attachInlinePolicy(
            new Policy(this, "PutTranslatePolicy", {
                statements: [translatePolicyStatement]
            })
        );

        // ###################################################
        // Get translations function
        // ###################################################
        const getTranslationFunction = new Function(this, "GetTranslationFunction", {
            runtime: Runtime.PYTHON_3_9,
            handler: 'index.handler',
            code: Code.fromAsset('lambda/get-translation'),
            tracing: Tracing.ACTIVE,
            environment: {
                'TRANSLATE_TABLE': translateTable.tableName
            }
        });

        translateTable.grantReadData(getTranslationFunction);

        // ###################################################
        // Save translations function
        // ###################################################
        const saveTranslationFunction = new Function(this, "SaveTranslationFunction", {
            runtime: Runtime.PYTHON_3_9,
            handler: 'index.handler',
            code: Code.fromAsset('lambda/save-translation'),
            tracing: Tracing.ACTIVE,
            environment:{
                'TRANSLATE_TABLE': translateTable.tableName
            }
        });

        translateTable.grantWriteData(saveTranslationFunction);

        // ###################################################
        // EventBridge Rule
        // ###################################################
        new Rule(this, "SaveTranslationRule", {
            eventBus: translateBus,
            eventPattern: {detailType: ["translation"]},
            targets:[new LambdaFunction(saveTranslationFunction)]
        });

        // ###################################################
        // API Gateway and routes
        // ###################################################
        const translateAPI = new RestApi(this, "TranslateAPI");

        const root = translateAPI.root;
        root.addMethod('POST', new LambdaIntegration(putTranslationFunction));


        const translation = root.addResource('{id}');
        translation.addMethod('GET', new LambdaIntegration(getTranslationFunction));
        root.addMethod('GET', new LambdaIntegration(getTranslationFunction));

        // ###################################################
        // Outputs
        // ###################################################
        new cdk.CfnOutput(this, 'API url', {
            value: translateAPI.url!
        });
        new cdk.CfnOutput(this, 'Put Function Name', {
          value: putTranslationFunction.functionName
        });
        new cdk.CfnOutput(this, 'Save Function Name', {
          value: saveTranslationFunction.functionName
        });
        new cdk.CfnOutput(this, 'Get Function Name', {
          value: getTranslationFunction.functionName
        });
        new cdk.CfnOutput(this, "Translation Bus", {
          value: translateBus.eventBusName
        });
        new cdk.CfnOutput(this, "Translation Table", {
          value: translateTable.tableName
        });
    }
}
