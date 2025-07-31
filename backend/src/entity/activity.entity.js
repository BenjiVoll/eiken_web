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
    userId: {
      type: "int",
      nullable: true,
    },
    quoteId: {
      type: "int",
      nullable: true,
      name: "quote_id",
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      nullable: false,
      name: "created_at",
    },
  },
});

export default ActivitySchema;
