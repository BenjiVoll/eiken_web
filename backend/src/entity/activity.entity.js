"use strict";
import { EntitySchema } from "typeorm";

const ActivitySchema = new EntitySchema({
  name: "Activity",
  tableName: "activities",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    type: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    description: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    actionType: {
      type: "enum",
      enum: ["created", "updated", "deleted", "status_changed"],
      nullable: false,
      name: "action_type",
    },
    targetType: {
      type: "varchar",
      length: 50,
      nullable: false,
      name: "target_type",
    },
    targetId: {
      type: "int",
      nullable: false,
      name: "target_id",
    },
    details: {
      type: "json",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      nullable: false,
      name: "created_at",
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      inverseSide: "activities",
      nullable: true,
    },
  },
});

export default ActivitySchema;
