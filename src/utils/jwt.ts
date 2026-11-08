import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

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
  const decoded = jwt.verify(token, secret, {
    algorithms: ["HS256"],
  });

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  return decoded;
};

export const jwtUtils = {
  createToken,
  verifyToken,
};