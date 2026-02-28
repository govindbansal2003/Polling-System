import { Poll, IPoll } from '../models/Poll';

export class PollService {
    async createPoll(
        question: string,
        options: string[],
        timerDuration: number,
        createdBy: string
    ): Promise<IPoll> {
        // Check if there's already an active poll
        const activePoll = await this.getActivePoll();
        if (activePoll) {
            throw new Error('There is already an active poll. Complete it before creating a new one.');
        }

        const now = new Date();
        const endsAt = new Date(now.getTime() + timerDuration * 1000);

        const poll = new Poll({
            question,
            options: options.map((text) => ({ text, voteCount: 0 })),
            timerDuration,
            status: 'active',
            createdBy,
            startedAt: now,
            endsAt,
            totalVotes: 0,
        });

        await poll.save();
        return poll;
    }

    async getActivePoll(): Promise<IPoll | null> {
        return Poll.findOne({ status: 'active' });
    }

    async completePoll(pollId: string): Promise<IPoll | null> {
        return Poll.findByIdAndUpdate(
            pollId,
            { status: 'completed' },
            { new: true }
        );
    }

    async getPollHistory(): Promise<IPoll[]> {
        return Poll.find({ status: 'completed' }).sort({ createdAt: -1 });
    }

    async canCreateNewPoll(): Promise<boolean> {
        const activePoll = await this.getActivePoll();
        return !activePoll;
    }

    async getPollById(pollId: string): Promise<IPoll | null> {
        return Poll.findById(pollId);
    }
}

export const pollService = new PollService();
