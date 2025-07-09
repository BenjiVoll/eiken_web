"use strict";
import { EntitySchema } from "typeorm";

export const QuoteSchema = new EntitySchema({
  name: "Quote",
  tableName: "quotes",
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
    clientName: {
      type: "varchar",
      length: 255,
      nullable: false,
      name: "client_name",
    },
    clientEmail: {
      type: "varchar",
      length: 255,
      nullable: false,
      name: "client_email",
    },
    clientPhone: {
      type: "varchar",
      length: 50,
      nullable: true,
      name: "client_phone",
    },
    company: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    serviceType: {
      type: "varchar",
      length: 100,
      nullable: false,
      name: "service_type",
    },
    description: {
      type: "text",
      nullable: false,
    },
    urgency: {
      type: "enum",
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      nullable: false,
    },
    status: {
      type: "enum",
      enum: ["pending", "approved", "rejected", "in_process", "completed"],
      default: "pending",
      nullable: false,
    },
    estimatedAmount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      name: "estimated_amount",
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
      name: "IDX_QUOTE_STATUS",
      columns: ["status"],
    },
    {
      name: "IDX_QUOTE_URGENCY",
      columns: ["urgency"],
    },
    {
      name: "IDX_QUOTE_EMAIL",
      columns: ["clientEmail"],
    },
    {
      name: "IDX_QUOTE_CREATED",
      columns: ["createdAt"],
    },
  ],
  relations: {
    client: {
      type: "many-to-one",
      target: "Client",
      joinColumn: { name: "client_id", referencedColumnName: "id" },
      inverseSide: "quotes",
      nullable: true,
    },
  },
});
