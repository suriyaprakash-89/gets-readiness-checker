import { Router } from "express";
import { getReportById } from "../controllers/reportController.js";

const router = Router();

router.get("/:id", getReportById);

export default router;
