import * as fs from "fs";
import * as path from "path";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Product } from "../types";
import { ProductSchema, StockSchema } from "./types";

const jsonFilePath = path.join(__dirname, "../../data/products.json");

const readJsonFile = (filePath: string) => {
  const rawData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(rawData);
};

const uploadProductsToDynamoDB = async (products: Product[]) => {
  try {
    const dbClient = DynamoDBDocumentClient.from(new DynamoDBClient());

    const result = await dbClient.send(
      new BatchWriteCommand({
        RequestItems: {
          products: products.map((product) => ({
            PutRequest: {
              Item: {
                id: product.id,
                title: product.title,
                description: product.description,
                price: product.price,
              } as ProductSchema,
            },
          })),
          stocks: products.map((product) => ({
            PutRequest: {
              Item: {
                product_id: product.id,
                count: product.count,
              } as StockSchema,
            },
          })),
        },
      })
    );
    console.log("Batch write successful", result);
  } catch (error) {
    console.error("Error writing batch to DynamoDB", error);
  }
};

const main = async () => {
  const data: { products: Product[] } = readJsonFile(jsonFilePath);
  await uploadProductsToDynamoDB(data.products);
};

main().catch((error) => console.error("An error occurred:", error));
