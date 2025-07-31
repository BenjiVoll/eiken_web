"use strict";
import { AppDataSource } from "../config/configDb.js";
import Activity from "../entity/activity.entity.js";

export async function createActivityService({ type, description, userId, quoteId }) {
  try {
    const activityRepository = AppDataSource.getRepository(Activity);
    const newActivity = activityRepository.create({
      type,
      description,
      userId,
      quoteId,
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
    const quoteRepository = AppDataSource.getRepository("Quote");
    const activities = await activityRepository.find({
      order: { createdAt: "DESC" },
      take: limit,
    });
    // Enriquecer actividades de cotización con nombre de servicio usando quoteId
    const enrichedActivities = await Promise.all(activities.map(async act => {
      if ((act.type === "cotización" || act.type === "quote") && act.quoteId) {
        const quote = await quoteRepository.findOne({ where: { id: act.quoteId }, relations: ["service"] });
        return {
          ...act,
          service: quote?.service ? { name: quote.service.name } : null,
          customServiceTitle: quote?.customServiceTitle || null,
        };
      }
      return act;
    }));
    return [enrichedActivities, null];
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    return [null, "Error interno del servidor"];
  }
}
