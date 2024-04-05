import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

import { Product } from "../types";
import { ProductSchema, StockSchema } from "./types";

export class DatabaseService {
  private dbClient: DynamoDBDocumentClient;
  private tableNames: { products: string; stocks: string };

  constructor(
    client: DynamoDBDocumentClient,
    settings: {
      tableNames: { products: string; stocks: string };
    }
  ) {
    this.dbClient = client;
    this.tableNames = settings.tableNames;
  }

  async getAllProducts() {
    const products = (
      await this.dbClient.send(
        new ScanCommand({ TableName: this.tableNames.products })
      )
    ).Items as ProductSchema[] | undefined;

    const productsMap = new Map<string, Product>();

    products?.forEach((p) => productsMap.set(p.id, { ...p, count: 0 }));

    const productKeys = Array.from(productsMap.keys());

    const stocks = (
      await this.dbClient.send(
        new BatchGetCommand({
          RequestItems: {
            [this.tableNames.stocks]: {
              Keys: productKeys.map((k) => ({ product_id: k })),
            },
          },
        })
      )
    ).Responses?.stocks as StockSchema[] | undefined;

    stocks?.forEach((s) => {
      const prod = productsMap.get(s.product_id);

      if (prod === undefined)
        throw new Error("stocks contain unexpected product_id");

      productsMap.set(s.product_id, {
        ...prod,
        count: s.count,
      });
    });

    return Array.from(productsMap.values());
  }

  async getProduct(id: string) {
    const queryResult = (
      await this.dbClient.send(
        new BatchGetCommand({
          RequestItems: {
            [this.tableNames.products]: {
              Keys: [{ id }],
            },
            [this.tableNames.stocks]: {
              Keys: [{ product_id: id }],
            },
          },
        })
      )
    ).Responses;

    if (
      queryResult === undefined ||
      queryResult[this.tableNames.products].length === 0
    )
      return null;

    const product = queryResult[this.tableNames.products][0] as ProductSchema;
    const count =
      queryResult[this.tableNames.stocks].length !== 0
        ? queryResult[this.tableNames.stocks][0].count
        : 0;

    return { ...product, count } as Product;
  }

  async createProduct(product: ProductSchema) {
    const id = product.id;

    const queryResult = await this.dbClient.send(
      new PutCommand({
        TableName: this.tableNames.products,
        Item: {
          ...product,
        },
      })
    );

    if (queryResult.$metadata.httpStatusCode === 200) return id;
    else return queryResult.$metadata.httpStatusCode || 500;
  }
}
