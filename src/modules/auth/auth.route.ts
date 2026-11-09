import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { authController } from "./auth.controller.js";
import { loginSchema } from "./auth.validation.js";

const router = Router();

router.post(
  "/login",
  validateRequest(loginSchema),
  authController.loginUser
);

router.post("/refresh-token", authController.refreshToken);

export const authRoutes = router;