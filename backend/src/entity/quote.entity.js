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
      nullable: false,
      name: "client_id",
    },
    customServiceTitle: {
      type: "varchar",
      length: 255,
      nullable: true,
      name: "custom_service_title",
    },
    categoryId: {
      type: "int",
      nullable: true,
      name: "category_id",
    },
    description: {
      type: "text",
      nullable: false,
    },

    requestedDeliveryDate: {
      type: "date",
      nullable: true,
      name: "requested_delivery_date",
    },
    referenceImages: {
      type: "simple-array",
      nullable: true,
      name: "reference_images",
    },

    status: {
      type: "enum",
      enum: ["Pendiente", "Revisando", "En Revisión", "Cotizado", "Aprobado", "Rechazado", "Convertido"],
      nullable: false,
    },
    quotedAmount: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      name: "quoted_amount",
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

  relations: {
    client: {
      target: "Client",
      type: "many-to-one",
      joinColumn: {
        name: "client_id",
        referencedColumnName: "id",
      },
      nullable: true,
    },
    service: {
      target: "Service",
      type: "many-to-one",
      joinColumn: {
        name: "service_id",
        referencedColumnName: "id",
      },
      nullable: true,
    },
    category: {
      target: "Category",
      type: "many-to-one",
      joinColumn: {
        name: "category_id",
        referencedColumnName: "id",
      },
      nullable: true,
    },
  },

  indices: [
    {
      name: "IDX_QUOTE_STATUS",
      columns: ["status"],
    },
    {
      name: "IDX_QUOTE_CLIENT",
      columns: ["clientId"],
    },
  ],
});