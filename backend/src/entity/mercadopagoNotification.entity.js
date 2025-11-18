"use strict";
import { EntitySchema } from "typeorm";

export const MercadoPagoNotificationSchema = new EntitySchema({
  name: "MercadoPagoNotification",
  tableName: "mercadopago_notifications",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    topic: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    resourceId: {
      type: "varchar",
      length: 255,
      nullable: false,
      name: "resource_id",
    },
    payload: {
      type: "json",
      nullable: false,
    },
    processingStatus: {
      type: "enum",
      enum: ["received", "processed", "error"],
      default: "received",
      nullable: false,
      name: "processing_status",
    },
    receivedAt: {
      type: "timestamp",
      createDate: true,
      nullable: false,
      name: "received_at",
    },
  },
  relations: {
    order: {
      type: "many-to-one",
      target: "Order",
      joinColumn: { name: "order_id" },
      inverseSide: "mercadopagoNotifications",
      nullable: true,
    },
  },
});

export default MercadoPagoNotificationSchema;
