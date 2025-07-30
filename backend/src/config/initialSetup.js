
"use strict";

import User from "../entity/user.entity.js";
import { ServiceSchema } from "../entity/service.entity.js";
import { InventorySchema } from "../entity/inventory.entity.js";
import { SupplierSchema } from "../entity/supplier.entity.js";
import { ProjectSchema } from "../entity/project.entity.js";
import { QuoteSchema } from "../entity/quote.entity.js";
import { ClientSchema } from "../entity/user.entity.client.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import { CategorySchema } from "../entity/category.entity.js";
import { DivisionSchema } from "../entity/division.entity.js";

async function createInitialData() {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const serviceRepository = AppDataSource.getRepository(ServiceSchema);
    const categoryRepository = AppDataSource.getRepository(CategorySchema);
    const divisionRepository = AppDataSource.getRepository(DivisionSchema);
    const inventoryRepository = AppDataSource.getRepository(InventorySchema);
    const supplierRepository = AppDataSource.getRepository(SupplierSchema);
    const projectRepository = AppDataSource.getRepository(ProjectSchema);
    const quoteRepository = AppDataSource.getRepository(QuoteSchema);
    const clientRepository = AppDataSource.getRepository(ClientSchema);

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

    // Obtener o crear categorías
    let vehicularCategory = await categoryRepository.findOneBy({ name: "Vehicular" });
    let racingCategory = await categoryRepository.findOneBy({ name: "Racing" });
    let corporativoCategory = await categoryRepository.findOneBy({ name: "Corporativo" });
    let textilCategory = await categoryRepository.findOneBy({ name: "Textil" });

    if (!vehicularCategory) vehicularCategory = await categoryRepository.save(categoryRepository.create({ name: "Vehicular" }));
    if (!racingCategory) racingCategory = await categoryRepository.save(categoryRepository.create({ name: "Racing" }));
    if (!corporativoCategory) corporativoCategory = await categoryRepository.save(categoryRepository.create({ name: "Corporativo" }));
    if (!textilCategory) textilCategory = await categoryRepository.save(categoryRepository.create({ name: "Textil" }));

    // Obtener o crear divisiones
    let truckDivision = await divisionRepository.findOneBy({ name: "Truck design" });
    let racingDivision = await divisionRepository.findOneBy({ name: "Racing design" });
    let designDivision = await divisionRepository.findOneBy({ name: "Design" });

    if (!truckDivision) truckDivision = await divisionRepository.save(divisionRepository.create({ name: "Truck design" }));
    if (!racingDivision) racingDivision = await divisionRepository.save(divisionRepository.create({ name: "Racing design" }));
    if (!designDivision) designDivision = await divisionRepository.save(divisionRepository.create({ name: "Design" }));

    const serviceCount = await serviceRepository.count();
    if (serviceCount === 0) {
      await Promise.all([
        serviceRepository.save(
          serviceRepository.create({
            name: "Wrap Vehicular Completo",
            description: "Diseño e instalación de wrap completo para vehículos comerciales y particulares",
            category: vehicularCategory.id,
            division: truckDivision.id,
            price: 450000.00,
          })
        ),
        serviceRepository.save(
          serviceRepository.create({
            name: "Gráfica de Competición",
            description: "Diseño especializado para autos de competición y rally",
            category: racingCategory.id,
            division: racingDivision.id,
            price: 850000.00,
          })
        ),
        serviceRepository.save(
          serviceRepository.create({
            name: "Identidad Corporativa",
            description: "Diseño completo de identidad visual empresarial",
            category: corporativoCategory.id,
            division: designDivision.id,
            price: 250000.00,
          })
        ),
        serviceRepository.save(
          serviceRepository.create({
            name: "Rotulado de Flota",
            description: "Diseño y aplicación para flotas empresariales",
            category: vehicularCategory.id,
            division: truckDivision.id,
            price: 380000.00,
          })
        ),
        serviceRepository.save(
          serviceRepository.create({
            name: "Gráfica Rally Nacional",
            description: "Diseño para vehículos de rally nacional e internacional",
            category: racingCategory.id,
            division: racingDivision.id,
            price: 720000.00,
          })
        ),
        serviceRepository.save(
          serviceRepository.create({
            name: "Estampado Textil",
            description: "Estampados corporativos y personalizados",
            category: textilCategory.id,
            division: designDivision.id,
            price: 45000.00,
          })
        ),
        serviceRepository.save(
          serviceRepository.create({
            name: "Cascos de Competición",
            description: "Gráfica para cascos de automovilismo y mountain bike",
            category: racingCategory.id,
            division: racingDivision.id,
            price: 95000.00,
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
            brand: "3M",
            model: "Scotchcal",
            unit: "metros",
            quantity: 15,
            minStock: 5,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Vinilo Metalizado Oro",
            type: "Metalizado de Poliéster",
            color: "Oro",
            brand: "3M",
            model: "Scotchcal",
            unit: "metros",
            quantity: 6,
            minStock: 3,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Vinilo Metalizado Negro",
            type: "Metalizado de Poliéster",
            color: "Negro",
            brand: "3M",
            model: "Scotchcal",
            unit: "metros",
            quantity: 12,
            minStock: 4,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Avery Dennison Rojo",
            type: "Avery T-7500",
            color: "Rojo",
            brand: "Avery Dennison",
            model: "T-7500",
            unit: "metros",
            quantity: 8,
            minStock: 3,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Avery Dennison Azul",
            type: "Avery T-7500",
            color: "Azul",
            brand: "Avery Dennison",
            model: "T-7500",
            unit: "metros",
            quantity: 10,
            minStock: 3,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Avery Dennison Blanco",
            type: "Avery T-7500",
            color: "Blanco",
            brand: "Avery Dennison",
            model: "T-7500",
            unit: "metros",
            quantity: 20,
            minStock: 5,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Fluor Verde Lima",
            type: "Vinilos Fluor Series",
            color: "Verde Lima",
            brand: "Oracal",
            model: "651",
            unit: "metros",
            quantity: 12,
            minStock: 3,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Fluor Naranja",
            type: "Vinilos Fluor Series",
            color: "Naranja",
            brand: "Oracal",
            model: "651",
            unit: "metros",
            quantity: 20,
            minStock: 4,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Fluor Rosa",
            type: "Vinilos Fluor Series",
            color: "Rosa",
            brand: "Oracal",
            model: "651",
            unit: "metros",
            quantity: 8,
            minStock: 2,
          })
        ),
        inventoryRepository.save(
          inventoryRepository.create({
            name: "Fluor Amarillo",
            type: "Vinilos Fluor Series",
            color: "Amarillo",
            brand: "Oracal",
            model: "651",
            unit: "metros",
            quantity: 15,
            minStock: 3,
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

    // Crear clientes
    const clientCount = await clientRepository.count();
    if (clientCount === 0) {
      await Promise.all([
        clientRepository.save(
          clientRepository.create({
            name: "Transportes Bio-Bío S.A.",
            email: "contacto@transportesbiobio.cl",
            phone: "+56 41 274-5830",
            address: "Av. Pedro Aguirre Cerda 1245, Concepción",
            company: "Transportes Bio-Bío S.A.",
            rut: "96.789.123-4",
            clientType: "company",
            isActive: true,
          })
        ),
        clientRepository.save(
          clientRepository.create({
            name: "Team Chile Rally",
            email: "info@teamchilerally.com",
            phone: "+56 9 8765-4321",
            address: "Parque Industrial Los Aromos, Santiago",
            company: "Team Chile Rally SpA",
            rut: "77.456.789-0",
            clientType: "company",
            isActive: true,
          })
        ),
        clientRepository.save(
          clientRepository.create({
            name: "Grupo Arauco",
            email: "marketing@arauco.cl",
            phone: "+56 2 2461-7000",
            address: "Av. El Bosque Norte 0123, Las Condes, Santiago",
            company: "Empresas Arauco S.A.",
            rut: "93.458.000-1",
            clientType: "company",
            isActive: true,
          })
        ),
        clientRepository.save(
          clientRepository.create({
            name: "Cuerpo de Bomberos Concepción",
            email: "admin@bomberosconcepcion.cl",
            phone: "+56 41 241-3132",
            address: "Calle Barros Arana 457, Concepción",
            company: "Cuerpo de Bomberos de Concepción",
            rut: "71.234.567-8",
            clientType: "company",
            isActive: true,
          })
        ),
      ]);
      console.log("✅ Clientes creados exitosamente.");
    } else {
      console.log("ℹ️  Clientes ya existen, omitiendo creación.");
    }

    const projectCount = await projectRepository.count();
    if (projectCount === 0) {
      await Promise.all([
        projectRepository.save(
          projectRepository.create({
            title: "Wrap Completo Flota Transportes Bio-Bío",
            description: "Diseño e instalación de wrap completo para 25 camiones de carga",
            clientId: 1,
            projectType: vehicularCategory.id,
            division: truckDivision.id,
            status: "Completado",
            priority: "Alto",
            budgetAmount: 11250000.00,
            notes: "Proyecto completado exitosamente dentro del plazo estimado",
          })
        ),
        projectRepository.save(
          projectRepository.create({
            title: "Gráfica Rally Mobil 2024 - Team Chile",
            description: "Diseño especializado para 3 autos de competición Rally Mobil",
            clientId: 2,
            projectType: racingCategory.id,
            division: racingDivision.id,
            status: "Completado",
            priority: "Urgente",
            budgetAmount: 2160000.00,
            notes: "Entregado para temporada 2024 de Rally Mobil",
          })
        ),
        projectRepository.save(
          projectRepository.create({
            title: "Identidad Corporativa Grupo Arauco",
            description: "Desarrollo completo de identidad visual y aplicaciones vehiculares",
            clientId: 3,
            projectType: corporativoCategory.id,
            division: designDivision.id,
            status: "Completado",
            priority: "Medio",
            budgetAmount: 890000.00,
            notes: "Incluye manual de identidad y aplicaciones vehiculares",
          })
        ),
        projectRepository.save(
          projectRepository.create({
            title: "Cuerpo de Bomberos Concepción - Equipamiento Gráfico",
            description: "Diseño e instalación de gráficas para carros bomba y equipamiento",
            clientId: 4,
            projectType: vehicularCategory.id,
            division: designDivision.id,
            status: "Completado",
            priority: "Alto",
            budgetAmount: 1350000.00,
            notes: "Gráficas para 3 carros bomba y equipamiento auxiliar",
          })
        ),
        projectRepository.save(
          projectRepository.create({
            title: "Flota Express Chilexpress",
            description: "Wrap completo para 40 vehículos de reparto",
            clientId: 1,
            projectType: vehicularCategory.id,
            division: truckDivision.id,
            status: "En Proceso",
            priority: "Alto",
            budgetAmount: 18000000.00,
            notes: "Proyecto en ejecución - Fase 1 de 3 completada",
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
            customServiceTitle: "Wrap para Flota de Camiones",
            categoryId: vehicularCategory.id,
            description: "Necesitamos wrap completo para 10 camiones de nuestra flota",
            urgency: "Medio",
            status: "Pendiente",
            quotedAmount: 4500000.00,
            notes: "Cliente interesado en descuento por volumen",
          })
        ),
        quoteRepository.save(
          quoteRepository.create({
            clientName: "María González",
            clientEmail: "maria@racingteamchile.cl",
            clientPhone: "+56 9 1234 5678",
            company: "Racing Team Chile",
            customServiceTitle: "Gráfica para Autos de Competición",
            categoryId: racingCategory.id,
            description: "Gráfica para 2 autos de competición temporada 2024",
            urgency: "Alto",
            status: "Aprobado",
            quotedAmount: 1700000.00,
            notes: "Aprobado para iniciar inmediatamente",
          })
        ),
        quoteRepository.save(
          quoteRepository.create({
            clientName: "Carlos Rodríguez",
            clientEmail: "carlos@empresadef.cl",
            clientPhone: "+56 2 2555 1234",
            company: "Empresa DEF",
            customServiceTitle: "Desarrollo de Identidad Corporativa",
            categoryId: corporativoCategory.id,
            description: "Desarrollo de identidad corporativa completa incluyendo logo y aplicaciones",
            urgency: "Bajo",
            status: "En Revisión",
            quotedAmount: 960000.00,
            notes: "En proceso de revisión de propuestas",
          })
        ),
        quoteRepository.save(
          quoteRepository.create({
            clientName: "Ana Martínez",
            clientEmail: "ana@bomberosconcepcion.cl",
            clientPhone: "+56 41 254 9999",
            company: "Bomberos Concepción",
            customServiceTitle: "Gráfica para Carros Bomba",
            categoryId: vehicularCategory.id,
            description: "Gráfica para 3 carros bomba nuevos",
            urgency: "Urgente",
            status: "Pendiente",
            quotedAmount: 1350000.00,
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
