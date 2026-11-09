import type { NextFunction, Request, Response } from "express";
import { userService } from "./user.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AppError } from "../../errors/AppError.js";
import { jwtUtils } from "../../utils/jwt.js";
import config from "../../config/index.js";
import { z } from "zod";





const registerUser = catchAsync(async (req: Request, res: Response,next: NextFunction) => {

  const payload = req.body;
  const user =await userService.registerUserIntoDB(payload);

  sendResponse(res, {
  success: true,
  statusCode: 201,
  message: "User registered successfully",
  data: user,
});

}
);

const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;

    if (typeof accessToken !== "string" || !accessToken) {
      throw new AppError(401, "Authentication required");
    }

    const decoded = jwtUtils.verifyToken(
      accessToken,
      config.jwt_access_secret,
    );

    const userId = z.uuid().safeParse(decoded.sub);

    if (!userId.success) {
      throw new AppError(401, "Invalid access token");
    }

    const profile = await userService.getMyProfileFromDB(userId.data);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User profile fetched successfully",
      data: profile,
    });
  },
);

export const userController = {
  registerUser,
  getMyProfile,
};