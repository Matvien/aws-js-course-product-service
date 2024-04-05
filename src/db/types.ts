export type ProductSchema = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export type StockSchema = {
  product_id: string;
  count: number;
};
