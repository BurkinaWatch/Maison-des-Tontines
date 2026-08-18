import { Router } from "express";
import { ContributionsController } from "./contributions.controller.js";
import { authMiddleware, requireTontineRole, validate } from "../../middleware/auth.js";
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
