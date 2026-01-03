"use strict";
import { Router } from "express";
import { getActiveProducts, getProduct } from "../controllers/product.controller.js";

const router = Router();

router.get("/", getActiveProducts);
router.get("/:id", getProduct);

export default router;
