"use strict";
import { AppDataSource } from "../config/configDb.js";
import { ProjectInventoryUsage } from "../entity/projectInventoryUsage.entity.js";
import { Project } from "../entity/proyectosServicios.entity.js";
import { Inventory } from "../entity/inventory.entity.js";

export class ProjectInventoryUsageService {
  constructor() {
    this.projectInventoryUsageRepository = AppDataSource.getRepository(ProjectInventoryUsage);
    this.projectRepository = AppDataSource.getRepository(Project);
    this.inventoryRepository = AppDataSource.getRepository(Inventory);
  }

  async findAll(filters = {}) {
    try {
      const query = this.projectInventoryUsageRepository.createQueryBuilder("usage")
        .leftJoinAndSelect("usage.project", "project")
        .leftJoinAndSelect("usage.inventoryItem", "inventoryItem")
        .leftJoinAndSelect("project.client", "client")
        .leftJoinAndSelect("inventoryItem.supplier", "supplier");

      // Aplicar filtros
      if (filters.projectId) {
        query.andWhere("usage.projectId = :projectId", { projectId: filters.projectId });
      }

      if (filters.inventoryItemId) {
        query.andWhere("usage.inventoryItemId = :inventoryItemId", { inventoryItemId: filters.inventoryItemId });
      }

      if (filters.usedDateFrom) {
        query.andWhere("usage.usedDate >= :usedDateFrom", { usedDateFrom: filters.usedDateFrom });
      }

      if (filters.usedDateTo) {
        query.andWhere("usage.usedDate <= :usedDateTo", { usedDateTo: filters.usedDateTo });
      }

      // Ordenar por fecha de uso (más reciente primero)
      query.orderBy("usage.usedDate", "DESC");

      return await query.getMany();
    } catch (error) {
      throw new Error(`Error al obtener usos de materiales: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const usage = await this.projectInventoryUsageRepository.findOne({
        where: { id },
        relations: [
          "project",
          "project.client",
          "inventoryItem",
          "inventoryItem.supplier"
        ]
      });

      if (!usage) {
        throw new Error("Uso de material no encontrado");
      }

      return usage;
    } catch (error) {
      throw new Error(`Error al obtener uso de material: ${error.message}`);
    }
  }

  async create(usageData) {
    try {
      // Validar que el proyecto exista
      const project = await this.projectRepository.findOne({
        where: { id: usageData.projectId, isActive: true }
      });

      if (!project) {
        throw new Error("Proyecto no encontrado o inactivo");
      }

      // Validar que el item de inventario exista
      const inventoryItem = await this.inventoryRepository.findOne({
        where: { id: usageData.inventoryItemId, isActive: true }
      });

      if (!inventoryItem) {
        throw new Error("Item de inventario no encontrado o inactivo");
      }

      // Validar que hay suficiente stock
      if (inventoryItem.currentStock < usageData.quantityUsed) {
        throw new Error(`Stock insuficiente. Stock actual: ${inventoryItem.currentStock}, Cantidad solicitada: ${usageData.quantityUsed}`);
      }

      // Crear el registro de uso de material
      const usage = this.projectInventoryUsageRepository.create({
        ...usageData,
        usedDate: usageData.usedDate || new Date(),
        totalCost: usageData.quantityUsed * inventoryItem.unitCost
      });

      const savedUsage = await this.projectInventoryUsageRepository.save(usage);

      // Actualizar el stock del inventario
      inventoryItem.currentStock -= usageData.quantityUsed;
      await this.inventoryRepository.save(inventoryItem);

      return await this.findById(savedUsage.id);
    } catch (error) {
      throw new Error(`Error al crear uso de material: ${error.message}`);
    }
  }

  async update(id, updateData) {
    try {
      const usage = await this.findById(id);
      const inventoryItem = await this.inventoryRepository.findOne({
        where: { id: usage.inventoryItemId }
      });

      // Si se está cambiando la cantidad usada, ajustar el stock
      if (updateData.quantityUsed && updateData.quantityUsed !== usage.quantityUsed) {
        const difference = updateData.quantityUsed - usage.quantityUsed;
        
        // Validar que hay suficiente stock para el aumento
        if (difference > 0 && inventoryItem.currentStock < difference) {
          throw new Error(`Stock insuficiente para el aumento. Stock actual: ${inventoryItem.currentStock}, Aumento solicitado: ${difference}`);
        }

        // Ajustar el stock
        inventoryItem.currentStock -= difference;
        await this.inventoryRepository.save(inventoryItem);
        
        // Recalcular el costo total
        updateData.totalCost = updateData.quantityUsed * inventoryItem.unitCost;
      }

      await this.projectInventoryUsageRepository.update(id, updateData);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error al actualizar uso de material: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const usage = await this.findById(id);
      const inventoryItem = await this.inventoryRepository.findOne({
        where: { id: usage.inventoryItemId }
      });

      // Devolver el stock al inventario
      inventoryItem.currentStock += usage.quantityUsed;
      await this.inventoryRepository.save(inventoryItem);

      await this.projectInventoryUsageRepository.delete(id);
      return { message: "Uso de material eliminado exitosamente" };
    } catch (error) {
      throw new Error(`Error al eliminar uso de material: ${error.message}`);
    }
  }

  async getUsageByProject(projectId) {
    try {
      const usages = await this.projectInventoryUsageRepository.find({
        where: { projectId },
        relations: [
          "inventoryItem",
          "inventoryItem.supplier"
        ],
        order: { usedDate: "DESC" }
      });

      // Calcular estadísticas del proyecto
      const totalCost = usages.reduce((sum, usage) => sum + usage.totalCost, 0);
      const totalItems = usages.length;

      return {
        usages,
        statistics: {
          totalCost,
          totalItems,
          mostUsedItems: this.getMostUsedItems(usages)
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener usos de material por proyecto: ${error.message}`);
    }
  }

  async getUsageByInventoryItem(inventoryItemId) {
    try {
      const usages = await this.projectInventoryUsageRepository.find({
        where: { inventoryItemId },
        relations: [
          "project",
          "project.client"
        ],
        order: { usedDate: "DESC" }
      });

      const totalQuantityUsed = usages.reduce((sum, usage) => sum + usage.quantityUsed, 0);
      const totalCost = usages.reduce((sum, usage) => sum + usage.totalCost, 0);

      return {
        usages,
        statistics: {
          totalQuantityUsed,
          totalCost,
          projectsCount: new Set(usages.map(u => u.projectId)).size
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener usos de material por item: ${error.message}`);
    }
  }

  getMostUsedItems(usages) {
    const itemsMap = {};
    
    usages.forEach(usage => {
      const itemId = usage.inventoryItemId;
      if (!itemsMap[itemId]) {
        itemsMap[itemId] = {
          item: usage.inventoryItem,
          totalQuantity: 0,
          totalCost: 0
        };
      }
      itemsMap[itemId].totalQuantity += usage.quantityUsed;
      itemsMap[itemId].totalCost += usage.totalCost;
    });

    return Object.values(itemsMap)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5); // Top 5 items más usados
  }
}
