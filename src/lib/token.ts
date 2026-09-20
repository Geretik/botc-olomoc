import { randomBytes } from "node:crypto";

export function generateEditToken() {
  return randomBytes(32).toString("base64url");
}
