import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import clientRoutes from "./client.routes.js";
import serviceRoutes from "./service.routes.js";
import publicServiceRoutes from "./public.service.routes.js";
import publicProjectRoutes from "./public.project.routes.js";
import quoteRoutes from "./quote.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import supplierRoutes from "./supplier.routes.js";
import projectRoutes from "./project.routes.js";
// import orderRoutes from "./order.routes.js";
// import inventoryMovementRoutes from "./inventoryMovement.routes.js";
// import projectInventoryUsageRoutes from "./projectInventoryUsage.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/users", userRoutes)
    .use("/clients", clientRoutes)
    .use("/services", serviceRoutes)
    .use("/public/services", publicServiceRoutes) // Rutas públicas para servicios
    .use("/public/projects", publicProjectRoutes) // Rutas públicas para proyectos
    .use("/quotes", quoteRoutes)
    .use("/inventory", inventoryRoutes)
    .use("/suppliers", supplierRoutes)
    .use("/projects", projectRoutes);
    // .use("/orders", orderRoutes)
    // .use("/inventory-movements", inventoryMovementRoutes)
    // .use("/project-inventory-usage", projectInventoryUsageRoutes);

export default router;