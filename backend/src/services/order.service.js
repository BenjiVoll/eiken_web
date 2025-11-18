"use strict";
import { AppDataSource } from "../config/configDb.js";
import { OrderSchema } from "../entity/order.entity.js";
import { OrderItemSchema } from "../entity/orderItem.entity.js";
import { OrderStatusSchema } from "../entity/orderStatus.entity.js";
import { ClientSchema } from "../entity/user.entity.client.js";
import { ProductSchema } from "../entity/product.entity.js";
import UserSchema from "../entity/user.entity.js";

const orderRepository = AppDataSource.getRepository(OrderSchema);
const orderItemRepository = AppDataSource.getRepository(OrderItemSchema);
const orderStatusRepository = AppDataSource.getRepository(OrderStatusSchema);
const clientRepository = AppDataSource.getRepository(ClientSchema);
const productRepository = AppDataSource.getRepository(ProductSchema);
const userRepository = AppDataSource.getRepository(UserSchema);

export const createOrder = async (data) => {
  const { clientId, userId, items } = data;
  
  // Verificar que el cliente existe
  const client = await clientRepository.findOneBy({ id: clientId });
  if (!client) {
    throw new Error("Cliente no encontrado");
  }

  // Verificar que el usuario existe
  const user = await userRepository.findOneBy({ id: userId });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Obtener el estado inicial
  const pendingStatus = await orderStatusRepository.findOneBy({ name: "Pendiente de Pago" });
  if (!pendingStatus) {
    throw new Error("Estado 'Pendiente de Pago' no encontrado. Asegúrate de que los estados estén inicializados.");
  }

  // Validar y calcular total de los items
  let totalAmount = 0;
  const validatedItems = [];

  for (const item of items) {
    const product = await productRepository.findOneBy({ id: item.productId });
    if (!product) {
      throw new Error(`Producto con ID ${item.productId} no encontrado`);
    }

    if (product.quantityOnHand < item.quantity) {
      throw new Error(`Stock insuficiente para el producto ${product.name}`);
    }

    const quantity = item.quantity;
    const unitPrice = product.price;
    const subtotal = quantity * unitPrice;

    validatedItems.push({
      product,
      quantity,
      unitPrice,
      subtotal
    });

    totalAmount += subtotal;
  }

  // Crear la orden
  const order = orderRepository.create({
    client,
    user,
    orderStatus: pendingStatus,
    totalAmount,
    paymentStatus: "pending",
    orderDate: new Date()
  });

  await orderRepository.save(order);

  // Crear los items de la orden
  for (const itemData of validatedItems) {
    const orderItem = orderItemRepository.create({
      order,
      product: itemData.product,
      quantity: itemData.quantity,
      unitPrice: itemData.unitPrice,
      subtotal: itemData.subtotal
    });
    await orderItemRepository.save(orderItem);
  }

  // Recargar la orden con sus relaciones
  const completeOrder = await orderRepository.findOne({
    where: { id: order.id },
    relations: ["orderItems", "orderItems.product", "client", "user", "orderStatus"]
  });

  return completeOrder;
};

