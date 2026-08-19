import { Router } from "express";
import { authMiddleware, requireTontineRole } from "../../middleware/auth.js";
import { ContributionsController } from "./contributions.controller.js";
import { validate } from "../../middleware/validate.js";
import { RecordContributionDto } from "./dto/contributions.dto.js";

const router = Router();
const controller = new ContributionsController();

router.use(authMiddleware);

router.post(
  "/cycles/:cycleId/contributions",
  validate(RecordContributionDto),
  controller.recordContribution
);
router.get("/cycles/:cycleId/contributions", controller.getContributions);
router.get("/me/contributions", controller.getMyContributions);

export default router;
