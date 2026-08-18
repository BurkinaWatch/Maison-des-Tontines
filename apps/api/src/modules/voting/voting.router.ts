import { Router } from "express";
import { VotingController } from "./voting.controller.js";
import { validate } from "../../middleware/validate.js";
import { authMiddleware, requireRole, requireTontineRole } from "../../middleware/auth.js";
import { CreateVoteDto, CastVoteDto } from "./dto/voting.dto.js";

const router = Router();
const controller = new VotingController();

router.use(authMiddleware);

router.post("/", validate(CreateVoteDto), controller.createVote);
router.post("/ballots", validate(CastVoteDto), controller.castVote);
router.post("/:voteId/close", requireRole("ADMIN", "ORGANIZER"), controller.closeVote);

export default router;
