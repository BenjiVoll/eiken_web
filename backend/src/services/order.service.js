"use strict";
import { AppDataSource } from "../config/configDb.js";
import { OrderSchema, OrderItemSchema } from "../entity/order.entity.js";
import { ClientSchema } from "../entity/user.entity.client.js";
import { ServiceSchema } from "../entity/service.entity.js";
import { ProductSchema } from "../entity/product.entity.js";
import { InventorySchema } from "../entity/inventory.entity.js";
import { getProductMaterials } from "./productMaterial.service.js";
import { checkAndAlertLowStock } from "./alert.service.js";

const orderRepository = AppDataSource.getRepository(OrderSchema);
const orderItemRepository = AppDataSource.getRepository(OrderItemSchema);
const clientRepository = AppDataSource.getRepository(ClientSchema);
const serviceRepository = AppDataSource.getRepository(ServiceSchema);
const productRepository = AppDataSource.getRepository(ProductSchema);
const inventoryRepository = AppDataSource.getRepository(InventorySchema);

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
    let unitPrice;
    let itemData = {
      quantity: item.quantity || 1,
      customizations: item.customizations
    };

    // Verificar si es un servicio o un producto
    if (item.serviceId) {
      const service = await serviceRepository.findOneBy({ id: item.serviceId });
      if (!service) {
        throw new Error(`Servicio con ID ${item.serviceId} no encontrado`);
      }
      unitPrice = item.unitPrice || service.price;
      itemData.serviceId = item.serviceId;
    } else if (item.productId) {
      const product = await productRepository.findOneBy({ id: item.productId });
      if (!product) {
        throw new Error(`Producto con ID ${item.productId} no encontrado`);
      }
      if (product.stock < itemData.quantity) {
        throw new Error(`Stock insuficiente para el producto ${product.name}`);
      }
      unitPrice = item.unitPrice || product.price;
      itemData.productId = item.productId;
    } else {
      throw new Error("Cada item debe tener serviceId o productId");
    }

    const totalPrice = itemData.quantity * unitPrice;
    itemData.unitPrice = unitPrice;
    itemData.totalPrice = totalPrice;

    validatedItems.push(itemData);
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
    relations: ["items", "items.service", "items.product", "client"]
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

export const getOrdersByEmail = async (email) => {
  const orders = await orderRepository.find({
    where: { clientEmail: email },
    relations: ["items", "items.service", "items.product"],
    order: { orderDate: "DESC" }
  });
  return orders;
};

export const updateOrderStatus = async (id, newStatus) => {
  const validStatuses = ["pending", "processing", "completed", "cancelled"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Estado de orden no válido");
  }

  const order = await orderRepository.findOne({
    where: { id },
    relations: ["items", "items.product"]
  });

  if (!order) {
    throw new Error("Orden no encontrada");
  }

  const oldStatus = order.status;

  // Si la orden pasa a "completed" y venía de otro estado, descontar stock
  if (newStatus === "completed" && oldStatus !== "completed") {
    for (const orderItem of order.items) {
      if (orderItem.productId) {
        const product = await productRepository.findOneBy({ id: orderItem.productId });
        if (!product) {
          throw new Error(`Producto con ID ${orderItem.productId} no encontrado`);
        }

        // Verificar stock disponible
        if (product.stock < orderItem.quantity) {
          throw new Error(`Stock insuficiente para el producto ${product.name}. Disponible: ${product.stock}, Requerido: ${orderItem.quantity}`);
        }

        // Descontar stock del producto
        product.stock -= orderItem.quantity;
        await productRepository.save(product);

        console.log(`📦 Product stock descontado: ${product.name} -${orderItem.quantity}`);

        // NUEVO: Descontar materiales del inventario automáticamente
        const materials = await getProductMaterials(orderItem.productId);

        if (materials && materials.length > 0) {
          console.log(`🔧 Descontando ${materials.length} materiales para ${product.name}...`);

          for (const material of materials) {
            const inventoryItem = await inventoryRepository.findOneBy({
              id: material.inventoryId
            });

            if (!inventoryItem) {
              console.warn(`⚠️ Material de inventario ${material.inventoryId} no encontrado`);
              continue;
            }

            // Calcular cantidad total necesaria
            const totalNeeded = material.quantityNeeded * orderItem.quantity;

            // Validar stock suficiente
            if (inventoryItem.quantity < totalNeeded) {
              throw new Error(
                `Stock insuficiente de ${inventoryItem.name}. ` +
                `Disponible: ${inventoryItem.quantity} ${inventoryItem.unit}, ` +
                `Necesario: ${totalNeeded} ${inventoryItem.unit}`
              );
            }

            // Descontar del inventario
            inventoryItem.quantity -= totalNeeded;
            await inventoryRepository.save(inventoryItem);

            console.log(
              `  ✅ ${inventoryItem.name}: ` +
              `-${totalNeeded} ${inventoryItem.unit} ` +
              `(quedan ${inventoryItem.quantity} ${inventoryItem.unit})`
            );

            // Verificar si llegó al stock mínimo y enviar alerta
            if (inventoryItem.quantity <= inventoryItem.minStock) {
              console.log(`⚠️ Stock bajo detectado para ${inventoryItem.name}`);
              try {
                await checkAndAlertLowStock();
              } catch (alertError) {
                console.error("Error enviando alerta de stock bajo:", alertError);
                // No lanzar error, solo log
              }
            }
          }
        } else {
          console.log(`ℹ️ Producto ${product.name} no tiene materiales asociados`);
        }
      }
    }
  }

  // Si la orden se cancela y estaba completada, restaurar stock
  if (newStatus === "cancelled" && oldStatus === "completed") {
    for (const orderItem of order.items) {
      if (orderItem.productId) {
        const product = await productRepository.findOneBy({ id: orderItem.productId });
        if (product) {
          // Restaurar stock
          product.stock += orderItem.quantity;
          await productRepository.save(product);
        }
      }
    }
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
