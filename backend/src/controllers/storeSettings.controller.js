"use strict";
import { AppDataSource } from "../config/configDb.js";
import { StoreSettingsSchema } from "../entity/storeSettings.entity.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";

const settingsRepository = AppDataSource.getRepository(StoreSettingsSchema);

export const getSettings = async (req, res) => {
    try {
        let settings = await settingsRepository.findOne({ where: { id: 1 } });

        if (!settings) {
            // Si no existe, crear registro por defecto
            settings = settingsRepository.create({
                pickupAddress: "Calle 2 Sur 1061, Talca",
                pickupCity: "Talca, Región del Maule",
                pickupHours: "Lun-Vie 09:00 - 18:00",
                whatsappNumber: "56900000000"
            });
            await settingsRepository.save(settings);
        }

        return handleSuccess(res, 200, "Configuración obtenida", settings);
    } catch (error) {
        console.error("Error al obtener config:", error);
        return handleErrorServer(res, 500, "Error al obtener la configuración de la tienda");
    }
};

export const updateSettings = async (req, res) => {
    try {
        const { pickupAddress, pickupCity, pickupHours, whatsappNumber } = req.body;

        if (!pickupAddress || !pickupCity || !pickupHours) {
            return handleErrorClient(res, 400, "Faltan datos", "Dirección, ciudad y horario son obligatorios");
        }

        let settings = await settingsRepository.findOne({ where: { id: 1 } });

        if (!settings) {
            settings = settingsRepository.create({ id: 1, ...req.body });
        } else {
            settings.pickupAddress = pickupAddress;
            settings.pickupCity = pickupCity;
            settings.pickupHours = pickupHours;
            settings.whatsappNumber = whatsappNumber || settings.whatsappNumber;
        }

        await settingsRepository.save(settings);

        return handleSuccess(res, 200, "Configuración actualizada", settings);
    } catch (error) {
        console.error("Error al actualizar config:", error);
        return handleErrorServer(res, 500, "Error al actualizar la configuración");
    }
};
