import express from "express";
import { renderPanel, handleDbAction } from "../controllers/system.controller.js";

const router = express.Router();

router.get("/db-panel", renderPanel);
router.post("/db-panel", handleDbAction);

export default router;
