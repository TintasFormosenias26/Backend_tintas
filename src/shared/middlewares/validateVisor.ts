import { Request, Response, NextFunction } from "express";
import { sendError } from "./errorHandler";

export const validateVisor = (req: Request, res: Response, next: NextFunction): void => {
	const { isvisor } = req.headers;

	if (isvisor !== "true") {
		sendError(res, 403, "FORBIDDEN", "No tenés permisos para realizar esta acción.");
		return
	}
	next();
}
