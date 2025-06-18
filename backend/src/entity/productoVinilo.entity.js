"use strict";
import { EntitySchema } from "typeorm";

const ProductoViniloSchema = new EntitySchema({
  name: "ProductoVinilo",
  tableName: "productos_vinilo",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      // "Vinilo Metalizado de Poliéster - Dorado"
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    tipoVinilo: {
      // "Metalizado de Poliéster", "Avery T-7500", "Fluor Series"
      type: "varchar",
      length: 100,
      nullable: false,
    },
    color: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    cantidadDisponible: {
      type: "int",
      nullable: false,
      default: 0,
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
    activo: {
      type: "boolean",
      default: true,
      nullable: false,
    },
    fechaCreacion: {
      type: "timestamp",
      createDate: true,
      nullable: false,
    },
    fechaActualizacion: {
      type: "timestamp",
      updateDate: true,
      nullable: false,
    },
  },
  relations: {
    /*movimientos: {
      type: "one-to-many",
      target: "MovimientoInventario",
      inverseSide: "productoVinilo",
      cascade: true, 
    },*/
    usosEnProyectos: {
      type: "one-to-many",
      target: "DetalleUsoViniloProyecto",
      inverseSide: "productoVinilo",
    },
  },
});

export default ProductoViniloSchema;