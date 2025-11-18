"use strict";
import { AppDataSource } from "../config/configDb.js";
import { OrderStatusSchema } from "../entity/orderStatus.entity.js";

const orderStatusRepository = AppDataSource.getRepository(OrderStatusSchema);

export const getOrderStatuses = async () => {
  return await orderStatusRepository.find({
    order: { id: "ASC" }
  });
};

export const getOrderStatusById = async (id) => {
  const status = await orderStatusRepository.findOneBy({ id });
  if (!status) {
    throw new Error("Estado de orden no encontrado");
  }
  return status;
};

export const getOrderStatusByName = async (name) => {
  const status = await orderStatusRepository.findOneBy({ name });
  if (!status) {
    throw new Error(`Estado de orden '${name}' no encontrado`);
  }
  return status;
};

export const createOrderStatus = async (data) => {
  const { name, description, colorCode } = data;
  
  const existingStatus = await orderStatusRepository.findOneBy({ name });
  if (existingStatus) {
    throw new Error("Ya existe un estado con este nombre");
  }

  const status = orderStatusRepository.create({
    name,
    description,
    colorCode
  });

  await orderStatusRepository.save(status);
  return status;
};

export const updateOrderStatus = async (id, data) => {
  const status = await orderStatusRepository.findOneBy({ id });
  if (!status) {
    throw new Error("Estado de orden no encontrado");
  }

  if (data.name && data.name !== status.name) {
    const existingStatus = await orderStatusRepository.findOneBy({ name: data.name });
    if (existingStatus) {
      throw new Error("Ya existe un estado con este nombre");
    }
  }

  Object.assign(status, data);
  await orderStatusRepository.save(status);
  return status;
};

export const deleteOrderStatus = async (id) => {
  const status = await orderStatusRepository.findOneBy({ id });
  if (!status) {
    throw new Error("Estado de orden no encontrado");
  }

  await orderStatusRepository.remove(status);
  return { message: "Estado eliminado correctamente" };
};
