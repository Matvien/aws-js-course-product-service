import productsDB from "../../data/products.json";

export function getAllProducts() {
  return productsDB.products;
}

export function getProduct(id: string) {
  return productsDB.products.find((p) => p.id === id);
}
