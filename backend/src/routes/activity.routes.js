"use strict";
import { Router } from "express";
import { createActivityController, getRecentActivitiesController } from "../controllers/activity.controller.js";

const router = Router();

router.post("/", createActivityController);
router.get("/", getRecentActivitiesController);

export default router;
