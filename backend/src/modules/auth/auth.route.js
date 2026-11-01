import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../shared/middlewares/validate.js";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { loginSchema, refreshTokenCookieSchema, registerSchema } from "./auth.schema.js";

export const authRoutes = Router();

authRoutes.post("/register", validate({ body: registerSchema }), authController.register);
authRoutes.post("/login", validate({ body: loginSchema }), authController.login);
authRoutes.post(
  "/refresh-token",
  validate({ cookies: refreshTokenCookieSchema }),
  authController.refreshToken,
);
// * Logout không bắt buộc access token còn hạn — chỉ cần cookie refresh token (nếu có).
authRoutes.post("/logout", authController.logout);
authRoutes.get("/me", authenticate, authController.me);
