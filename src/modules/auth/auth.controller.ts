import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { authService } from "./auth.service.js";

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await authService.loginUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User logged in successfully",
      data: user,
    });
  }
);

export const authController = {
  loginUser,
};