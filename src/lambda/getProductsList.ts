import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { getAllProducts } from "../db/products";

export const getProductsList = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify(getAllProducts(), null, 2),
  };
};
