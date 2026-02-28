import mongoose, { Schema, Document } from 'mongoose';

export interface IPollOption {
    text: string;
    voteCount: number;
}

export interface IPoll extends Document {
    question: string;
    options: IPollOption[];
    timerDuration: number;
    status: 'active' | 'completed';
    createdBy: string;
    startedAt: Date;
    endsAt: Date;
    totalVotes: number;
}

const PollOptionSchema = new Schema<IPollOption>(
    {
        text: { type: String, required: true },
        voteCount: { type: Number, default: 0 },
    },
    { _id: false }
);

const PollSchema = new Schema<IPoll>(
    {
        question: { type: String, required: true },
        options: { type: [PollOptionSchema], required: true },
        timerDuration: { type: Number, required: true },
        status: { type: String, enum: ['active', 'completed'], default: 'active' },
        createdBy: { type: String, required: true },
        startedAt: { type: Date, default: Date.now },
        endsAt: { type: Date, required: true },
        totalVotes: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export const Poll = mongoose.model<IPoll>('Poll', PollSchema);
