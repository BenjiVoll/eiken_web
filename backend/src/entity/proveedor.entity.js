"use strict";
import { EntitySchema } from "typeorm";

export const ProveedorSchema = new EntitySchema({
  name: "Proveedor",
  tableName: "proveedores",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
      name: "id_proveedor",
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
      name: "nombre_proveedor",
    },
    contacto: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    telefono: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
  },
});