import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { initializeDatabaseService } from "../db/initDatabaseService";
import { errorResponse } from "../utils/response";

export const getProductsList = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log(event);
  try {
    const dbService = initializeDatabaseService();

    const products = await dbService.getAllProducts();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(products, null, 2),
    };
  } catch (e) {
    console.error(e);
    return errorResponse(500, "Error");
  }
};
