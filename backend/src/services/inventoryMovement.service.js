"use strict";
import { AppDataSource } from "../config/configDb.js";
import { InventoryMovementSchema } from "../entity/inventoryMovement.entity.js";
import { InventorySchema } from "../entity/inventory.entity.js";
import { UserSchema } from "../entity/user.entity.js";

const movementRepository = AppDataSource.getRepository(InventoryMovementSchema);
const inventoryRepository = AppDataSource.getRepository(InventorySchema);
const userRepository = AppDataSource.getRepository(UserSchema);

export const createInventoryMovement = async (data) => {
  const { inventoryId, movementType, quantity, reason, referenceId, referenceType, createdById, notes } = data;
  
  // Verificar que el item de inventario existe
  const inventoryItem = await inventoryRepository.findOneBy({ id: inventoryId });
  if (!inventoryItem) {
    throw new Error("Item de inventario no encontrado");
  }

  // Verificar que el usuario existe
  const user = await userRepository.findOneBy({ id: createdById });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Validar cantidad según tipo de movimiento
  if (movementType === "salida" && inventoryItem.quantity < quantity) {
    throw new Error("No hay suficiente inventario disponible");
  }

  // Crear el movimiento
  const movement = movementRepository.create({
    inventoryId,
    movementType,
    quantity,
    reason,
    referenceId,
    referenceType,
    createdById,
    notes
  });

  await movementRepository.save(movement);

  // Actualizar la cantidad del inventario
  switch (movementType) {
    case "entrada":
      inventoryItem.quantity += quantity;
      break;
    case "salida":
      inventoryItem.quantity -= quantity;
      break;
    case "ajuste":
      inventoryItem.quantity = quantity; // En ajuste, la cantidad es el valor final
      break;
    case "transferencia":
      // Para transferencia, manejar lógica específica si es necesario
      break;
  }

  await inventoryRepository.save(inventoryItem);

  return movement;
};

export const updateInventoryMovement = async (id, data) => {
  const movement = await movementRepository.findOneBy({ id });
  if (!movement) {
    throw new Error("Movimiento de inventario no encontrado");
  }

  // No permitir cambiar inventoryId, movementType o cantidad una vez creado
  const { inventoryId, movementType, quantity, ...allowedUpdates } = data;

  Object.assign(movement, allowedUpdates);
  await movementRepository.save(movement);
  return movement;
};

export const getInventoryMovements = async () => {
  const movements = await movementRepository.find({
    relations: ["inventory", "createdBy"],
    order: { createdAt: "DESC" }
  });
  return movements;
};

export const getInventoryMovementById = async (id) => {
  const movement = await movementRepository.findOne({
    where: { id },
    relations: ["inventory", "createdBy"]
  });
  return movement;
};

export const getMovementsByInventory = async (inventoryId) => {
  const movements = await movementRepository.find({
    where: { inventoryId },
    relations: ["inventory", "createdBy"],
    order: { createdAt: "DESC" }
  });
  return movements;
};

export const getMovementsByType = async (movementType) => {
  const validTypes = ["entrada", "salida", "ajuste", "transferencia"];
  if (!validTypes.includes(movementType)) {
    throw new Error("Tipo de movimiento no válido");
  }

  const movements = await movementRepository.find({
    where: { movementType },
    relations: ["inventory", "createdBy"],
    order: { createdAt: "DESC" }
  });
  return movements;
};

export const getMovementsByUser = async (userId) => {
  const movements = await movementRepository.find({
    where: { createdById: userId },
    relations: ["inventory", "createdBy"],
    order: { createdAt: "DESC" }
  });
  return movements;
};

export const getMovementsByDateRange = async (startDate, endDate) => {
  if (!startDate || !endDate) {
    throw new Error("Se requieren fechas de inicio y fin");
  }

  const movements = await movementRepository
    .createQueryBuilder("movement")
    .leftJoinAndSelect("movement.inventory", "inventory")
    .leftJoinAndSelect("movement.createdBy", "createdBy")
    .where("movement.createdAt >= :startDate", { startDate })
    .andWhere("movement.createdAt <= :endDate", { endDate })
    .orderBy("movement.createdAt", "DESC")
    .getMany();

  return movements;
};

export const deleteInventoryMovement = async (id) => {
  const movement = await movementRepository.findOne({
    where: { id },
    relations: ["inventory"]
  });
  
  if (!movement) {
    throw new Error("Movimiento de inventario no encontrado");
  }

  // Revertir el movimiento en el inventario
  const inventoryItem = movement.inventory;
  switch (movement.movementType) {
    case "entrada":
      inventoryItem.quantity -= movement.quantity;
      break;
    case "salida":
      inventoryItem.quantity += movement.quantity;
      break;
    case "ajuste":
      throw new Error("No se puede eliminar un movimiento de ajuste");
    case "transferencia":
      // Manejar lógica de transferencia si es necesario
      break;
  }

  if (inventoryItem.quantity < 0) {
    throw new Error("No se puede eliminar el movimiento porque resultaría en inventario negativo");
  }

  await inventoryRepository.save(inventoryItem);
  await movementRepository.remove(movement);
  
  return { mensaje: "Movimiento de inventario eliminado exitosamente" };
};
