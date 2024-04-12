import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DatabaseService } from "./DatabaseService";

export const initializeDatabaseService = () => {
  const isLambdaEnv = process.env.ENV !== "local";

  const productsTableName = isLambdaEnv
    ? process.env.PRODUCTS_TABLE_NAME
    : "products";
  const stocksTableName = isLambdaEnv
    ? process.env.STOCKS_TABLE_NAME
    : "stocks";

  if (productsTableName === undefined || stocksTableName === undefined)
    throw new Error("env vars dont contain table name settings");

  return new DatabaseService(
    DynamoDBDocumentClient.from(new DynamoDBClient()),
    {
      tableNames: {
        products: productsTableName,
        stocks: stocksTableName,
      },
    }
  );
};
