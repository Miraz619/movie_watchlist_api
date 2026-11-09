import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { userController } from "./user.controller.js";
import { signupSchema } from "./user.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.post(
  "/register",
  validateRequest(signupSchema),
  userController.registerUser,
);

router.get("/me", auth(),userController.getMyProfile);

export const userRoutes = router;