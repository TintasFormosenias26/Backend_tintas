import { Router } from "express";
import crudRouter from "./crud.routes";

const bookRouter = Router();

bookRouter.use(crudRouter);

export default bookRouter;