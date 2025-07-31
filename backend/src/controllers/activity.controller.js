"use strict";
import { createActivityService, getRecentActivitiesService } from "../services/activity.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export async function createActivityController(req, res) {
  try {
    const { type, description, userId } = req.body;
    const [activity, error] = await createActivityService({ type, description, userId });
    if (error) return handleErrorClient(res, 400, error);
    handleSuccess(res, 201, "Actividad registrada", activity);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getRecentActivitiesController(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [activities, error] = await getRecentActivitiesService(limit);
    if (error) return handleErrorClient(res, 400, error);
    handleSuccess(res, 200, "Actividades recientes", activities);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
