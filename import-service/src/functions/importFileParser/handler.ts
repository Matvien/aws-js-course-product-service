import { Readable } from "stream";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { S3Event } from "aws-lambda";
import csv from "csv-parser";
import { sendMessagesToSQS } from "src/utils/sendMessagesToSQS";

const { REGION, CATALOG_ITEMS_QUEUE_URL } = process.env;

export const main = async (event: S3Event) => {
  console.log(JSON.stringify(event));

  if (!CATALOG_ITEMS_QUEUE_URL) return;

  const s3Client = new S3Client({ region: REGION });
  const sqsClient = new SQSClient({ region: REGION });

  try {
    const bucketName = event.Records[0].s3.bucket.name;
    const fileKey = event.Records[0].s3.object.key;

    const { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      })
    );

    if (Body instanceof Readable) {
      let recordsBuffer: Array<any> = [];
      const batchSize = 5;

      return new Promise((resolve) => {
        const sendingPromises: Array<Promise<any>> = [];

        Body.pipe(csv())
          .on("data", (data) => {
            recordsBuffer.push(data);

            if (recordsBuffer.length === batchSize) {
              console.log("pushing the buffer into sqs", recordsBuffer);

              sendingPromises.push(
                sendMessagesToSQS(
                  sqsClient,
                  CATALOG_ITEMS_QUEUE_URL,
                  recordsBuffer.map((r) => JSON.stringify(r))
                )
              );
              recordsBuffer = [];
            }
          })
          .on("end", async () => {
            console.log("stream has ended");

            if (recordsBuffer.length > 0) {
              console.log(
                "pushing the buffer leftovers into sqs",
                recordsBuffer
              );

              sendingPromises.push(
                sendMessagesToSQS(
                  sqsClient,
                  CATALOG_ITEMS_QUEUE_URL,
                  recordsBuffer.map((r) => JSON.stringify(r))
                )
              );
            }

            await Promise.all(sendingPromises);

            resolve(1);
          });
      });
    } else {
      throw new Error("Expected a stream for the S3 object body.");
    }
  } catch (err) {
    console.error("Error processing S3 object:", err);
  }
};
