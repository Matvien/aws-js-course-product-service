import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { initializeDatabaseService } from "../db/initDatabaseService";
import { errorResponse } from "../utils/response";

export const deleteProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log(event);

  const productId = event.pathParameters?.["productId"];

  if (productId === undefined)
    return errorResponse(422, "productId is undefined");
  try {
    const dbService = initializeDatabaseService();

    const product = await dbService.getProduct(productId);

    if (product === null) return errorResponse(404, "Product not found");

    await dbService.deleteProduct(productId);

    return {
      statusCode: 204,
      body: "OK",
    };
  } catch (e) {
    console.error(e);
    return errorResponse(500, "Error");
  }
};
