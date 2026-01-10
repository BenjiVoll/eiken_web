import { Router } from "express";
import { acceptQuote, rejectQuote } from "../controllers/public.quote.controller.js";

const router = Router();

router.get("/accept/:token", acceptQuote);
router.get("/reject/:token", rejectQuote);

export default router;
