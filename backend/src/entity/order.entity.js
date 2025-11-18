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
    totalAmount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      name: "total_amount",
    },
    paymentStatus: {
      type: "enum",
      enum: ["pending", "approved", "rejected", "in_process", "cancelled", "refunded"],
      default: "pending",
      nullable: false,
      name: "payment_status",
    },
    paymentMethod: {
      type: "varchar",
      length: 100,
      default: "mercadopago",
      nullable: true,
      name: "payment_method",
    },
    mercadopagoPreferenceId: {
      type: "varchar",
      length: 255,
      nullable: true,
      name: "mercadopago_preference_id",
    },
    mercadopagoPaymentId: {
      type: "varchar",
      length: 255,
      nullable: true,
      name: "mercadopago_payment_id",
    },
    orderDate: {
      type: "timestamp",
      nullable: false,
      name: "order_date",
      default: () => "CURRENT_TIMESTAMP",
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
      name: "IDX_ORDER_PAYMENT_STATUS",
      columns: ["paymentStatus"],
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
      joinColumn: { name: "client_id" },
      inverseSide: "orders",
      nullable: false,
    },
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      nullable: false,
    },
    orderStatus: {
      type: "many-to-one",
      target: "OrderStatus",
      joinColumn: { name: "order_status_id" },
      inverseSide: "orders",
      nullable: false,
    },
    orderItems: {
      type: "one-to-many",
      target: "OrderItem",
      inverseSide: "order",
      cascade: true,
    },
    mercadopagoNotifications: {
      type: "one-to-many",
      target: "MercadoPagoNotification",
      inverseSide: "order",
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
