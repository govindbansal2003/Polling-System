import { Session, ISession } from '../models/Session';

export class SessionService {
    async registerSession(
        sessionId: string,
        socketId: string,
        name: string,
        role: 'teacher' | 'student'
    ): Promise<ISession> {
        // Upsert: update if exists, create if not
        const session = await Session.findOneAndUpdate(
            { sessionId },
            { socketId, name, role, isConnected: true },
            { upsert: true, new: true }
        );
        return session;
    }

    async reconnectSession(sessionId: string, socketId: string): Promise<ISession | null> {
        return Session.findOneAndUpdate(
            { sessionId },
            { socketId, isConnected: true },
            { new: true }
        );
    }

    async disconnectSession(socketId: string): Promise<ISession | null> {
        return Session.findOneAndUpdate(
            { socketId },
            { isConnected: false },
            { new: true }
        );
    }

    async getSessionById(sessionId: string): Promise<ISession | null> {
        return Session.findOne({ sessionId });
    }

    async getSessionBySocketId(socketId: string): Promise<ISession | null> {
        return Session.findOne({ socketId });
    }

    async isNameTaken(name: string, role: 'teacher' | 'student'): Promise<boolean> {
        const session = await Session.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            role,
            isConnected: true,
        });
        return !!session;
    }

    async getConnectedStudents(): Promise<ISession[]> {
        return Session.find({ role: 'student', isConnected: true });
    }

    async getConnectedCount(): Promise<{ students: number; teachers: number }> {
        const students = await Session.countDocuments({ role: 'student', isConnected: true });
        const teachers = await Session.countDocuments({ role: 'teacher', isConnected: true });
        return { students, teachers };
    }

    async removeSession(sessionId: string): Promise<void> {
        await Session.deleteOne({ sessionId });
    }
}

export const sessionService = new SessionService();
