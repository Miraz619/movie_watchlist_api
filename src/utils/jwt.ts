import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";

const createToken = (
  payload: object,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
) => {
  return jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  });
};

const verifyToken = (token: string, secret: string) => {
  let decoded;

  try {
    decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new jwt.JsonWebTokenError("Invalid token payload", error);
    }

    throw error;
  }

  if (typeof decoded === "string") {
    throw new jwt.JsonWebTokenError("Invalid token payload");
  }

  return decoded;
};

export const jwtUtils = {
  createToken,
  verifyToken,
};