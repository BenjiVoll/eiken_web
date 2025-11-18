"use strict";
import { AppDataSource } from "../config/configDb.js";
import { MercadoPagoNotificationSchema } from "../entity/mercadopagoNotification.entity.js";

const notificationRepository = AppDataSource.getRepository(MercadoPagoNotificationSchema);

/**
 * Crear una nueva notificación de webhook de MercadoPago
 */
export const createNotification = async (data) => {
  const { topic, resourceId, payload } = data;

  const notification = notificationRepository.create({
    topic,
    resourceId,
    payload,
    processingStatus: "pending",
    receivedAt: new Date()
  });

  await notificationRepository.save(notification);
  return notification;
};

/**
 * Actualizar el estado de procesamiento de una notificación
 */
export const updateNotificationStatus = async (id, status, errorMessage = null) => {
  const notification = await notificationRepository.findOneBy({ id });
  
  if (!notification) {
    throw new Error("Notificación no encontrada");
  }

  notification.processingStatus = status;
  notification.processedAt = new Date();
  
  if (errorMessage) {
    notification.errorMessage = errorMessage;
  }

  await notificationRepository.save(notification);
  return notification;
};

/**
 * Obtener notificación por ID
 */
export const getNotificationById = async (id) => {
  const notification = await notificationRepository.findOneBy({ id });
  return notification;
};

/**
 * Obtener todas las notificaciones
 */
export const getNotifications = async (limit = 100) => {
  const notifications = await notificationRepository.find({
    order: { receivedAt: "DESC" },
    take: limit
  });
  return notifications;
};

/**
 * Obtener notificaciones por estado de procesamiento
 */
export const getNotificationsByStatus = async (status) => {
  const notifications = await notificationRepository.find({
    where: { processingStatus: status },
    order: { receivedAt: "DESC" }
  });
  return notifications;
};

/**
 * Obtener notificaciones por resourceId (payment_id de MercadoPago)
 */
export const getNotificationsByResourceId = async (resourceId) => {
  const notifications = await notificationRepository.find({
    where: { resourceId },
    order: { receivedAt: "DESC" }
  });
  return notifications;
};

/**
 * Obtener notificaciones pendientes para reprocesar
 */
export const getPendingNotifications = async () => {
  const notifications = await notificationRepository.find({
    where: { processingStatus: "pending" },
    order: { receivedAt: "ASC" }
  });
  return notifications;
};

/**
 * Obtener notificaciones con error para revisar
 */
export const getFailedNotifications = async () => {
  const notifications = await notificationRepository.find({
    where: { processingStatus: "error" },
    order: { receivedAt: "DESC" }
  });
  return notifications;
};

/**
 * Eliminar notificaciones antiguas (para limpieza)
 */
export const deleteOldNotifications = async (daysOld = 90) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await notificationRepository
    .createQueryBuilder()
    .delete()
    .where("receivedAt < :cutoffDate", { cutoffDate })
    .andWhere("processingStatus = :status", { status: "processed" })
    .execute();

  return { mensaje: `${result.affected} notificaciones antiguas eliminadas` };
};
