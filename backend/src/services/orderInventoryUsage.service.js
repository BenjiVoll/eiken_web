import { AppDataSource } from "../config/configDb.js";
import { OrderInventoryUsageSchema } from "../entity/orderInventoryUsage.entity.js";
import { OrderSchema } from "../entity/order.entity.js";
import { InventorySchema } from "../entity/inventory.entity.js";
import { createActivityService } from "./activity.service.js";
import { checkAndAlertLowStock } from "./alert.service.js";

// Registrar materiales usados en una orden
export const registerMaterialsUsage = async (orderId, materials, userId) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // Verificar que la orden existe
        const orderRepository = queryRunner.manager.getRepository(OrderSchema);
        const order = await orderRepository.findOne({
            where: { id: orderId },
            relations: ['client']
        });

        if (!order) {
            throw new Error("Orden no encontrada");
        }

        if (order.status !== "completed") {
            throw new Error("Solo puedes registrar materiales en órdenes completadas");
        }

        const usageRepository = queryRunner.manager.getRepository(OrderInventoryUsageSchema);
        const inventoryRepository = queryRunner.manager.getRepository(InventorySchema);
        const registeredMaterials = [];
        const lowStockItems = [];

        // Procesar cada material
        for (const material of materials) {
            const { inventoryId, quantityUsed, notes } = material;

            // Verificar stock disponible
            const inventory = await inventoryRepository.findOne({
                where: { id: inventoryId }
            });

            if (!inventory) {
                throw new Error(`Material con ID ${inventoryId} no encontrado`);
            }

            if (inventory.quantity < quantityUsed) {
                throw new Error(
                    `Stock insuficiente de "${inventory.name}". Disponible: ${inventory.quantity} ${inventory.unit}, solicitado: ${quantityUsed} ${inventory.unit}`
                );
            }

            // Verificar si ya existe un registro para este material en esta orden
            const existing = await usageRepository.findOne({
                where: { orderId, inventoryId }
            });

            if (existing) {
                throw new Error(
                    `El material "${inventory.name}" ya fue registrado para esta orden. Edita el registro existente.`
                );
            }

            // Crear registro de uso
            const usage = usageRepository.create({
                orderId,
                inventoryId,
                quantityUsed,
                notes: notes || null,
                registeredBy: userId,
            });

            await usageRepository.save(usage);

            // Descontar del inventario
            inventory.quantity = parseFloat(inventory.quantity) - parseFloat(quantityUsed);
            await inventoryRepository.save(inventory);

            // Verificar si llegó a stock mínimo
            if (inventory.quantity <= inventory.minStock) {
                lowStockItems.push(inventory);
            }

            registeredMaterials.push({
                ...usage,
                inventory: {
                    name: inventory.name,
                    unit: inventory.unit
                }
            });
        }

        await queryRunner.commitTransaction();

        // Registrar actividad
        const materialsSummary = registeredMaterials
            .map(m => `${m.quantityUsed} ${m.inventory.unit} de ${m.inventory.name}`)
            .join(", ");

        await createActivityService({
            type: "inventario",
            description: `Materiales registrados para orden #${orderId}: ${materialsSummary}`,
            userId: userId,
        });

        // Disparar alertas si hay materiales con stock bajo
        let alertSent = false;
        if (lowStockItems.length > 0) {
            const alertResult = await checkAndAlertLowStock();
            alertSent = alertResult.emailSent || false;
        }

        return {
            success: true,
            registered: registeredMaterials.length,
            materials: registeredMaterials,
            alertSent,
            lowStockCount: lowStockItems.length,
        };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error al registrar materiales:", error);
        throw error;
    } finally {
        await queryRunner.release();
    }
};

// Obtener materiales usados en una orden
export const getMaterialsUsedByOrder = async (orderId) => {
    try {
        const usageRepository = AppDataSource.getRepository(OrderInventoryUsageSchema);

        const materials = await usageRepository.find({
            where: { orderId },
            relations: ["inventory", "user"],
            order: { createdAt: "DESC" }
        });

        return materials.map(m => ({
            id: m.id,
            quantityUsed: m.quantityUsed,
            notes: m.notes,
            createdAt: m.createdAt,
            inventory: {
                id: m.inventory.id,
                name: m.inventory.name,
                type: m.inventory.type,
                unit: m.inventory.unit,
                currentStock: m.inventory.quantity
            },
            registeredBy: m.user ? {
                id: m.user.id,
                name: m.user.name
            } : null
        }));
    } catch (error) {
        console.error("Error al obtener materiales de orden:", error);
        throw new Error("Error al consultar materiales usados");
    }
};

// Eliminar registro de material usado (restaura inventario)
export const deleteMaterialUsage = async (usageId, userId) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const usageRepository = queryRunner.manager.getRepository(OrderInventoryUsageSchema);
        const inventoryRepository = queryRunner.manager.getRepository(InventorySchema);

        // Obtener el registro
        const usage = await usageRepository.findOne({
            where: { id: usageId },
            relations: ["inventory", "order"]
        });

        if (!usage) {
            throw new Error("Registro no encontrado");
        }

        // Restaurar inventario
        const inventory = await inventoryRepository.findOne({
            where: { id: usage.inventoryId }
        });

        if (inventory) {
            inventory.quantity = parseFloat(inventory.quantity) + parseFloat(usage.quantityUsed);
            await inventoryRepository.save(inventory);
        }

        // Eliminar registro
        await usageRepository.remove(usage);

        await queryRunner.commitTransaction();

        // Registrar actividad
        await createActivityService({
            type: "inventario",
            description: `Material restaurado: ${usage.quantityUsed} ${inventory.unit} de ${inventory.name} (Orden #${usage.orderId})`,
            userId: userId,
        });

        return {
            success: true,
            message: "Material eliminado y stock restaurado",
        };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error al eliminar uso de material:", error);
        throw error;
    } finally {
        await queryRunner.release();
    }
};
