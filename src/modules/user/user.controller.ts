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
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    const profile = await userService.getMyProfileFromDB(req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "User profile fetched successfully",
      data: profile,
    });
  },
);

const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    const updatedProfile = await userService.updateMyProfileInDB(
      req.user.id,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  },
);

const deleteMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    await userService.deleteMyProfileFromDB(req.user.id);

    res.status(204).send();
  },
);

const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    const userId = z.uuid().parse(req.params.userId).toLowerCase();

    await userService.deleteUserFromDB(userId, req.user);

    if (req.user.id === userId) {
      res.clearCookie("accessToken", { path: "/" });
      res.clearCookie("refreshToken", { path: "/" });
    }
    

  sendResponse(res, {
  statusCode: 200,
  success: true,
  message: "User deleted successfully",
  data: null,
});
    
  },
);


const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allUsers = await userService.getAllUsersFromDB();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "All users fetched successfully",
      data: allUsers,
    });
  },
);

export const userController = {
  registerUser,
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  deleteUser,
  getAllUsers,
};