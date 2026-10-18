import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "zod";
import { loginSchema } from "./auth.schema";

const authRoutes = Router();

export default authRoutes;

authRoutes.use(
  "/register",
  validate({ body: registerSchema }),
  authController.register,
);
authRoutes.use(
  "/register",
  validate({ body: loginSchema }),
  authController.login,
);
