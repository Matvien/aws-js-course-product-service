import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { object, string, number } from "yup";

import { initializeDatabaseService } from "../db/initDatabaseService";
import { errorResponse } from "../utils/response";

export const createProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log(event);

  if (event.body === null) return errorResponse(422, "invalid input");

  try {
    const dbService = initializeDatabaseService();

    let productSchema = object({
      id: string().required(),
      title: string().required(),
      description: string().required(),
      price: number().positive().required(),
    });

    const product = await productSchema.validate(JSON.parse(event.body));

    const creationResult = await dbService.createProduct(product);

    if (typeof creationResult === "string")
      return {
        statusCode: 200,
        body: JSON.stringify({ id: creationResult }, null, 2),
      };
    else return errorResponse(creationResult, "failed to create");
  } catch (e) {
    console.error(e);

    if (e.name === "ValidationError")
      return errorResponse(400, "product data is invalid");

    return errorResponse(500, "Error");
  }
};
