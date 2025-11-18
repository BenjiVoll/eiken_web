"use strict";
import { EntitySchema } from "typeorm";

export const QuoteItemSchema = new EntitySchema({
  name: "QuoteItem",
  tableName: "quote_items",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    description: {
      type: "varchar",
      length: 500,
      nullable: true,
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
    subtotal: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      nullable: false,
      name: "created_at",
    },
  },
  relations: {
    quote: {
      type: "many-to-one",
      target: "Quote",
      joinColumn: { name: "quote_id" },
      inverseSide: "quoteItems",
      nullable: false,
    },
    service: {
      type: "many-to-one",
      target: "Service",
      joinColumn: { name: "service_id" },
      inverseSide: "quoteItems",
      nullable: false,
    },
  },
});

export default QuoteItemSchema;
