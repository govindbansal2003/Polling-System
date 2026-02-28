import { Request, Response, NextFunction } from 'express';
import { pollService } from '../services/PollService';
import { voteService } from '../services/VoteService';
import { timerService } from '../services/TimerService';

export class PollController {
    async getActivePoll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const poll = await pollService.getActivePoll();
            if (!poll) {
                res.json({ poll: null });
                return;
            }

            const remainingMs = timerService.getRemainingMs(poll.endsAt);
            res.json({
                poll: {
                    _id: poll._id,
                    question: poll.question,
                    options: poll.options,
                    timerDuration: poll.timerDuration,
                    endsAt: poll.endsAt.toISOString(),
                    totalVotes: poll.totalVotes,
                    status: poll.status,
                    remainingMs,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getPollHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const polls = await pollService.getPollHistory();
            res.json({ polls });
        } catch (error) {
            next(error);
        }
    }

    async getMyVote(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { sessionId } = req.query;

            if (!sessionId || typeof sessionId !== 'string') {
                res.status(400).json({ error: 'sessionId query parameter is required.' });
                return;
            }

            const hasVoted = await voteService.hasVoted(id, sessionId);
            let vote = null;
            if (hasVoted) {
                vote = await voteService.getVote(id, sessionId);
            }

            res.json({ hasVoted, vote });
        } catch (error) {
            next(error);
        }
    }
}

export const pollController = new PollController();
