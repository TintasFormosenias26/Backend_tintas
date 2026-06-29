import { Router } from "express";

export const progressRouter = Router();
import { saveBookProgress } from "../controllers/bookSaveProgress.controllers";
import { updateProgresBook } from "../controllers/updateProgress.controllers";
import { deleteProgresBook } from "../controllers/deleteProgress.controllers";
import { validateJWT } from "../../../shared/middlewares/validateJWT";
import { findByProgressIdControllers, findProgressByBook } from "../controllers/findProgress";


progressRouter.post('/SaveProgress', validateJWT, saveBookProgress)
progressRouter.get('/', validateJWT, findByProgressIdControllers)
progressRouter.get("/Book/id", validateJWT, findProgressByBook)
progressRouter.put('/', validateJWT, updateProgresBook)
progressRouter.delete('/', validateJWT, deleteProgresBook)

