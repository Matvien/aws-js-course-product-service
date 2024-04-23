import {
  SQSClient,
  SendMessageBatchCommand,
  SendMessageBatchCommandInput,
} from "@aws-sdk/client-sqs";

export async function sendMessagesToSQS(
  sqsClient: SQSClient,
  queueUrl: string,
  messages: string[]
): Promise<void> {
  const entries = messages.map((message, index) => ({
    Id: `Message_${index}`, // Each message must have a unique Id within the batch
    MessageBody: message,
  }));

  const params: SendMessageBatchCommandInput = {
    QueueUrl: queueUrl,
    Entries: entries,
  };

  const command = new SendMessageBatchCommand(params);
  try {
    const data = await sqsClient.send(command);
    console.log(
      "Batch send success, sent message IDs:",
      data.Successful?.map((item) => item.Id)
    );
  } catch (err) {
    console.error("Error sending batch message:", err);
    throw new Error(`Unable to send batch message: ${err.message}`);
  }
}
