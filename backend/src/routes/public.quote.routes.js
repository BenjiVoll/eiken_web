import { Router } from "express";
import { acceptQuote } from "../controllers/public.quote.controller.js";

const router = Router();

router.get("/accept/:token", acceptQuote);

export default router;
