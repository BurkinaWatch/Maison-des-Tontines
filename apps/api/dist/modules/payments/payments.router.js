import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { authMiddleware } from "../../middleware/auth.js";
import { PaymentsController } from "./payments.controller.js";
import { InitiatePaymentDto, InitiatePayoutDto } from "./dto/payments.dto.js";
const router = Router();
const controller = new PaymentsController();
router.use(authMiddleware);
router.post("/contributions", validate(InitiatePaymentDto), controller.initiateContributionPayment);
router.post("/payouts", validate(InitiatePayoutDto), controller.initiatePayout);
router.get("/providers", controller.getProviders);
router.get("/status/:providerRef", controller.checkPaymentStatus);
export default router;
//# sourceMappingURL=payments.router.js.map