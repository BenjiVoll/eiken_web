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
import categoryRoutes from "./category.routes.js";
import divisionRoutes from "./division.routes.js";
import activityRoutes from "./activity.routes.js";
import productRoutes from "./product.routes.js";
import publicProductRoutes from "./public.product.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/users", userRoutes)
    .use("/clients", clientRoutes)
    .use("/services", serviceRoutes)
    .use("/public/services", publicServiceRoutes) // Rutas públicas para servicios
    .use("/public/projects", publicProjectRoutes) // Rutas públicas para proyectos
    .use("/public/products", publicProductRoutes) // Rutas públicas para productos (tienda)
    .use("/quotes", quoteRoutes)
    .use("/inventory", inventoryRoutes)
    .use("/suppliers", supplierRoutes)
    .use("/projects", projectRoutes)
    .use("/categories", categoryRoutes)
    .use("/divisions", divisionRoutes)
    .use("/activities", activityRoutes)
    .use("/products", productRoutes)
    .use("/dashboard", dashboardRoutes);

export default router;