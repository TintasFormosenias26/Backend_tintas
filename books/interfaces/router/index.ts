import { Router } from "express";
import crudRouter from "./crud.routes";
import authorsRouter from "./authors.routes";

const bookRouter = Router();

bookRouter.use(crudRouter);
bookRouter.use(authorsRouter);

export default bookRouter;