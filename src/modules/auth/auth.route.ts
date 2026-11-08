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

export const authRoutes = router;