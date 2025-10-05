import { Router } from "express";
import { handleAnalysis } from "../controllers/analyzeController.js";

const router = Router();

router.post("/", handleAnalysis);

export default router;
