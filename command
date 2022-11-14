# put translation
sam local invoke -t ./cdk.out/Nov2022BuildersAwsCdkAndAwsSamStack.template.json PutTranslationFunction -e events/putTranslation.json --env-vars environments.json

# save translation
sam local invoke -t ./cdk.out/Nov2022BuildersAwsCdkAndAwsSamStack.template.json SaveTranslationFunction -e events/saveTranslation.json --env-vars environments.json

# get single translation
sam local invoke -t ./cdk.out/Nov2022BuildersAwsCdkAndAwsSamStack.template.json GetTranslationFunction -e events/getTranslation.json --env-vars environments.json

# get all translations
sam local invoke -t ./cdk.out/Nov2022BuildersAwsCdkAndAwsSamStack.template.json GetTranslationFunction -e events/getAllTranslations.json --env-vars environments.json
