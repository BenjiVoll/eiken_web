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
      nullable: true,
      name: "service_id",
    },
    productId: {
      type: "int",
      nullable: true,
      name: "product_id",
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
    {
      name: "IDX_ORDER_ITEM_PRODUCT",
      columns: ["productId"],
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
      nullable: true,
    },
    product: {
      type: "many-to-one",
      target: "Product",
      joinColumn: { name: "product_id", referencedColumnName: "id" },
      nullable: true,
    },
  },
});
