"use strict";
import { EntitySchema } from "typeorm";

const UserSchema = new EntitySchema({
  name: "User",
  tableName: "users",
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
    passwordHash: {
      type: "varchar",
      length: 255,
      nullable: false,
      name: "password_hash",
    },
    role: {
      type: "enum",
      enum: ["admin", "manager", "designer", "operator"],
      default: "operator",
      nullable: false,
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
      name: "IDX_USER_EMAIL",
      columns: ["email"],
      unique: true,
    },
    {
      name: "IDX_USER_ROLE",
      columns: ["role"],
    },
  ],
  relations: {
    inventoryMovements: {
      type: "one-to-many",
      target: "InventoryMovement",
      inverseSide: "createdBy",
    },
  },
});

export default UserSchema;