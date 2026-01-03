"use strict";
import { AppDataSource } from "../config/configDb.js";
import { handleSuccess, handleErrorServer } from "../handlers/responseHandlers.js";

export const getDashboardData = async (req, res) => {
    try {
        // 1. Resumen Ejecutivo
        // Total Ventas (suma de proyectos completados o facturados? Usaremos budgetAmount de proyectos completados)
        const salesResult = await AppDataSource.query(`
      SELECT SUM(budget_amount) as total 
      FROM projects 
      WHERE status = 'Completado'
    `);
        const totalSales = parseFloat(salesResult[0]?.total || 0);

        // Proyectos Activos
        const activeProjectsCount = await AppDataSource.getRepository("Project").count({
            where: [
                { status: "En Proceso" },
                { status: "Aprobado" },
                { status: "Pendiente" }
            ]
        });

        // Cotizaciones Pendientes
        const pendingQuotesCount = await AppDataSource.getRepository("Quote").count({
            where: { status: "Pendiente" }
        });

        // Items con bajo stock
        const lowStockCount = await AppDataSource.getRepository("Inventory")
            .createQueryBuilder("inventory")
            .where("inventory.isActive = :isActive", { isActive: true })
            .andWhere("inventory.quantity <= inventory.minStock")
            .getCount();

        // 2. Actividad Reciente (últimas 5 actividades)
        const recentActivity = await AppDataSource.getRepository("Activity").find({
            take: 5,
            order: { createdAt: "DESC" },
            relations: ["user"]
        });

        // 3. Métricas Claves (ej. Proyectos por estado)
        const projectsByStatus = await AppDataSource.query(`
      SELECT status, COUNT(*) as count 
      FROM projects 
      GROUP BY status
    `);

        const data = {
            summary: {
                totalSales,
                activeProjects: activeProjectsCount,
                pendingQuotes: pendingQuotesCount,
                lowStockItems: lowStockCount
            },
            recentActivity,
            metrics: {
                projectsByStatus
            }
        };

        handleSuccess(res, 200, "Datos del dashboard obtenidos exitosamente", data);
    } catch (error) {
        handleErrorServer(res, 500, error.message);
    }
};
