"use strict";
import { AppDataSource } from "../config/configDb.js";
import { OrderSchema } from "../entity/order.entity.js";
import { OrderItemSchema } from "../entity/orderItem.entity.js";
import { ClientSchema } from "../entity/user.entity.client.js";
import { ServiceSchema } from "../entity/service.entity.js";
import { ProductSchema } from "../entity/product.entity.js";
import { InventorySchema } from "../entity/inventory.entity.js";
import { getProductMaterials } from "./productMaterial.service.js";
import { checkAndAlertLowStock } from "./alert.service.js";
import { mailService } from "./mail.service.js";

const orderRepository = AppDataSource.getRepository(OrderSchema);
const orderItemRepository = AppDataSource.getRepository(OrderItemSchema);
const clientRepository = AppDataSource.getRepository(ClientSchema);
const serviceRepository = AppDataSource.getRepository(ServiceSchema);
const productRepository = AppDataSource.getRepository(ProductSchema);
const inventoryRepository = AppDataSource.getRepository(InventorySchema);

export const createOrder = async (data) => {
  const { clientId, clientEmail, clientName, items, notes } = data;

  // Si no se proporciona clientId, buscar o crear cliente (Guest Checkout)
  if (!clientId) {
    if (!clientEmail) {
      throw new Error("El email del cliente es obligatorio para compras sin cuenta");
    }

    // Buscar cliente existente por email
    let client = await clientRepository.findOneBy({ email: clientEmail });

    if (!client) {
      // Crear nuevo cliente si no existe
      console.log(`Creating new client for guest checkout: ${clientEmail}`);
      client = clientRepository.create({
        name: clientName || "Cliente Invitado",
        email: clientEmail,
        clientType: "individual",
        isActive: true,
        // Asumiendo que rut, phone, company pueden venir en data o ser null
        phone: data.clientPhone || null,
        company: data.company || null,
        rut: data.rut || null,
        address: data.address || null
      });
      await clientRepository.save(client);
    }

    // Asignar el ID del cliente encontrado o creado
    data.clientId = client.id;
  } else {
    // Si se proporciona clientId, verificar que existe
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

    // Verificar validación de solo productos
    if (item.serviceId) {
      throw new Error("No se pueden incluir Servicios en una Orden de Compra. Por favor utilice el flujo de Cotizaciones.");
    }

    if (item.productId) {
      const product = await productRepository.findOneBy({ id: item.productId });
      if (!product) {
        throw new Error(`Producto con ID ${item.productId} no encontrado`);
      }

      if (product.stock < itemData.quantity) {
        throw new Error(`Stock insuficiente para el producto ${product.name}`);
      }
      const materials = await getProductMaterials(item.productId);
      if (materials && materials.length > 0) {
        console.log(`🔍 Validando ${materials.length} materiales para ${product.name}...`);

        for (const material of materials) {
          const inventoryItem = await inventoryRepository.findOneBy({
            id: material.inventoryId
          });

          if (!inventoryItem) {
            throw new Error(
              `Material de inventario "${material.inventoryId}" no encontrado para producto ${product.name}`
            );
          }

          const totalNeeded = material.quantityNeeded * itemData.quantity;

          if (inventoryItem.quantity < totalNeeded) {
            throw new Error(
              `Stock insuficiente de material "${inventoryItem.name}". ` +
              `Disponible: ${inventoryItem.quantity} ${inventoryItem.unit}, ` +
              `Necesario: ${totalNeeded} ${inventoryItem.unit} ` +
              `(para ${itemData.quantity} unidad(es) de ${product.name})`
            );
          }

          console.log(
            `  ✅ ${inventoryItem.name}: ${inventoryItem.quantity} ${inventoryItem.unit} disponible, ` +
            `${totalNeeded} ${inventoryItem.unit} necesario`
          );
        }
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

  // Crear la orden (normalizada)
  const order = orderRepository.create({
    clientId: data.clientId,
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
    relations: ["items", "items.product", "client"]
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

        // Descontar materiales del inventario automáticamente
        const materials = await getProductMaterials(orderItem.productId);

        if (materials && materials.length > 0) {
          console.log(`🔧 Descontando ${materials.length} materiales para ${product.name}...`);

          const { createInventoryMovement } = await import("./inventoryMovement.service.js");

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

            await createInventoryMovement({
              inventoryId: material.inventoryId,
              movementType: "salida",
              quantity: totalNeeded,
              reason: "Venta Automática",
              referenceId: order.id,
              referenceType: "order",
              createdById: null,
              notes: `Descuento automático por Orden #${order.id} (Producto: ${product.name}) - Procesado por sistema vía webhook de pago`
            });

            console.log(
              `  ✅ ${inventoryItem.name}: ` +
              `-${totalNeeded} ${inventoryItem.unit} ` +
              `(Trazabilidad registrada)`
            );

            // Verificar si llegó al stock mínimo y enviar alerta
            if (inventoryItem.quantity <= inventoryItem.minStock) {
              console.log(`⚠️ Stock bajo detectado para ${inventoryItem.name}`);
              try {
                await checkAndAlertLowStock();
              } catch (alertError) {
                console.error("Error enviando alerta de stock bajo:", alertError);
              }
            }
          }
        }
        else {
          console.log(`ℹ️ Producto ${product.name} no tiene materiales asociados`);
        }
      }
    }
  }

  // Si la orden se cancela y estaba completada, restaurar stock
  if (newStatus === "cancelled" && oldStatus === "completed") {
    const { createInventoryMovement } = await import("./inventoryMovement.service.js");

    for (const orderItem of order.items) {
      if (orderItem.productId) {
        const product = await productRepository.findOneBy({ id: orderItem.productId });
        if (product) {
          product.stock += orderItem.quantity;
          await productRepository.save(product);

          const materials = await getProductMaterials(orderItem.productId);
          for (const material of materials) {
            const totalToRestore = material.quantityNeeded * orderItem.quantity;

            await createInventoryMovement({
              inventoryId: material.inventoryId,
              movementType: "entrada",
              quantity: totalToRestore,
              reason: "Cancelación de Orden",
              referenceId: order.id,
              referenceType: "order",
              createdById: null,
              notes: `Restauración por cancelación de Orden #${order.id} - Procesado por sistema`
            });
            console.log(`⏪ Material restaurado: ${material.inventoryId} +${totalToRestore}`);
          }
        }
      }
    }
  }

  order.status = newStatus;
  await orderRepository.save(order);

  // Enviar correos si la orden se completó
  if (newStatus === "completed" && oldStatus !== "completed") {
    // Enviar confirmación al cliente
    await mailService.sendOrderCompletedEmail(order);

    // Enviar alerta al administrador
    await mailService.sendNewOrderAlert(order);
  }

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
  await orderRepository.remove(order);
  return { mensaje: "Orden eliminada exitosamente" };
};
