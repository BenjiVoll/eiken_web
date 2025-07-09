"use strict";

import User from "../entity/user.entity.js";
import { ServiceSchema } from "../entity/service.entity.js";
import { InventorySchema } from "../entity/inventory.entity.js";
import { SupplierSchema } from "../entity/supplier.entity.js";
import { ProjectSchema } from "../entity/project.entity.js";
import { QuoteSchema } from "../entity/quote.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

async function createInitialData() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const serviceRepository = AppDataSource.getRepository(ServiceSchema);
    const inventoryRepository = AppDataSource.getRepository(InventorySchema);
    const supplierRepository = AppDataSource.getRepository(SupplierSchema);
    const projectRepository = AppDataSource.getRepository(ProjectSchema);
    const quoteRepository = AppDataSource.getRepository(QuoteSchema);

    console.log("Iniciando poblamiento de datos iniciales para Eiken Design Chile...");

    const userCount = await userRepository.count();
    if (userCount === 0) {
      const adminPassword = await encryptPassword("admin2025");
      const managerPassword = await encryptPassword("manager2025");
      const designerPassword = await encryptPassword("designer2025");

      await Promise.all([
        userRepository.save(
          userRepository.create({
            name: "Eiken Vollrath Alvarez",
            email: "admin@eikendesign.cl",
            passwordHash: adminPassword,
            role: "admin",
            isActive: true,
          })
        ),
        userRepository.save(
          userRepository.create({
            name: "Judith Villagrán",
            email: "manager@eikendesign.cl",
            passwordHash: managerPassword,
            role: "manager",
            isActive: true,
          })
        ),
        userRepository.save(
          userRepository.create({
            name: "Benjamin Vollrath",
            email: "designer@eikendesign.cl",
            passwordHash: designerPassword,
            role: "designer",
            isActive: true,
          })
        ),
        userRepository.save(
          userRepository.create({
            name: "Operador Taller",
            email: "operador@eikendesign.cl",
            passwordHash: await encryptPassword("operador2025"),
            role: "operator",
            isActive: true,
          })
        ),
      ]);
      console.log("Usuarios creados exitosamente.");
    } else {
      console.log("Usuarios ya existen, omitiendo creación.");
    }

    const serviceCount = await serviceRepository.count();
    if (serviceCount === 0) {
      await Promise.all([
        serviceRepository.save(
          serviceRepository.create({
            name: "Wrap Vehicular Completo",
            description: "Diseño e instalación de wrap completo para vehículos comerciales y particulares",
            category: "Vehicular",
            division: "Truck Design",
            price: 450000.00,
            isActive: true,
          })
        ),
        serviceRepository.save(
          serviceRepository.create({
            name: "Gráfica de Competición",
            description: "Diseño especializado para autos de competición y rally",
            category: "Racing",
            division: "Racing Design",
            price: 850000.00,
            isActive: true,
          })
        ),
        serviceRepository.save(
          serviceRepository.create({
            name: "Identidad Corporativa",
            description: "Diseño completo de identidad visual empresarial",
            category: "Corporativo",
            division: "Design",
            price: 250000.00,
            isActive: true,
          })
        ),
        serviceRepository.save(
          serviceRepository.create({
            name: "Rotulado de Flota",
            description: "Diseño y aplicación para flotas empresariales",
            category: "Vehicular",
            division: "Truck Design",
            price: 380000.00,
            isActive: true,
          })
        ),
        serviceRepository.save(
          serviceRepository.create({
            name: "Gráfica Rally Nacional",
            description: "Diseño para vehículos de rally nacional e internacional",
            category: "Racing",
            division: "Racing Design",
            price: 720000.00,
            isActive: true,
          })
        ),
        serviceRepository.save(
          serviceRepository.create({
            name: "Estampado Textil",
            description: "Estampados corporativos y personalizados",
            category: "Textil",
            division: "Design",
            price: 45000.00,
            isActive: true,
          })
        ),
        serviceRepository.save(
          serviceRepository.create({
            name: "Cascos de Competición",
            description: "Gráfica para cascos de automovilismo y mountain bike",
            category: "Racing",
            division: "Racing Design",
            price: 95000.00,
            isActive: true,
          })
        ),
      ]);
      console.log("Servicios creados exitosamente.");
    } else {
      console.log("Servicios ya existen, omitiendo creación.");
    }

    
    const inventoryCount = await inventoryRepository.count();
    if (inventoryCount === 0) {
      await Promise.all([
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Vinilo Metalizado Plata",
            type: "Metalizado de Poliéster",
            color: "Plata",
            quantity: 15,
            unit: "metros",
            width: "1.22m",
            brand: "3M",
            code: "MP-001",
            unitCost: 12500.00,
            minStock: 5,
            isActive: true,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Vinilo Metalizado Oro",
            type: "Metalizado de Poliéster",
            color: "Oro",
            quantity: 6,
            unit: "metros",
            width: "1.22m",
            brand: "3M",
            code: "MP-002",
            unitCost: 13200.00,
            minStock: 3,
            isActive: true,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Vinilo Metalizado Negro",
            type: "Metalizado de Poliéster",
            color: "Negro",
            quantity: 12,
            unit: "metros",
            width: "1.22m",
            brand: "3M",
            code: "MP-003",
            unitCost: 12800.00,
            minStock: 4,
            isActive: true,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Avery Dennison Rojo",
            type: "Avery T-7500",
            color: "Rojo",
            quantity: 8,
            unit: "metros",
            width: "1.37m",
            brand: "Avery Dennison",
            code: "AD-T7500-R",
            unitCost: 9800.00,
            minStock: 3,
            isActive: true,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Avery Dennison Azul",
            type: "Avery T-7500",
            color: "Azul",
            quantity: 10,
            unit: "metros",
            width: "1.37m",
            brand: "Avery Dennison",
            code: "AD-T7500-B",
            unitCost: 9800.00,
            minStock: 3,
            isActive: true,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Avery Dennison Blanco",
            type: "Avery T-7500",
            color: "Blanco",
            quantity: 20,
            unit: "metros",
            width: "1.37m",
            brand: "Avery Dennison",
            code: "AD-T7500-W",
            unitCost: 8900.00,
            minStock: 5,
            isActive: true,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Fluor Verde Lima",
            type: "Vinilos Fluor Series",
            color: "Verde Lima",
            quantity: 12,
            unit: "metros",
            width: "1.22m",
            brand: "Oracal",
            code: "FL-VL-001",
            unitCost: 15600.00,
            minStock: 3,
            isActive: true,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Fluor Naranja",
            type: "Vinilos Fluor Series",
            color: "Naranja",
            quantity: 20,
            unit: "metros",
            width: "1.22m",
            brand: "Oracal",
            code: "FL-NA-001",
            unitCost: 15600.00,
            minStock: 4,
            isActive: true,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Fluor Rosa",
            type: "Vinilos Fluor Series",
            color: "Rosa",
            quantity: 8,
            unit: "metros",
            width: "1.22m",
            brand: "Oracal",
            code: "FL-RS-001",
            unitCost: 15600.00,
            minStock: 2,
            isActive: true,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Fluor Amarillo",
            type: "Vinilos Fluor Series",
            color: "Amarillo",
            quantity: 15,
            unit: "metros",
            width: "1.22m",
            brand: "Oracal",
            code: "FL-AM-001",
            unitCost: 15600.00,
            minStock: 3,
            isActive: true,
          })
        ),
      ]);
      console.log("Inventario creado exitosamente.");
    } else {
      console.log("Inventario ya existe, omitiendo creación.");
    }

    const supplierCount = await supplierRepository.count();
    if (supplierCount === 0) {
      await Promise.all([
        supplierRepository.save(
          supplierRepository.create({
            name: "3M Chile S.A.",
            contactPerson: "Juan Pérez",
            phone: "+56 2 2620 2000",
            email: "contacto@3m.cl",
            address: "Av. Apoquindo 4700, Las Condes, Santiago",
            rut: "90.123.000-7",
            isActive: true,
          })
        ),
        supplierRepository.save(
          supplierRepository.create({
            name: "Avery Dennison Chile",
            contactPerson: "María Gómez",
            phone: "+56 2 2555 1234",
            email: "ventas@averydennison.cl",
            address: "Av. Nueva Providencia 1860, Providencia, Santiago",
            rut: "91.456.000-2",
            isActive: true,
          })
        ),
        supplierRepository.save(
          supplierRepository.create({
            name: "Oracal Chile SpA",
            contactPerson: "Carlos Rojas",
            phone: "+56 2 2777 5678",
            email: "info@oracal.cl",
            address: "Av. Las Industrias 2500, Maipú, Santiago",
            rut: "92.789.000-5",
            isActive: true,
          })
        ),
        supplierRepository.save(
          supplierRepository.create({
            name: "Distribuidora Vinilos Sur",
            contactPerson: "Ana Valdés",
            phone: "+56 41 254 7890",
            email: "contacto@vinilossur.cl",
            address: "Calle O'Higgins 1234, Concepción",
            rut: "93.234.000-8",
            isActive: true,
          })
        ),
      ]);
      console.log("✅ Proveedores creados exitosamente.");
    } else {
      console.log("ℹ️  Proveedores ya existen, omitiendo creación.");
    }

    const projectCount = await projectRepository.count();
    if (projectCount === 0) {
      await Promise.all([
        projectRepository.save(
          projectRepository.create({
            title: "Wrap Completo Flota Transportes Bio-Bío",
            description: "Diseño e instalación de wrap completo para 25 camiones de carga",
            division: "Truck Design",
            category: "Flota Comercial",
            status: "completed",
            startDate: new Date("2024-01-15"),
            estimatedEndDate: new Date("2024-02-28"),
            actualEndDate: new Date("2024-02-28"),
            budgetAmount: 11250000.00,
            actualAmount: 11250000.00,
            year: 2024,
            month: "Febrero",
            imageUrl: "wrap-biobio-1.jpg",
            tags: ["Wrap", "Flota", "Comercial"],
            isFeatured: true,
            isPublic: true,
          })
        ),
        projectRepository.save(
          projectRepository.create({
            title: "Gráfica Rally Mobil 2024 - Team Chile",
            description: "Diseño especializado para 3 autos de competición Rally Mobil",
            division: "Racing Design",
            category: "Rally Nacional",
            status: "completed",
            startDate: new Date("2023-12-01"),
            estimatedEndDate: new Date("2024-01-10"),
            actualEndDate: new Date("2024-01-10"),
            budgetAmount: 2160000.00,
            actualAmount: 2160000.00,
            year: 2024,
            month: "Enero",
            imageUrl: "rally-mobil-1.jpg",
            tags: ["Rally", "Competición", "Nacional"],
            isFeatured: true,
            isPublic: true,
          })
        ),
        projectRepository.save(
          projectRepository.create({
            title: "Identidad Corporativa Grupo Arauco",
            description: "Desarrollo completo de identidad visual y aplicaciones vehiculares",
            division: "Design",
            category: "Corporativo",
            status: "completed",
            startDate: new Date("2023-11-01"),
            estimatedEndDate: new Date("2023-12-15"),
            actualEndDate: new Date("2023-12-15"),
            budgetAmount: 890000.00,
            actualAmount: 890000.00,
            year: 2023,
            month: "Diciembre",
            imageUrl: "arauco-1.jpg",
            tags: ["Identidad", "Corporativo", "Forestal"],
            isFeatured: false,
            isPublic: true,
          })
        ),
        projectRepository.save(
          projectRepository.create({
            title: "Cuerpo de Bomberos Concepción - Equipamiento Gráfico",
            description: "Diseño e instalación de gráficas para carros bomba y equipamiento",
            division: "Design",
            category: "Servicio Público",
            status: "completed",
            startDate: new Date("2023-09-15"),
            estimatedEndDate: new Date("2023-10-30"),
            actualEndDate: new Date("2023-10-30"),
            budgetAmount: 1350000.00,
            actualAmount: 1350000.00,
            year: 2023,
            month: "Octubre",
            imageUrl: "bomberos-1.jpg",
            tags: ["Bomberos", "Servicio", "Público"],
            isFeatured: true,
            isPublic: true,
          })
        ),
        projectRepository.save(
          projectRepository.create({
            title: "Flota Express Chilexpress",
            description: "Wrap completo para 40 vehículos de reparto",
            division: "Truck Design",
            category: "Logística",
            status: "in_progress",
            startDate: new Date("2024-02-01"),
            estimatedEndDate: new Date("2024-04-30"),
            budgetAmount: 18000000.00,
            year: 2024,
            month: "En Progreso",
            imageUrl: "chilexpress-1.jpg",
            tags: ["Logística", "Reparto", "Flota"],
            isFeatured: false,
            isPublic: false,
          })
        ),
      ]);
      console.log("Proyectos creados exitosamente.");
    } else {
      console.log("Proyectos ya existen, omitiendo creación.");
    }

    const quoteCount = await quoteRepository.count();
    if (quoteCount === 0) {
      await Promise.all([
        quoteRepository.save(
          quoteRepository.create({
            clientName: "Juan Pérez",
            clientEmail: "juan.perez@transportesabc.cl",
            clientPhone: "+56 9 8765 4321",
            company: "Transportes ABC",
            serviceType: "wrap-vehicular",
            description: "Necesitamos wrap completo para 10 camiones de nuestra flota",
            urgency: "medium",
            status: "pending",
            estimatedAmount: 4500000.00,
            notes: "Cliente interesado en descuento por volumen",
          })
        ),
        quoteRepository.save(
          quoteRepository.create({
            clientName: "María González",
            clientEmail: "maria@racingteamchile.cl",
            clientPhone: "+56 9 1234 5678",
            company: "Racing Team Chile",
            serviceType: "grafica-competicion",
            description: "Gráfica para 2 autos de competición temporada 2024",
            urgency: "high",
            status: "approved",
            estimatedAmount: 1700000.00,
            notes: "Aprobado para iniciar inmediatamente",
          })
        ),
        quoteRepository.save(
          quoteRepository.create({
            clientName: "Carlos Rodríguez",
            clientEmail: "carlos@empresadef.cl",
            clientPhone: "+56 2 2555 1234",
            company: "Empresa DEF",
            serviceType: "identidad-corporativa",
            description: "Desarrollo de identidad corporativa completa incluyendo logo y aplicaciones",
            urgency: "low",
            status: "in_process",
            estimatedAmount: 960000.00,
            notes: "En proceso de revisión de propuestas",
          })
        ),
        quoteRepository.save(
          quoteRepository.create({
            clientName: "Ana Martínez",
            clientEmail: "ana@bomberosconcepcion.cl",
            clientPhone: "+56 41 254 9999",
            company: "Bomberos Concepción",
            serviceType: "otro",
            description: "Gráfica para 3 carros bomba nuevos",
            urgency: "urgent",
            status: "pending",
            estimatedAmount: 1350000.00,
            notes: "Requiere aprobación urgente del directorio",
          })
        ),
      ]);
      console.log("Cotizaciones creadas exitosamente.");
    } else {
      console.log("Cotizaciones ya existen, omitiendo creación.");
    }


  } catch (error) {
    console.error("Error al crear datos iniciales:", error);
    throw error;
  }
}

export { createInitialData };
