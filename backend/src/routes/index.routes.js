import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import clientRoutes from "./client.routes.js";
import serviceRoutes from "./service.routes.js";
import publicServiceRoutes from "./public.service.routes.js";
import publicProjectRoutes from "./public.project.routes.js";
import quoteRoutes from "./quote.routes.js";
import inventoryRoutes from "./inventory.routes.js";

import projectRoutes from "./project.routes.js";
import categoryRoutes from "./category.routes.js";
import divisionRoutes from "./division.routes.js";
import activityRoutes from "./activity.routes.js";
import productRoutes from "./product.routes.js";
import publicProductRoutes from "./public.product.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";
import uploadsRoutes from "./uploads.routes.js";
import webhookRoutes from "./webhook.routes.js";
import testRoutes from "./test.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/users", userRoutes)
    .use("/clients", clientRoutes)
    .use("/services", serviceRoutes)
    .use("/public/services", publicServiceRoutes)
    .use("/public/projects", publicProjectRoutes)
    .use("/public/products", publicProductRoutes)
    .use("/quotes", quoteRoutes)
    .use("/inventory", inventoryRoutes)

    .use("/projects", projectRoutes)
    .use("/categories", categoryRoutes)
    .use("/divisions", divisionRoutes)
    .use("/activities", activityRoutes)
    .use("/products", productRoutes)
    .use("/orders", orderRoutes)
    .use("/payments", paymentRoutes)
    .use("/dashboard", dashboardRoutes)
    .use("/uploads", uploadsRoutes)
    .use("/webhooks", webhookRoutes)
    .use("/test", testRoutes);

export default router;