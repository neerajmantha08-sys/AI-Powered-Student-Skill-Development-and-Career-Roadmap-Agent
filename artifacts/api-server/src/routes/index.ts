import { Router, type IRouter } from "express";
import healthRouter from "./health";
import careerRoadmapRouter from "./career-roadmap";

const router: IRouter = Router();

router.use(healthRouter);
router.use(careerRoadmapRouter);

export default router;
