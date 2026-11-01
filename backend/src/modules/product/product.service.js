import { Product } from "./product.model.js";

export const productService = {
  getAll: async () => {
    const items = await Product.find({});
    return items;
  },
  createOne: async (body) => {
    const item = await Product.create(body);
    return item;
  },
};
