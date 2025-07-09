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
      nullable: true,
      name: "client_id",
    },
    clientEmail: {
      type: "varchar",
      length: 255,
      nullable: true,
      name: "client_email",
    },
    clientName: {
      type: "varchar",
      length: 255,
      nullable: true,
      name: "client_name",
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
      enum: ["pending", "processing", "completed", "cancelled"],
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
    {
      name: "IDX_ORDER_CLIENT_EMAIL",
      columns: ["clientEmail"],
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

export const OrderItemSchema = new EntitySchema({
  name: "OrderItem",
  tableName: "order_items",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    orderId: {
      type: "int",
      nullable: false,
      name: "order_id",
    },
    serviceId: {
      type: "int",
      nullable: false,
      name: "service_id",
    },
    quantity: {
      type: "int",
      nullable: false,
      default: 1,
    },
    unitPrice: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      name: "unit_price",
    },
    totalPrice: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      name: "total_price",
    },
    customizations: {
      type: "text",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      nullable: false,
      name: "created_at",
    },
  },
  indices: [
    {
      name: "IDX_ORDER_ITEM_ORDER",
      columns: ["orderId"],
    },
    {
      name: "IDX_ORDER_ITEM_SERVICE",
      columns: ["serviceId"],
    },
  ],
  relations: {
    order: {
      type: "many-to-one",
      target: "Order",
      joinColumn: { name: "order_id", referencedColumnName: "id" },
      inverseSide: "items",
      nullable: false,
      onDelete: "CASCADE",
    },
    service: {
      type: "many-to-one",
      target: "Service",
      joinColumn: { name: "service_id", referencedColumnName: "id" },
      inverseSide: "orderItems",
      nullable: false,
    },
  },
});
