"use strict";
import { EntitySchema } from "typeorm";

export const CategoriaProductoSchema = new EntitySchema({
  name: "CategoriaProducto",
  tableName: "categorias_producto",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
      name: "id_categoria",
    },
    nombre: {
      type: "varchar",
      length: 100,
      nullable: false,
      unique: true,
      name: "nombre_categoria",
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
  },
});