"use strict";

import User from "../entity/user.entity.js"; 
import ProductoViniloSchema from "../entity/productoVinilo.entity.js";
import { ProveedorSchema } from "../entity/proveedor.entity.js";
import { ClienteSchema } from "../entity/user.entity.cliente.js";

import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js"; 

async function createInitialData() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const productoViniloRepository = AppDataSource.getRepository(ProductoViniloSchema);
    const proveedorRepository = AppDataSource.getRepository(ProveedorSchema);
    const clienteRepository = AppDataSource.getRepository(ClienteSchema);

    console.log("Iniciando poblamiento de datos iniciales...");

    const userCount = await userRepository.count();
    if (userCount === 0) {
      await Promise.all([
        userRepository.save(
          userRepository.create({
            nombreCompleto: "Eiken Vollrath Alvarez",
            rut: "16.769.399-7",
            email: "administrador2025@gmail.cl",
            password: await encryptPassword("admin1234"),
            rol: "administrador",
          })
        ),
        userRepository.save(
          userRepository.create({
            nombreCompleto: "Judith Villagran",
            rut: "18.099.620-6",
            email: "usuario1@gmail.cl",
            password: await encryptPassword("user1234"),
            rol: "usuario",
          })
        ),
        userRepository.save(
          userRepository.create({
            nombreCompleto: "Benjamin Vollrath",
            rut: "20.275.207-1",
            email: "usuario2@gmail.cl",
            password: await encryptPassword("user1234"),
            rol: "usuario",
          })
        ),
      ]);
      console.log("* => Usuarios creados exitosamente.");
    } else {
      console.log("Usuarios ya existen, omitiendo creación.");
    }

    // --- Poblar Proveedores ---
    const proveedorCount = await proveedorRepository.count();
    if (proveedorCount === 0) {
      await Promise.all([
        proveedorRepository.save(
          proveedorRepository.create({
            nombre: "3M Chile S.A.",
            contacto: "Juan Pérez",
            telefono: "+56226202000",
            email: "contacto@3m.cl",
          })
        ),
        proveedorRepository.save(
          proveedorRepository.create({
            nombre: "Avery Dennison Chile",
            contacto: "Maria Gomez",
            telefono: "+56225551234",
            email: "ventas@averydennison.cl",
          })
        ),
        proveedorRepository.save(
          proveedorRepository.create({
            nombre: "Oracal Chile SpA",
            contacto: "Carlos Rojas",
            telefono: "+56227775678",
            email: "info@oracal.cl",
          })
        ),
      ]);
      console.log("* => Proveedores creados exitosamente.");
    } else {
      console.log("Proveedores ya existen, omitiendo creación.");
    }

    // --- Poblar Productos de Vinilo (Ajustado a tu esquema) ---
    const productoViniloCount = await productoViniloRepository.count();
    if (productoViniloCount === 0) {
      await Promise.all([
        productoViniloRepository.save(
          productoViniloRepository.create({
            nombre: "Vinilo Metalizado de Poliéster - Dorado",
            tipoVinilo: "Metalizado de Poliéster",
            color: "Dorado",
            cantidadDisponible: 5,
            descripcion: "Vinilo de poliéster con acabado metálico dorado, ideal para detalles de lujo y alta gama.",
            activo: true,
          })
        ),
        productoViniloRepository.save(
          productoViniloRepository.create({
            nombre: "Vinilo Metalizado de Poliéster - Plateado",
            tipoVinilo: "Metalizado de Poliéster",
            color: "Plateado",
            cantidadDisponible: 7,
            descripcion: "Vinilo de poliéster con acabado metálico plateado, versátil para aplicaciones corporativas y deportivas.",
            activo: true,
          })
        ),
        productoViniloRepository.save(
          productoViniloRepository.create({
            nombre: "Avery T-7500 Blanco Reflectante",
            tipoVinilo: "Avery T-7500",
            color: "Blanco",
            cantidadDisponible: 10,
            descripcion: "Vinilo reflectante de alta visibilidad, conforme a normativas de seguridad para flotas y vehículos de emergencia.",
            activo: true,
          })
        ),
        productoViniloRepository.save(
          productoViniloRepository.create({
            nombre: "Avery T-7500 Amarillo Reflectante",
            tipoVinilo: "Avery T-7500",
            color: "Amarillo",
            cantidadDisponible: 8,
            descripcion: "Vinilo reflectante amarillo de alta intensidad, crucial para la seguridad vial y señalización.",
            activo: true,
          })
        ),
        productoViniloRepository.save(
          productoViniloRepository.create({
            nombre: "Vinilo Fluor Series - Verde",
            tipoVinilo: "Fluor Series",
            color: "Verde",
            cantidadDisponible: 4,
            descripcion: "Vinilo de corte fluorescente verde, para diseños que requieren máxima atención en automovilismo y dragsters.",
            activo: true,
          })
        ),
        productoViniloRepository.save(
          productoViniloRepository.create({
            nombre: "Vinilo Fluor Series - Naranja",
            tipoVinilo: "Fluor Series",
            color: "Naranja",
            cantidadDisponible: 3,
            descripcion: "Vinilo de corte fluorescente naranja vibrante, ideal para gráficos de competición y elementos publicitarios audaces.",
            activo: true,
          })
        ),
      ]);
      console.log("* => Productos de Vinilo creados exitosamente.");
    } else {
      console.log("Productos de Vinilo ya existen, omitiendo creación.");
    }

    // --- Poblar Clientes ---
    const clienteCount = await clienteRepository.count();
    if (clienteCount === 0) {
      await Promise.all([
        clienteRepository.save(
          clienteRepository.create({
            nombreEmpresaOPersona: "Transportes Logistic Express",
            rutOIdentificacion: "76.123.456-7",
            contactoPrincipal: "Ana Valenzuela",
            telefono: "+56 9 8765 4321",
            email: "contacto@logisticexpress.cl",
            direccion: "Av. Las Industrias 123, Concepción",
          })
        ),
        clienteRepository.save(
          clienteRepository.create({
            nombreEmpresaOPersona: "Cuerpo de Bomberos de Hualpén",
            rutOIdentificacion: "65.432.100-0",
            contactoPrincipal: "Capitán Fernández",
            telefono: "+56 41 212 3456",
            email: "central@bomberoshualpen.cl",
            direccion: "Calle Principal 45, Hualpén",
          })
        ),
        clienteRepository.save(
          clienteRepository.create({
            nombreEmpresaOPersona: "Dragsters Velocidad Extrema",
            rutOIdentificacion: "98.765.432-1",
            contactoPrincipal: "Ricardo Soto",
            telefono: "+56 9 1234 5678",
            email: "ricardo.soto@dragstersve.cl",
            direccion: "Pista de Drag, San Pedro de la Paz",
          })
        ),
        clienteRepository.save(
          clienteRepository.create({
            nombreEmpresaOPersona: "Taller Mecánico 'El Torque'",
            rutOIdentificacion: "76.543.210-9",
            contactoPrincipal: "Laura Cortés",
            telefono: "+56 9 2345 6789",
            email: "laura@eltorque.cl",
            direccion: "Diagonal Pedro Aguirre Cerda 789, Talcahuano",
          })
        ),
      ]);
      console.log("* => Clientes creados exitosamente.");
    } else {
      console.log("Clientes ya existen, omitiendo creación.");
    }

    console.log("Poblamiento de datos iniciales finalizado.");

  } catch (error) {
    console.error("Error al crear datos iniciales:", error);
  }
}

export { createInitialData };