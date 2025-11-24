"use strict";
import { AppDataSource } from "../config/configDb.js";
import { InventorySchema } from "../entity/inventory.entity.js";
import { SupplierSchema } from "../entity/supplier.entity.js";

const inventoryRepository = AppDataSource.getRepository(InventorySchema);
const supplierRepository = AppDataSource.getRepository(SupplierSchema);

export const createInventoryItem = async (data) => {
  const { name, type, color, quantity, unit, width, brand, model, minStock, unitCost, supplierId } = data;

  // Si se proporciona supplierId, verificar que el proveedor existe
  if (supplierId) {
    const supplier = await supplierRepository.findOneBy({ id: supplierId });
    if (!supplier) {
      throw new Error("Proveedor no encontrado");
    }
  }

  const item = inventoryRepository.create({
    name,
    type,
    color,
    quantity: quantity || 0,
    unit: unit || "metros",
    width,
    brand,
    model,
    minStock: minStock || 5,
    unitCost,
    supplierId,
    isActive: true
  });

  await inventoryRepository.save(item);
  return item;
};

export const updateInventoryItem = async (id, data) => {
  const item = await inventoryRepository.findOneBy({ id });
  if (!item) {
    throw new Error("Item de inventario no encontrado");
  }

  // Si se está cambiando el proveedor, verificar que existe
  if (data.supplierId && data.supplierId !== item.supplierId) {
    const supplier = await supplierRepository.findOneBy({ id: data.supplierId });
    if (!supplier) {
      throw new Error("Proveedor no encontrado");
    }
  }

  Object.assign(item, data);
  await inventoryRepository.save(item);
  return item;
};

export const getInventoryItems = async () => {
  const items = await inventoryRepository.find({
    where: { isActive: true },
    relations: ["supplier"],
    order: { name: "ASC" }
  });
  return items;
};

export const getInventoryItemById = async (id) => {
  const item = await inventoryRepository.findOne({
    where: { id, isActive: true },
    relations: ["supplier", "movements", "projectUsages"]
  });
  return item;
};

export const getInventoryByType = async (type) => {
  const items = await inventoryRepository.find({
    where: { type, isActive: true },
    relations: ["supplier"],
    order: { name: "ASC" }
  });
  return items;
};

export const getLowStockItems = async () => {
  const items = await inventoryRepository
    .createQueryBuilder("inventory")
    .leftJoinAndSelect("inventory.supplier", "supplier")
    .where("inventory.isActive = :isActive", { isActive: true })
    .andWhere("inventory.quantity <= inventory.minStock")
    .orderBy("inventory.quantity", "ASC")
    .getMany();
  return items;
};

export const getInventoryBySupplier = async (supplierId) => {
  const items = await inventoryRepository.find({
    where: { supplierId, isActive: true },
    relations: ["supplier"],
    order: { name: "ASC" }
  });
  return items;
};

export const updateInventoryQuantity = async (id, quantity) => {
  const item = await inventoryRepository.findOneBy({ id });
  if (!item) {
    throw new Error("Item de inventario no encontrado");
  }

  if (quantity < 0) {
    throw new Error("La cantidad no puede ser negativa");
  }

  item.quantity = quantity;
  await inventoryRepository.save(item);
  return item;
};

export const adjustInventoryQuantity = async (id, adjustment) => {
  const item = await inventoryRepository.findOneBy({ id });
  if (!item) {
    throw new Error("Item de inventario no encontrado");
  }

  const newQuantity = item.quantity + adjustment;
  if (newQuantity < 0) {
    throw new Error("No hay suficiente inventario disponible");
  }

  item.quantity = newQuantity;
  await inventoryRepository.save(item);
  return item;
};

export const deleteInventoryItem = async (id) => {
  const item = await inventoryRepository.findOneBy({ id });
  if (!item) {
    throw new Error("Item de inventario no encontrado");
  }

  // Verificar movimientos en el último año
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const movementsCount = await AppDataSource.getRepository("InventoryMovement")
    .createQueryBuilder("movement")
    .where("movement.inventoryId = :id", { id })
    .andWhere("movement.createdAt >= :oneYearAgo", { oneYearAgo })
    .getCount();

  if (movementsCount > 0) {
    throw new Error("No se puede eliminar el material porque tiene movimientos registrados en el último año");
  }

  // Hard delete - eliminar el registro de la base de datos
  await inventoryRepository.remove(item);
  return { mensaje: "Item de inventario eliminado exitosamente" };
};
