import type { CookieOptions } from "express";
import ENV from "./configEnv";

export const AUTH_COOKIE_NAME = "token";

export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: ENV.COOKIE_SAME_SITE,
    path: "/",
    maxAge: ENV.JWT_EXPIRES_IN_SECONDS * 1000,
  };
}
