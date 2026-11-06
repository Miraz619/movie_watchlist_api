import type { Request, Response } from "express";
import { userService } from "./user.service.js";

const registerUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.registerUserIntoDB(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    console.error("User registration failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

export const userController = {
  registerUser,
};