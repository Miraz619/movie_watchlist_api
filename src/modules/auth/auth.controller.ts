import type { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { authService } from "./auth.service.js";
import { AppError } from "../../errors/AppError.js";

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken, refreshToken, user } = await authService.loginUser(req.body);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User logged in successfully",
      data: user,
    });
  },
);

const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.refreshToken;

    if (typeof token !== "string" || !token) {
      throw new AppError(401, "Refresh token required");
    }

    const { accessToken } = await authService.refreshToken(token);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Access token refreshed successfully",
      data: { accessToken },
    });
  },
);





//signout user
const signout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.refreshToken;

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    if (typeof token === "string" && token) {
      await authService.signout(token);
    }

    res.status(204).send();
  },
);



export const authController = {
  loginUser,
  refreshToken,
  signout,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
};
