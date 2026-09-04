import { NextFunction, Request, Response } from "express";
import { sendError } from "./errorHandler";

export function validarRol(...rolesPermitidos: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      sendError(res, 401, "UNAUTHORIZED", "Tu sesión no es válida.");
      return;
    }

    const userRole = req.user.rol?.toUpperCase();
    const allowedRoles = rolesPermitidos.map((role) => role.toUpperCase());
    const hasAdminAccess = userRole === "SUPERADMIN" && allowedRoles.includes("ADMIN");

    if (!userRole || (!allowedRoles.includes(userRole) && !hasAdminAccess)) {
      sendError(res, 403, "FORBIDDEN", "No tenés permisos para realizar esta acción.");
      return;
    }

    next();
  };
}
