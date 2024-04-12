import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const s3Client = new S3Client({ region: "eu-central-1" }); // Replace with your region

export const main = async () => {
  const bucketName = "aws-course-import-bucket"; // Replace with your bucket name
  const objectKey = "uploaded/firstCSV"; // Replace with your object key

  const getObjectParams = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {
    const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));

    if (Body instanceof Readable) {
      // Example of processing the stream
      let objectData = "";
      for await (const chunk of Body) {
        console.log("chunk: ", chunk);
        objectData += chunk;
      }
      const splitted = objectData.split("\n");
      splitted.shift();

      // Assuming the S3 object content is a text or JSON string
      console.log("Object data:", splitted);

      // If JSON, you can parse it
      // const jsonData = JSON.parse(objectData);
      // console.log("JSON data:", jsonData);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Object processed successfully" }),
      };
    } else {
      throw new Error("Expected a stream for the S3 object body.");
    }
  } catch (err) {
    console.error("Error processing S3 object:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error processing object from S3" }),
    };
  }
};

main().then((res) => console.log(res));
