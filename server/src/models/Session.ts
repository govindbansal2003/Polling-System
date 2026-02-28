import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
    sessionId: string;
    socketId: string;
    name: string;
    role: 'teacher' | 'student';
    isConnected: boolean;
}

const SessionSchema = new Schema<ISession>(
    {
        sessionId: { type: String, required: true, unique: true },
        socketId: { type: String, required: true },
        name: { type: String, required: true },
        role: { type: String, enum: ['teacher', 'student'], required: true },
        isConnected: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Session = mongoose.model<ISession>('Session', SessionSchema);
