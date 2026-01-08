"use strict";
import { EntitySchema } from "typeorm";

export const ClientSchema = new EntitySchema({
  name: "Client",
  tableName: "clients",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    name: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    phone: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    company: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    rut: {
      type: "varchar",
      length: 50,
      nullable: true,
      unique: true,
    },
    clientType: {
      type: "enum",
      enum: ["individual", "company"],
      default: "individual",
      nullable: false,
      name: "client_type",
    },
    isActive: {
      type: "boolean",
      default: true,
      nullable: false,
      name: "is_active",
    },
    source: {
      type: "enum",
      enum: ["quote", "manual", "order"],
      default: "quote",
      nullable: false,
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
      name: "IDX_CLIENT_EMAIL",
      columns: ["email"],
      unique: true,
    },
    {
      name: "IDX_CLIENT_RUT",
      columns: ["rut"],
      unique: true,
    },
    {
      name: "IDX_CLIENT_TYPE",
      columns: ["clientType"],
    },
  ],
  relations: {
    projects: {
      type: "one-to-many",
      target: "Project",
      inverseSide: "client",
      cascade: true,
    },
    quotes: {
      type: "one-to-many",
      target: "Quote",
      inverseSide: "client",
      cascade: true,
    },
    orders: {
      type: "one-to-many",
      target: "Order",
      inverseSide: "client",
      cascade: true,
    },
  },
});