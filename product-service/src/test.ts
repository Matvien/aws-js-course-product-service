import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const { REGION, CREATE_PRODUCT_TOPIC_ARN } = process.env;

// Function to send a message to an SNS topic
async function publishMessageToTopic(
  snsClient: SNSClient,
  topicArn: string,
  message: string
) {
  // console.log("Topic ARN: ", topicArn);

  const params = {
    TopicArn: topicArn, // ARN of the SNS topic
    Message: message, // Message to publish
  };

  try {
    const data = await snsClient.send(new PublishCommand(params));
    console.log("Message sent to SNS topic:", data.MessageId);
    return data; // Contains the message ID of the message sent
  } catch (err) {
    console.error("Failed to send message:", err);
    throw err;
  }
}

const message = "Hello, this is a test message!";

const snsClient = REGION ? new SNSClient({ region: REGION }) : null;

if (snsClient !== null && CREATE_PRODUCT_TOPIC_ARN !== undefined) {
  publishMessageToTopic(snsClient, CREATE_PRODUCT_TOPIC_ARN, message)
    .then((response) =>
      console.log("Message published successfully:", response)
    )
    .catch((error) => console.error("Error publishing message:", error));
}
