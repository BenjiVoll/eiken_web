"use strict";
import { AppDataSource } from "../config/configDb.js";
import Activity from "../entity/activity.entity.js";

export async function createActivityService({ type, description, userId }) {
  try {
    const activityRepository = AppDataSource.getRepository(Activity);
    const newActivity = activityRepository.create({
      type,
      description,
      userId,
    });
    const savedActivity = await activityRepository.save(newActivity);
    return [savedActivity, null];
  } catch (error) {
    console.error("Error al crear actividad:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getRecentActivitiesService(limit = 10) {
  try {
    const activityRepository = AppDataSource.getRepository(Activity);
    const activities = await activityRepository.find({
      order: { createdAt: "DESC" },
      take: limit,
    });
    return [activities, null];
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    return [null, "Error interno del servidor"];
  }
}
