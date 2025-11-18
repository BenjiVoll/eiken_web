"use strict";
import { AppDataSource } from "../config/configDb.js";
import { ActivitySchema } from "../entity/activity.entity.js";
import UserSchema from "../entity/user.entity.js";
import { QuoteSchema } from "../entity/quote.entity.js";
import { ProjectSchema } from "../entity/project.entity.js";
import { OrderSchema } from "../entity/order.entity.js";

const activityRepository = AppDataSource.getRepository(ActivitySchema);
const userRepository = AppDataSource.getRepository(UserSchema);
const quoteRepository = AppDataSource.getRepository(QuoteSchema);
const projectRepository = AppDataSource.getRepository(ProjectSchema);
const orderRepository = AppDataSource.getRepository(OrderSchema);

/**
 * Crear una nueva actividad
 * @param {Object} data - { type, description, userId, targetType, targetId }
 * targetType puede ser: "quote", "project", "order", "user", "service", etc.
 */
export const createActivity = async (data) => {
  const { type, description, userId, targetType, targetId } = data;

  // Validar que el usuario existe
  const user = await userRepository.findOneBy({ id: userId });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Validar que el target existe según el targetType
  if (targetType && targetId) {
    const targetExists = await validateTargetExists(targetType, targetId);
    if (!targetExists) {
      throw new Error(`${targetType} con ID ${targetId} no encontrado`);
    }
  }

  const activity = activityRepository.create({
    type,
    description,
    user,
    targetType,
    targetId
  });

  await activityRepository.save(activity);
  return activity;
};

/**
 * Validar que el target existe según su tipo
 */
const validateTargetExists = async (targetType, targetId) => {
  let repository;
  
  switch (targetType.toLowerCase()) {
    case "quote":
    case "cotización":
      repository = quoteRepository;
      break;
    case "project":
    case "proyecto":
      repository = projectRepository;
      break;
    case "order":
    case "orden":
      repository = orderRepository;
      break;
    case "user":
    case "usuario":
      repository = userRepository;
      break;
    default:
      return true; // Para otros tipos, asumimos que existen
  }

  const entity = await repository.findOneBy({ id: targetId });
  return !!entity;
};

/**
 * Obtener actividades recientes con información enriquecida
 */
export const getRecentActivities = async (limit = 10) => {
  const activities = await activityRepository.find({
    relations: ["user"],
    order: { createdAt: "DESC" },
    take: limit
  });

  // Enriquecer con información del target
  const enrichedActivities = await Promise.all(
    activities.map(async (activity) => {
      const enriched = { ...activity };

      if (activity.targetType && activity.targetId) {
        const targetInfo = await getTargetInfo(activity.targetType, activity.targetId);
        enriched.targetInfo = targetInfo;
      }

      return enriched;
    })
  );

  return enrichedActivities;
};

/**
 * Obtener información del target según su tipo
 */
const getTargetInfo = async (targetType, targetId) => {
  try {
    switch (targetType.toLowerCase()) {
      case "quote":
      case "cotización": {
        const quote = await quoteRepository.findOne({
          where: { id: targetId },
          relations: ["client", "quoteStatus"]
        });
        return quote ? {
          id: quote.id,
          type: "quote",
          clientName: quote.client?.name,
          status: quote.quoteStatus?.name,
          totalAmount: quote.totalAmount
        } : null;
      }

      case "project":
      case "proyecto": {
        const project = await projectRepository.findOne({
          where: { id: targetId },
          relations: ["quote", "quote.client", "projectStatus"]
        });
        return project ? {
          id: project.id,
          type: "project",
          name: project.name,
          clientName: project.quote?.client?.name,
          status: project.projectStatus?.name
        } : null;
      }

      case "order":
      case "orden": {
        const order = await orderRepository.findOne({
          where: { id: targetId },
          relations: ["client", "orderStatus"]
        });
        return order ? {
          id: order.id,
          type: "order",
          clientName: order.client?.name,
          status: order.orderStatus?.name,
          totalAmount: order.totalAmount
        } : null;
      }

      case "user":
      case "usuario": {
        const user = await userRepository.findOneBy({ id: targetId });
        return user ? {
          id: user.id,
          type: "user",
          name: user.name,
          email: user.email
        } : null;
      }

      default:
        return { id: targetId, type: targetType };
    }
  } catch (error) {
    console.error(`Error al obtener info del target ${targetType}:${targetId}`, error);
    return null;
  }
};

/**
 * Obtener actividades por usuario
 */
export const getActivitiesByUser = async (userId, limit = 50) => {
  const activities = await activityRepository.find({
    where: { user: { id: userId } },
    relations: ["user"],
    order: { createdAt: "DESC" },
    take: limit
  });

  return activities;
};

/**
 * Obtener actividades por target
 */
export const getActivitiesByTarget = async (targetType, targetId) => {
  const activities = await activityRepository.find({
    where: { targetType, targetId },
    relations: ["user"],
    order: { createdAt: "DESC" }
  });

  return activities;
};

/**
 * Obtener actividades por tipo
 */
export const getActivitiesByType = async (type, limit = 50) => {
  const activities = await activityRepository.find({
    where: { type },
    relations: ["user"],
    order: { createdAt: "DESC" },
    take: limit
  });

  return activities;
};

/**
 * Eliminar una actividad
 */
export const deleteActivity = async (id) => {
  const activity = await activityRepository.findOneBy({ id });
  
  if (!activity) {
    throw new Error("Actividad no encontrada");
  }

  await activityRepository.remove(activity);
  return { mensaje: "Actividad eliminada exitosamente" };
};
