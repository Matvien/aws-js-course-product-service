import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { getProduct } from "../db/products";
import { errorResponse } from "../utils/response";

export const getProductsById = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const productId = event.pathParameters!["productId"];

  if (productId === undefined)
    return errorResponse(422, "productId is undefined");

  const product = getProduct(productId);

  if (product === undefined) return errorResponse(404, "Product not found");

  return {
    statusCode: 200,
    body: JSON.stringify(product, null, 2),
  };
};
