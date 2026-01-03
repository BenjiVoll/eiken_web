"use strict";
import { Router } from "express";
import {
    createPaymentPreferenceController,
    paymentWebhookController,
    getPaymentStatusController,
} from "../controllers/payment.controller.js";

const router = Router();

// Ruta para crear preferencia de pago
router.post("/create-preference", createPaymentPreferenceController);

// Webhook para Mercado Pago
router.post("/webhook", paymentWebhookController);

// Estado de pago
router.get("/status/:paymentId", getPaymentStatusController);

export default router;
