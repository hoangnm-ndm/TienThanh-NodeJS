import { Router } from "express";
import { productController } from "./product.controller.js";

export const productRoutes = Router();

productRoutes.get("/", productController.getAll);
// productRoutes.get("/", getall);
// productRoutes.get("/", getall);
