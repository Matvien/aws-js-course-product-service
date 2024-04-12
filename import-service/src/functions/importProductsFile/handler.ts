import { APIGatewayProxyEvent } from "aws-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { middyfy } from "@libs/lambda";

const { REGION, BUCKET, FOLDER } = process.env;

const createPresignedUrl = ({ region, bucket, key }) => {
  const client = new S3Client({ region });
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

const importProductsFile = async (event: APIGatewayProxyEvent) => {
  const fileName = event?.queryStringParameters?.["name"];

  if (fileName === undefined)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "name is not provided" }),
    };

  try {
    const clientUrl = await createPresignedUrl({
      region: REGION,
      bucket: BUCKET,
      key: FOLDER + "/" + fileName,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Set CORS headers
      },
      body: clientUrl,
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err }),
    };
  }
};

export const main = middyfy(importProductsFile);
