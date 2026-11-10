import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { userController } from "./user.controller.js";
import { signupSchema, updateProfileSchema } from "./user.validation.js";
import { auth } from "../../middlewares/auth.js";

const router = Router();

router.post(
  "/register",
  validateRequest(signupSchema),
  userController.registerUser,
);

router.get("/me", auth(),userController.getMyProfile);

router.patch(
  "/me",
  auth(),
  validateRequest(updateProfileSchema),
  userController.updateMyProfile,
);

router.delete(
  "/me/profile",
  auth(),
  userController.deleteMyProfile,
);
router.delete("/:userId", auth(), userController.deleteUser);

export const userRoutes = router;