import { AppDataSource } from "../config/configDb.js";
import { InventorySchema } from "../entity/inventory.entity.js";
import { mailService } from "./mail.service.js";

/**
 * Obtener todos los items con stock bajo o crítico
 */
export const getLowStockItems = async () => {
  try {
    const inventoryRepository = AppDataSource.getRepository(InventorySchema);

    const lowStockItems = await inventoryRepository
      .createQueryBuilder("inventory")
      .where("inventory.quantity <= inventory.minStock")
      .orderBy("inventory.quantity", "ASC")
      .getMany();

    return lowStockItems;
  } catch (error) {
    console.error("Error al obtener items con stock bajo:", error);
    throw new Error("Error al consultar stock bajo");
  }
};

/**
 * Verificar stock bajo y enviar alerta por email si es necesario
 */
export const checkAndAlertLowStock = async () => {
  try {
    const lowStockItems = await getLowStockItems();

    if (lowStockItems.length === 0) {
      console.log('✅ No hay materiales con stock bajo');
      return {
        success: true,
        itemCount: 0,
        message: 'No hay materiales con stock bajo',
        emailSent: false
      };
    }

    console.log(`⚠️ Se encontraron ${lowStockItems.length} material(es) con stock bajo`);

    // Enviar email de alerta
    const emailResult = await mailService.sendLowStockAlert(lowStockItems);

    return {
      success: true,
      itemCount: lowStockItems.length,
      items: lowStockItems,
      emailSent: emailResult.success,
      message: `Se encontraron ${lowStockItems.length} materiales con stock bajo. Email ${emailResult.success ? 'enviado' : 'no enviado'}.`
    };
  } catch (error) {
    console.error("Error en verificación de stock bajo:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtener conteo de items con stock bajo (para dashboard)
 */
export const getLowStockCount = async () => {
  try {
    const inventoryRepository = AppDataSource.getRepository(InventorySchema);

    const count = await inventoryRepository
      .createQueryBuilder("inventory")
      .where("inventory.quantity <= inventory.minStock")
      .getCount();

    return count;
  } catch (error) {
    console.error("Error al contar items con stock bajo:", error);
    throw new Error("Error al contar stock bajo");
  }
};
