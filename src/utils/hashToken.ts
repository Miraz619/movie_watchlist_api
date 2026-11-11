import { createHash } from "node:crypto";

export const hashToken = (token: string): string => {
  return createHash("sha256")
    .update(token, "utf8")
    .digest("hex");
};