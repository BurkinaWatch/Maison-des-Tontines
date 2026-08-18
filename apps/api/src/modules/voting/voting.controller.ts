import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../../../../config/database.js";
import { logger } from "../../../../config/logger.js";

export class VotingController {
  async createVote(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { tontineId, question, options, quorum } = req.body;

      const membership = await getPrisma().tontineMember.findFirst({
        where: { tontineId, userId, status: "ACTIVE" },
      });

      if (!membership) {
        return res.status(403).json({ error: "Not a member of this tontine" });
      }

      const tontine = await getPrisma().tontine.findUnique({
        where: { id: tontineId },
        include: { members: { where: { status: "ACTIVE" } } },
      });

      if (!tontine) {
        return res.status(404).json({ error: "Tontine not found" });
      }

      const eligibleVoterIds = tontine.members.map((m) => m.userId);

      const vote = await getPrisma().vote.create({
        data: {
          tontineId,
          question,
          options: JSON.stringify(options),
          quorum,
          eligibleVoterIds: JSON.stringify(eligibleVoterIds),
          status: "OPEN",
          openedAt: new Date(),
          createdById: userId,
        },
        include: {
          createdBy: { select: { id: true, phone: true, name: true } },
        },
      });

      logger.info("Vote created", { voteId: vote.id, tontineId, userId });
      res.status(201).json({ vote });
    } catch (error) {
      next(error);
    }
  }

  async castVote(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { voteId, choice } = req.body;

      const vote = await getPrisma().vote.findUnique({
        where: { id: voteId },
        include: { ballots: true },
      });

      if (!vote) {
        return res.status(404).json({ error: "Vote not found" });
      }

      if (vote.status !== "OPEN") {
        return res.status(400).json({ error: "Voting is not open" });
      }

      const eligibleVoterIds = JSON.parse(vote.eligibleVoterIds) as string[];
      if (!eligibleVoterIds.includes(userId)) {
        return res.status(403).json({ error: "Not eligible to vote" });
      }

      const existingBallot = await getPrisma().voteBallot.findFirst({
        where: { voteId, memberId: voteId },
      });

      const membership = await getPrisma().tontineMember.findFirst({
        where: { tontineId: vote.tontineId, userId, status: "ACTIVE" },
      });

      if (!membership) {
        return res.status(403).json({ error: "Not a member of this tontine" });
      }

      const ballot = await getPrisma().voteBallot.create({
        data: {
          voteId,
          memberId: membership.id,
          choice,
        },
      });

      const totalVotes = await getPrisma().voteBallot.count({
        where: { voteId },
      });

      logger.info("Vote cast", { voteId, userId, totalVotes });
      res.status(201).json({ ballot, totalVotes });
    } catch (error) {
      next(error);
    }
  }

  async closeVote(req: any, res: Response, next: NextFunction) {
    try {
      const { voteId } = req.params;

      const vote = await getPrisma().vote.findUnique({
        where: { id: voteId },
        include: { ballots: true },
      });

      if (!vote) {
        return res.status(404).json({ error: "Vote not found" });
      }

      const ballots = vote.ballots;
      const results: Record<string, number> = {};
      for (const ballot of ballots) {
        results[ballot.choice] = (results[ballot.choice] || 0) + 1;
      }

      const winner = Object.entries(results).sort((a, b) => b[1] - a[1])[0];

      const updatedVote = await getPrisma().vote.update({
        where: { id: voteId },
        data: {
          status: "CLOSED",
          closedAt: new Date(),
          result: JSON.stringify({ winner: winner?.[0], results }),
        },
      });

      logger.info("Vote closed", { voteId, winner: winner?.[0] });
      res.json({ vote: updatedVote });
    } catch (error) {
      next(error);
    }
  }
}
