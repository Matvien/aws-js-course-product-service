import type { AWS } from "@serverless/typescript";

import importProductsFile from "@functions/importProductsFile";
import importFileParser from "@functions/importFileParser";

const serverlessConfiguration: AWS = {
  service: "import-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    region: "eu-central-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      REGION: "${self:provider.region}",
      BUCKET: "${self:custom.bucketName}",
      FOLDER: "${self:custom.folderName}",
      CATALOG_ITEMS_QUEUE_URL: "${self:custom.catalogItemsQueue.url}",
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["s3:PutObject", "s3:GetObject"],
            Resource:
              "arn:aws:s3:::${self:custom.bucketName}/${self:custom.folderName}/*",
          },
          {
            Effect: "Allow",
            Action: ["sqs:sendmessage"],
            Resource: "${self:custom.catalogItemsQueue.arn}",
          },
        ],
      },
    },
  },
  functions: { importProductsFile, importFileParser },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node20",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    bucketName: "aws-course-import-bucket",
    folderName: "uploaded",
    catalogItemsQueue: {
      url: "https://sqs.eu-central-1.amazonaws.com/278497268453/catalogItemsQueue",
      arn: "arn:aws:sqs:eu-central-1:278497268453:catalogItemsQueue",
    },
  },
};

module.exports = serverlessConfiguration;
