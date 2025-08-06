"use strict";
import { AppDataSource } from "../config/configDb.js";
import { SupplierSchema } from "../entity/supplier.entity.js";
import { InventorySchema } from "../entity/inventory.entity.js";

const supplierRepository = AppDataSource.getRepository(SupplierSchema);
const inventoryRepository = AppDataSource.getRepository(InventorySchema);

export const createSupplier = async (data) => {
  const { name, contactPerson, phone, email, address, rut, website } = data;
  
  // Verificar si ya existe un proveedor con el mismo email (si se proporciona)
  if (email) {
    const existingSupplierEmail = await supplierRepository.findOneBy({ email });
    if (existingSupplierEmail) {
      throw new Error("Ya existe un proveedor con este email");
    }
  }

  // Verificar si ya existe un proveedor con el mismo RUT (si se proporciona)
  if (rut) {
    const existingSupplierRut = await supplierRepository.findOneBy({ rut });
    if (existingSupplierRut) {
      throw new Error("Ya existe un proveedor con este RUT");
    }
  }

  const supplier = supplierRepository.create({
    name,
    contactPerson,
    phone,
    email,
    address,
    rut,
    website,
    isActive: true
  });

  await supplierRepository.save(supplier);
  return supplier;
};

export const updateSupplier = async (id, data) => {
  const supplier = await supplierRepository.findOneBy({ id });
  if (!supplier) {
    throw new Error("Proveedor no encontrado");
  }

  // Si se está actualizando el email, verificar que no exista otro proveedor con ese email
  if (data.email && data.email !== supplier.email) {
    const existingSupplier = await supplierRepository.findOneBy({ email: data.email });
    if (existingSupplier) {
      throw new Error("Ya existe un proveedor con este email");
    }
  }

  // Si se está actualizando el RUT, verificar que no exista otro proveedor con ese RUT
  if (data.rut && data.rut !== supplier.rut) {
    const existingSupplier = await supplierRepository.findOneBy({ rut: data.rut });
    if (existingSupplier) {
      throw new Error("Ya existe un proveedor con este RUT");
    }
  }

  Object.assign(supplier, data);
  await supplierRepository.save(supplier);
  return supplier;
};

export const getSuppliers = async () => {
  const suppliers = await supplierRepository.find({
    order: { name: "ASC" }
  });
  return suppliers;
};

export const getActiveSuppliers = async () => {
  const suppliers = await supplierRepository.find({
    where: { isActive: true },
    order: { name: "ASC" }
  });
  return suppliers;
};

export const getSupplierById = async (id) => {
  const supplier = await supplierRepository.findOne({
    where: { id },
    relations: ["inventoryItems"]
  });
  return supplier;
};

export const getSupplierByEmail = async (email) => {
  const supplier = await supplierRepository.findOneBy({ email, isActive: true });
  return supplier;
};

export const getSupplierByRut = async (rut) => {
  const supplier = await supplierRepository.findOneBy({ rut, isActive: true });
  return supplier;
};

export const deleteSupplier = async (id) => {
  const supplier = await supplierRepository.findOne({
    where: { id },
    relations: ["inventoryItems"]
  });
  
  if (!supplier) {
    throw new Error("Proveedor no encontrado");
  }

  // Verificar si el proveedor tiene items de inventario activos asociados usando relación
  const activeInventoryItems = supplier.inventoryItems?.filter(item => item.isActive === true) || [];
  
  // Verificación adicional: consulta directa por si la relación no funciona
  const inventoryCount = await inventoryRepository.count({
    where: { 
      supplierId: parseInt(id),
      isActive: true 
    }
  });
  
  if (activeInventoryItems.length > 0 || inventoryCount > 0) {
    const totalItems = Math.max(activeInventoryItems.length, inventoryCount);
    throw new Error(`No se puede eliminar el proveedor porque tiene ${totalItems} materiales activos asociados. Desactive o elimine primero los materiales.`);
  }

  // Hard delete - eliminar el registro
  await supplierRepository.remove(supplier);
  return { mensaje: "Proveedor eliminado exitosamente" };
};
