import { Vote, IVote } from '../models/Vote';
import { Poll } from '../models/Poll';
import mongoose from 'mongoose';

export class VoteService {
    // In-memory set for fast duplicate rejection: "pollId:sessionId"
    private votedSet: Set<string> = new Set();

    async recordVote(
        pollId: string,
        optionIndex: number,
        studentName: string,
        studentSessionId: string
    ): Promise<{ success: boolean; error?: string }> {
        const key = `${pollId}:${studentSessionId}`;

        // Layer 2: In-memory check (fast reject)
        if (this.votedSet.has(key)) {
            return { success: false, error: 'You have already voted on this poll.' };
        }

        // Check if poll is still active and timer hasn't expired
        const poll = await Poll.findById(pollId);
        if (!poll) {
            return { success: false, error: 'Poll not found.' };
        }
        if (poll.status !== 'active') {
            return { success: false, error: 'This poll has ended.' };
        }
        if (new Date() > poll.endsAt) {
            return { success: false, error: 'Timer has expired for this poll.' };
        }
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return { success: false, error: 'Invalid option selected.' };
        }

        try {
            // Layer 3: Database-level uniqueness (definitive)
            const vote = new Vote({
                pollId: new mongoose.Types.ObjectId(pollId),
                optionIndex,
                studentName,
                studentSessionId,
            });
            await vote.save();

            // Atomic increment on the poll option's voteCount and totalVotes
            await Poll.findByIdAndUpdate(pollId, {
                $inc: {
                    [`options.${optionIndex}.voteCount`]: 1,
                    totalVotes: 1,
                },
            });

            // Add to in-memory set after successful DB write
            this.votedSet.add(key);

            return { success: true };
        } catch (error: any) {
            // Duplicate key error (E11000) means student already voted
            if (error.code === 11000) {
                this.votedSet.add(key); // Cache for future fast rejects
                return { success: false, error: 'You have already voted on this poll.' };
            }
            throw error;
        }
    }

    async hasVoted(pollId: string, sessionId: string): Promise<boolean> {
        const key = `${pollId}:${sessionId}`;
        if (this.votedSet.has(key)) return true;

        const vote = await Vote.findOne({
            pollId: new mongoose.Types.ObjectId(pollId),
            studentSessionId: sessionId,
        });

        if (vote) {
            this.votedSet.add(key);
            return true;
        }
        return false;
    }

    async getVote(pollId: string, sessionId: string): Promise<IVote | null> {
        return Vote.findOne({
            pollId: new mongoose.Types.ObjectId(pollId),
            studentSessionId: sessionId,
        });
    }

    async getResults(pollId: string) {
        const poll = await Poll.findById(pollId);
        if (!poll) return null;

        return {
            pollId: poll._id,
            question: poll.question,
            options: poll.options.map((opt) => ({
                text: opt.text,
                voteCount: opt.voteCount,
            })),
            totalVotes: poll.totalVotes,
            status: poll.status,
        };
    }

    // Clear in-memory cache for a specific poll (when poll completes)
    clearPollCache(pollId: string): void {
        const keysToRemove: string[] = [];
        this.votedSet.forEach((key) => {
            if (key.startsWith(`${pollId}:`)) {
                keysToRemove.push(key);
            }
        });
        keysToRemove.forEach((key) => this.votedSet.delete(key));
    }
}

export const voteService = new VoteService();
