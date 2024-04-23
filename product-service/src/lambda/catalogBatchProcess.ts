import { SQSEvent, SQSHandler } from "aws-lambda";
import { SNSClient } from "@aws-sdk/client-sns";

import { initializeDatabaseService } from "../db/initDatabaseService";
import { publishMessageToTopic } from "../utils/publishMessageToTopic";

const { REGION, CREATE_PRODUCT_TOPIC_ARN } = process.env;

export const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
  console.log("Received SQS event:", JSON.stringify(event, null, 2));

  const snsClient = REGION ? new SNSClient({ region: REGION }) : null;

  try {
    const dbService = initializeDatabaseService();

    for (const record of event.Records) {
      const messageData = JSON.parse(record.body);

      // TODO: add validation

      const creationResult = await dbService.createProduct(messageData);

      if (typeof creationResult === "string") {
        const notification =
          "successfully added a product into db, id: " + creationResult;
        console.log(notification);

        if (snsClient !== null && CREATE_PRODUCT_TOPIC_ARN !== undefined) {
          const response = await publishMessageToTopic(
            snsClient,
            CREATE_PRODUCT_TOPIC_ARN,
            notification
          );
          console.log("Message published successfully:", response);
        }
      } else {
        console.error(
          "failed to add a product into db. Error code: ",
          creationResult
        );
      }
    }
  } catch (error) {
    console.error("Error processing message:", error);
    throw error; // Throwing error so that SQS can re-attempt delivery if necessary
  }

  // TODO: only failed messages should be returned back to the queue
};
