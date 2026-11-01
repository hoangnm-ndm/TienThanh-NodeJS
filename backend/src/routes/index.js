import { Router } from "express";
import { productRoutes } from "../modules/product/product.route.js";
import { authRoutes } from "../modules/auth/auth.route.js";
import { userRoutes } from "../modules/user/user.route.js";
import { permissionRoutes, roleRoutes } from "../modules/role/role.route.js";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/users", userRoutes);
routes.use("/roles", roleRoutes);
routes.use("/permissions", permissionRoutes);
routes.use("/products", productRoutes);
// * Coi rằng việc cập nhật lựa chọn ngôn ngữ của người dùng như là 1 thông tin theo user.
// routes.use("/language", changeLanguage);
