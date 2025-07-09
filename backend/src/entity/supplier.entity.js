"use strict";
import { EntitySchema } from "typeorm";

export const SupplierSchema = new EntitySchema({
  name: "Supplier",
  tableName: "suppliers",
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
    contactPerson: {
      type: "varchar",
      length: 255,
      nullable: true,
      name: "contact_person",
    },
    phone: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: true,
      unique: true,
    },
    address: {
      type: "text",
      nullable: true,
    },
    rut: {
      type: "varchar",
      length: 50,
      nullable: true,
      unique: true,
    },
    website: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    isActive: {
      type: "boolean",
      default: true,
      nullable: false,
      name: "is_active",
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
      name: "IDX_SUPPLIER_EMAIL",
      columns: ["email"],
      unique: true,
    },
    {
      name: "IDX_SUPPLIER_RUT",
      columns: ["rut"],
      unique: true,
    },
    {
      name: "IDX_SUPPLIER_ACTIVE",
      columns: ["isActive"],
    },
  ],
  relations: {
    inventoryItems: {
      type: "one-to-many",
      target: "Inventory",
      inverseSide: "supplier",
    },
  },
});