"use strict";
import { EntitySchema } from "typeorm";

export const QuoteStatusSchema = new EntitySchema({
  name: "QuoteStatus",
  tableName: "quote_statuses",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    name: {
      type: "varchar",
      length: 100,
      unique: true,
      nullable: false,
    },
    description: {
      type: "text",
      nullable: true,
    },
    colorCode: {
      type: "varchar",
      length: 50,
      nullable: true,
      name: "color_code",
    },
    isEditable: {
      type: "boolean",
      default: true,
      nullable: false,
      name: "is_editable",
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
  relations: {
    quotes: {
      type: "one-to-many",
      target: "Quote",
      inverseSide: "quoteStatus",
    },
  },
});

export default QuoteStatusSchema;
