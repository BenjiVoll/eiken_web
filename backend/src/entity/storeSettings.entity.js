"use strict";
import { EntitySchema } from "typeorm";

export const StoreSettingsSchema = new EntitySchema({
    name: "StoreSettings",
    tableName: "store_settings",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: "increment",
        },
        pickupAddress: {
            type: "varchar",
            length: 255,
            nullable: false,
            default: "Calle 2 Sur 1061, Talca",
        },
        pickupCity: {
            type: "varchar",
            length: 100,
            nullable: false,
            default: "Talca, Región del Maule",
        },
        pickupHours: {
            type: "varchar",
            length: 255,
            nullable: false,
            default: "Lun-Vie 09:00 - 18:00",
        },
        whatsappNumber: {
            type: "varchar",
            length: 20,
            nullable: true,
            default: "56900000000",
            name: "whatsapp_number"
        },
        updatedAt: {
            type: "timestamp",
            updateDate: true,
            name: "updated_at"
        }
    },
});
