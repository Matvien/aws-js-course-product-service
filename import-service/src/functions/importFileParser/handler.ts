import { Readable } from "stream";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";

const { REGION } = process.env;

export const main = async (event: S3Event) => {
  console.log(JSON.stringify(event));

  const s3Client = new S3Client({ region: REGION });

  const bucketName = event.Records[0].s3.bucket.name;
  const fileKey = event.Records[0].s3.object.key;

  try {
    const { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      })
    );

    if (Body instanceof Readable) {
      let fileData = "";
      for await (const chunk of Body) {
        fileData += chunk;
      }
      const csvRecords = fileData.split("\n");
      csvRecords.shift(); // getting rid of the header row
      csvRecords.forEach((record, i) =>
        console.log(`Record ${i + 1}: `, record)
      );
    } else {
      throw new Error("Expected a stream for the S3 object body.");
    }
  } catch (err) {
    console.error("Error processing S3 object:", err);
  }
};
