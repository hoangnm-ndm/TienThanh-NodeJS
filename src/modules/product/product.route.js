import { Router } from "express";
import { productController } from "./product.controller.js";
import { validate } from "../../shared/middlewares/validate.js";
import { productCreateSchema } from "./product.schema.js";

export const productRoutes = Router();

productRoutes.get("/", productController.getAll);
productRoutes.post(
  "/",
  validate({ body: productCreateSchema }),
  productController.createOne,
);
// productRoutes.get("/", getall);
