import { Router } from "express";
import { productRoutes } from "../modules/product/product.route.js";

export const routes = Router();

routes.use("/products", productRoutes);
// * Coi rằng việc cập nhật lựa chọn ngôn ngữ của người dùng như là 1 thông tin theo user.
// routes.use("/language", changeLanguage);
