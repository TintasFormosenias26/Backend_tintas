import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ENV from "../config/configEnv";
import { sendError } from "./errorHandler";

// Middleware para validar JWT
export const validateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const tokenHeader = req.headers["authorization"]?.split(" ")[1];
  const tokenCookie = req.cookies.token;

  const token: string = tokenCookie || tokenHeader;

  if (!token) {
    sendError(res, 401, "UNAUTHORIZED", "Tu sesión no es válida.");
    return;
  }

  jwt.verify(token, ENV.JWT_SECRET, {
    algorithms: ["HS256"],
    issuer: ENV.JWT_ISSUER,
    audience: ENV.JWT_AUDIENCE,
  }, (err, decoded) => {
    if (err || !decoded) {
      sendError(res, 401, "INVALID_TOKEN", "Tu sesión venció o no es válida.");
      return;
    }

    req.user = decoded as Express.Request["user"];
    next();
  });
};
