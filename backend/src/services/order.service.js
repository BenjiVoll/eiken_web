"use strict";
import { AppDataSource } from "../config/configDb.js";
import { OrderSchema, OrderItemSchema } from "../entity/order.entity.js";
import { ClientSchema } from "../entity/user.entity.cliente.js";
import { ServiceSchema } from "../entity/service.entity.js";

const orderRepository = AppDataSource.getRepository(OrderSchema);
const orderItemRepository = AppDataSource.getRepository(OrderItemSchema);
const clientRepository = AppDataSource.getRepository(ClientSchema);
const serviceRepository = AppDataSource.getRepository(ServiceSchema);

export const createOrder = async (data) => {
  const { clientId, clientEmail, clientName, items, notes } = data;
  
  // Si se proporciona clientId, verificar que el cliente existe
  if (clientId) {
    const client = await clientRepository.findOneBy({ id: clientId });
    if (!client) {
      throw new Error("Cliente no encontrado");
    }
  }

  // Validar y calcular total de los items
  let totalAmount = 0;
  const validatedItems = [];

  for (const item of items) {
    const service = await serviceRepository.findOneBy({ id: item.serviceId });
    if (!service) {
      throw new Error(`Servicio con ID ${item.serviceId} no encontrado`);
    }

    const quantity = item.quantity || 1;
    const unitPrice = item.unitPrice || service.price;
    const totalPrice = quantity * unitPrice;

    validatedItems.push({
      serviceId: item.serviceId,
      quantity,
      unitPrice,
      totalPrice,
      customizations: item.customizations
    });

    totalAmount += totalPrice;
  }

  // Crear la orden
  const order = orderRepository.create({
    clientId,
    clientEmail,
    clientName,
    totalAmount,
    status: "pending",
    orderDate: new Date(),
    notes
  });

  await orderRepository.save(order);

  // Crear los items de la orden
  for (const itemData of validatedItems) {
    const orderItem = orderItemRepository.create({
      orderId: order.id,
      ...itemData
    });
    await orderItemRepository.save(orderItem);
  }

  // Recargar la orden con sus items
  const completeOrder = await orderRepository.findOne({
    where: { id: order.id },
    relations: ["items", "client"]
  });

  return completeOrder;
};

export const updateOrder = async (id, data) => {
  const order = await orderRepository.findOneBy({ id });
  if (!order) {
    throw new Error("Orden no encontrada");
  }

  // Si se está cambiando el cliente, verificar que existe
  if (data.clientId && data.clientId !== order.clientId) {
    const client = await clientRepository.findOneBy({ id: data.clientId });
    if (!client) {
      throw new Error("Cliente no encontrado");
    }
  }

  Object.assign(order, data);
  await orderRepository.save(order);
  return order;
};

export const getOrders = async () => {
  const orders = await orderRepository.find({
    relations: ["items", "client"],
    order: { orderDate: "DESC" }
  });
  return orders;
};

export const getOrderById = async (id) => {
  const order = await orderRepository.findOne({
    where: { id },
    relations: ["items", "items.service", "client"]
  });
  return order;
};

export const getOrdersByStatus = async (status) => {
  const validStatuses = ["pending", "processing", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new Error("Estado de orden no válido");
  }

  const orders = await orderRepository.find({
    where: { status },
    relations: ["items", "client"],
    order: { orderDate: "DESC" }
  });
  return orders;
};

export const getOrdersByClient = async (clientId) => {
  const orders = await orderRepository.find({
    where: { clientId },
    relations: ["items", "client"],
    order: { orderDate: "DESC" }
  });
  return orders;
};

export const addOrderItem = async (orderId, itemData) => {
  const order = await orderRepository.findOneBy({ id: orderId });
  if (!order) {
    throw new Error("Orden no encontrada");
  }

  const service = await serviceRepository.findOneBy({ id: itemData.serviceId });
  if (!service) {
    throw new Error("Servicio no encontrado");
  }

  const quantity = itemData.quantity || 1;
  const unitPrice = itemData.unitPrice || service.price;
  const totalPrice = quantity * unitPrice;

  const orderItem = orderItemRepository.create({
    orderId,
    serviceId: itemData.serviceId,
    quantity,
    unitPrice,
    totalPrice,
    customizations: itemData.customizations
  });

  await orderItemRepository.save(orderItem);

  // Actualizar el total de la orden
  order.totalAmount += totalPrice;
  await orderRepository.save(order);

  return orderItem;
};

export const removeOrderItem = async (orderId, itemId) => {
  const orderItem = await orderItemRepository.findOneBy({ id: itemId, orderId });
  if (!orderItem) {
    throw new Error("Item de orden no encontrado");
  }

  const order = await orderRepository.findOneBy({ id: orderId });
  if (!order) {
    throw new Error("Orden no encontrada");
  }

  // Actualizar el total de la orden
  order.totalAmount -= orderItem.totalPrice;
  await orderRepository.save(order);

  // Eliminar el item
  await orderItemRepository.remove(orderItem);

  return { mensaje: "Item removido de la orden exitosamente" };
};

export const updateOrderStatus = async (id, newStatus) => {
  const validStatuses = ["pending", "processing", "completed", "cancelled"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Estado de orden no válido");
  }

  const order = await orderRepository.findOneBy({ id });
  if (!order) {
    throw new Error("Orden no encontrada");
  }

  order.status = newStatus;
  await orderRepository.save(order);
  return order;
};

export const deleteOrder = async (id) => {
  const order = await orderRepository.findOne({
    where: { id },
    relations: ["items"]
  });
  
  if (!order) {
    throw new Error("Orden no encontrada");
  }

  // Los items se eliminan automáticamente por CASCADE
  await orderRepository.remove(order);
  return { mensaje: "Orden eliminada exitosamente" };
};
