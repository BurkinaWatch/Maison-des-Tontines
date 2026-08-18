import { Router } from "express";
import paymentsRoutes from "./modules/payments/payments.router.js";

const router = Router();

router.use("/", paymentsRoutes);

export default router;
