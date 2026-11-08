import type { NextFunction, Request, Response } from "express";
import { userService } from "./user.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";



type TMeta = {
  page: number;
  limit: number;
  total: number;
};

type TResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data:T;
  TMEta?: TMeta;

};

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

export const userController = {
  registerUser,
};