export const updateOrder = async (id, data) => {
  const order = await orderRepository.findOne({
    where: { id },
    relations: ["client", "user", "orderStatus"]
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  // Actualizar el estado si se proporciona
  if (data.statusId) {
    const newStatus = await orderStatusRepository.findOneBy({ id: data.statusId });
    if (!newStatus) {
      throw new Error("Estado no encontrado");
    }
    order.orderStatus = newStatus;
  }

  // Actualizar el cliente si se proporciona
  if (data.clientId) {
    const newClient = await clientRepository.findOneBy({ id: data.clientId });
    if (!newClient) {
      throw new Error("Cliente no encontrado");
    }
    order.client = newClient;
  }

  // Actualizar el usuario si se proporciona
  if (data.userId) {
    const newUser = await userRepository.findOneBy({ id: data.userId });
    if (!newUser) {
      throw new Error("Usuario no encontrado");
    }
    order.user = newUser;
  }

  // Actualizar campos directos
  if (data.paymentStatus) {
    order.paymentStatus = data.paymentStatus;
  }
  
  if (data.mercadopagoPaymentId) {
    order.mercadopagoPaymentId = data.mercadopagoPaymentId;
  }
  
  if (data.mercadopagoPreferenceId) {
    order.mercadopagoPreferenceId = data.mercadopagoPreferenceId;
  }
  
  if (data.mercadopagoStatus) {
    order.mercadopagoStatus = data.mercadopagoStatus;
  }

  await orderRepository.save(order);

  // Recargar con todas las relaciones
  const updatedOrder = await orderRepository.findOne({
    where: { id },
    relations: ["orderItems", "orderItems.product", "client", "user", "orderStatus"]
  });

  return updatedOrder;
};

export const getOrders = async () => {
  const orders = await orderRepository.find({
    relations: ["orderItems", "orderItems.product", "client", "user", "orderStatus"],
    order: { orderDate: "DESC" }
  });
  return orders;
};

export const getOrderById = async (id) => {
  const order = await orderRepository.findOne({
    where: { id },
    relations: ["orderItems", "orderItems.product", "client", "user", "orderStatus"]
  });
  return order;
};

export const getOrdersByStatus = async (statusId) => {
  const status = await orderStatusRepository.findOneBy({ id: statusId });
  if (!status) {
    throw new Error("Estado no encontrado");
  }

  const orders = await orderRepository.find({
    where: { orderStatus: { id: statusId } },
    relations: ["orderItems", "orderItems.product", "client", "user", "orderStatus"],
    order: { orderDate: "DESC" }
  });
  return orders;
};

export const getOrdersByClient = async (clientId) => {
  const orders = await orderRepository.find({
    where: { client: { id: clientId } },
    relations: ["orderItems", "orderItems.product", "client", "user", "orderStatus"],
    order: { orderDate: "DESC" }
  });
  return orders;
};

export const addOrderItem = async (orderId, itemData) => {
  const order = await orderRepository.findOne({
    where: { id: orderId },
    relations: ["orderItems", "orderItems.product"]
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  const product = await productRepository.findOneBy({ id: itemData.productId });
  if (!product) {
    throw new Error("Producto no encontrado");
  }

  if (product.quantityOnHand < itemData.quantity) {
    throw new Error(`Stock insuficiente para el producto ${product.name}`);
  }

  const quantity = itemData.quantity;
  const unitPrice = product.price;
  const subtotal = quantity * unitPrice;

  const orderItem = orderItemRepository.create({
    order,
    product,
    quantity,
    unitPrice,
    subtotal
  });

  await orderItemRepository.save(orderItem);

  // Actualizar el total de la orden
  order.totalAmount += subtotal;
  await orderRepository.save(order);

  return orderItem;
};

export const removeOrderItem = async (orderId, itemId) => {
  const orderItem = await orderItemRepository.findOne({
    where: { id: itemId, order: { id: orderId } },
    relations: ["order", "product"]
  });

  if (!orderItem) {
    throw new Error("Item de orden no encontrado");
  }

  const subtotal = orderItem.subtotal;

  // Actualizar el total de la orden
  const order = orderItem.order;
  order.totalAmount -= subtotal;
  await orderRepository.save(order);

  // Eliminar el item
  await orderItemRepository.remove(orderItem);

  return { mensaje: "Item removido de la orden exitosamente" };
};

export const updateOrderStatus = async (id, statusId) => {
  const order = await orderRepository.findOne({
    where: { id },
    relations: ["orderStatus"]
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  const newStatus = await orderStatusRepository.findOneBy({ id: statusId });
  if (!newStatus) {
    throw new Error("Estado no encontrado");
  }

  order.orderStatus = newStatus;
  await orderRepository.save(order);

  // Recargar con todas las relaciones
  const updatedOrder = await orderRepository.findOne({
    where: { id },
    relations: ["orderItems", "orderItems.product", "client", "user", "orderStatus"]
  });

  return updatedOrder;
};

export const deleteOrder = async (id) => {
  const order = await orderRepository.findOne({
    where: { id },
    relations: ["orderItems"]
  });
  
  if (!order) {
    throw new Error("Orden no encontrada");
  }

  // Los items se eliminan automáticamente por CASCADE
  await orderRepository.remove(order);
  return { mensaje: "Orden eliminada exitosamente" };
};

// Funciones para integración con MercadoPago
export const updatePaymentStatus = async (orderId, paymentData) => {
  const order = await orderRepository.findOne({
    where: { id: orderId },
    relations: ["orderItems", "orderItems.product", "orderStatus"]
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  // Actualizar campos de MercadoPago
  order.mercadopagoPaymentId = paymentData.paymentId;
  order.mercadopagoStatus = paymentData.status;
  order.paymentStatus = paymentData.paymentStatus;

  await orderRepository.save(order);

  // Si el pago fue aprobado, descontar stock y cambiar estado a "En Preparación"
  if (paymentData.paymentStatus === "approved") {
    // Descontar stock de los productos
    for (const item of order.orderItems) {
      const product = item.product;
      product.quantityOnHand -= item.quantity;
      
      if (product.quantityOnHand < 0) {
        throw new Error(`Stock insuficiente para el producto ${product.name}`);
      }
      
      await productRepository.save(product);
    }

    // Cambiar estado a "En Preparación"
    const preparingStatus = await orderStatusRepository.findOneBy({ name: "En Preparación" });
    if (preparingStatus) {
      order.orderStatus = preparingStatus;
      await orderRepository.save(order);
    }
  }

  // Recargar con todas las relaciones
  const updatedOrder = await orderRepository.findOne({
    where: { id: orderId },
    relations: ["orderItems", "orderItems.product", "client", "user", "orderStatus"]
  });

  return updatedOrder;
};

export const getOrderByMercadoPagoPaymentId = async (paymentId) => {
  const order = await orderRepository.findOne({
    where: { mercadopagoPaymentId: paymentId },
    relations: ["orderItems", "orderItems.product", "client", "user", "orderStatus"]
  });
  return order;
};

export const cancelOrderAndRestoreStock = async (orderId) => {
  const order = await orderRepository.findOne({
    where: { id: orderId },
    relations: ["orderItems", "orderItems.product", "orderStatus"]
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  // Restaurar stock si ya se había descontado (pago fue aprobado)
  if (order.paymentStatus === "approved") {
    for (const item of order.orderItems) {
      const product = item.product;
      product.quantityOnHand += item.quantity;
      await productRepository.save(product);
    }
  }

  // Cambiar estado a "Cancelado"
  const cancelledStatus = await orderStatusRepository.findOneBy({ name: "Cancelado" });
  if (cancelledStatus) {
    order.orderStatus = cancelledStatus;
  }

  order.paymentStatus = "cancelled";
  await orderRepository.save(order);

  // Recargar con todas las relaciones
  const updatedOrder = await orderRepository.findOne({
    where: { id: orderId },
    relations: ["orderItems", "orderItems.product", "client", "user", "orderStatus"]
  });

  return updatedOrder;
};
