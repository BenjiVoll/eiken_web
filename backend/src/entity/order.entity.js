"use strict";
import { EntitySchema } from "typeorm";

export const OrderSchema = new EntitySchema({
  name: "Order",
  tableName: "orders",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    clientId: {
      type: "int",
      nullable: false,
      name: "client_id",
    },
    totalAmount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      name: "total_amount",
    },
    status: {
      type: "enum",
      enum: ["pending", "processing", "completed", "cancelled", "refunded"],
      default: "pending",
      nullable: false,
    },
    orderDate: {
      type: "timestamp",
      nullable: false,
      name: "order_date",
      default: () => "CURRENT_TIMESTAMP",
    },
    notes: {
      type: "text",
      nullable: true,
    },
    paymentId: {
      type: "varchar",
      length: 100,
      nullable: true,
      name: "payment_id",
    },
    lastProcessedPaymentId: {
      type: "varchar",
      length: 100,
      nullable: true,
      name: "last_processed_payment_id",
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      nullable: false,
      name: "created_at",
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
      nullable: false,
      name: "updated_at",
    },
  },
  indices: [
    {
      name: "IDX_ORDER_STATUS",
      columns: ["status"],
    },
    {
      name: "IDX_ORDER_DATE",
      columns: ["orderDate"],
    },
  ],
  relations: {
    client: {
      type: "many-to-one",
      target: "Client",
      joinColumn: { name: "client_id", referencedColumnName: "id" },
      inverseSide: "orders",
      nullable: true,
    },
    items: {
      type: "one-to-many",
      target: "OrderItem",
      inverseSide: "order",
      cascade: true,
    },
  },
});

