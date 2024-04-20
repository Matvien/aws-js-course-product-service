import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

export async function publishMessageToTopic(
  snsClient: SNSClient,
  topicArn: string,
  message: string
) {
  const params = {
    TopicArn: topicArn,
    Message: message,
  };

  try {
    const data = await snsClient.send(new PublishCommand(params));
    console.log("Message sent to SNS topic:", data.MessageId);
    return data;
  } catch (err) {
    console.error("Failed to send message:", err);
    throw err;
  }
}
