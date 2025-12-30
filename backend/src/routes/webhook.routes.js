"use strict";
import { Router } from "express";
import { mercadoPagoWebhook } from "../controllers/webhook.controller.js";

const router = Router();

/**
 * Webhook de MercadoPago
 * MercadoPago llamará a este endpoint cuando haya eventos de pago
 * NO requiere autenticación - es un endpoint público que MP debe poder llamar
 */
router.post("/mercadopago", mercadoPagoWebhook);

export default router;
