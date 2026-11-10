import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import safetyRouter from "./safety";
import adminRouter from "./admin";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(safetyRouter);
router.use(adminRouter);
router.use(storageRouter);

export default router;
