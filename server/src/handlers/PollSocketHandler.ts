import { Server, Socket } from 'socket.io';
import { pollService } from '../services/PollService';
import { voteService } from '../services/VoteService';
import { sessionService } from '../services/SessionService';
import { timerService } from '../services/TimerService';

export class PollSocketHandler {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    handleConnection(socket: Socket): void {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // Session join / reconnect
        socket.on('session:join', async (data: {
            sessionId: string;
            name: string;
            role: 'teacher' | 'student';
        }) => {
            try {
                const { sessionId, name, role } = data;

                await sessionService.registerSession(sessionId, socket.id, name, role);

                // Join role-based rooms
                socket.join(role);
                socket.join(`session:${sessionId}`);

                if (role === 'student') {
                    // Notify teachers of new student
                    const students = await sessionService.getConnectedStudents();
                    this.io.to('teacher').emit('student:joined', {
                        students: students.map((s) => ({ name: s.name, sessionId: s.sessionId })),
                        count: students.length,
                    });
                }

                socket.emit('session:joined', { success: true, sessionId });
            } catch (error: any) {
                socket.emit('session:error', { error: error.message });
            }
        });

        // Poll creation (Teacher only)
        socket.on('poll:create', async (data: {
            question: string;
            options: string[];
            timerDuration: number;
        }) => {
            try {
                const session = await sessionService.getSessionBySocketId(socket.id);
                if (!session || session.role !== 'teacher') {
                    socket.emit('poll:error', { error: 'Only teachers can create polls.' });
                    return;
                }

                const { question, options, timerDuration } = data;
                const poll = await pollService.createPoll(question, options, timerDuration, session.name);

                // Start server-side timer
                timerService.startTimer(
                    poll._id.toString(),
                    poll.endsAt,
                    async () => {
                        await this.handlePollExpiry(poll._id.toString());
                    }
                );

                // Acknowledge to teacher
                socket.emit('poll:created', {
                    poll: {
                        _id: poll._id,
                        question: poll.question,
                        options: poll.options,
                        timerDuration: poll.timerDuration,
                        endsAt: poll.endsAt.toISOString(),
                        totalVotes: poll.totalVotes,
                        status: poll.status,
                    },
                });

                // Broadcast to all students
                this.io.to('student').emit('poll:new', {
                    poll: {
                        _id: poll._id,
                        question: poll.question,
                        options: poll.options.map((o) => ({ text: o.text })),
                        timerDuration: poll.timerDuration,
                        endsAt: poll.endsAt.toISOString(),
                    },
                });
            } catch (error: any) {
                socket.emit('poll:error', { error: error.message });
            }
        });

        // Vote submission (Student only)
        socket.on('poll:vote', async (data: {
            pollId: string;
            optionIndex: number;
        }) => {
            try {
                const session = await sessionService.getSessionBySocketId(socket.id);
                if (!session || session.role !== 'student') {
                    socket.emit('poll:vote-ack', { success: false, error: 'Only students can vote.' });
                    return;
                }

                const { pollId, optionIndex } = data;
                const result = await voteService.recordVote(
                    pollId,
                    optionIndex,
                    session.name,
                    session.sessionId
                );

                socket.emit('poll:vote-ack', result);

                if (result.success) {
                    // Broadcast updated results to all
                    const results = await voteService.getResults(pollId);
                    this.io.emit('poll:results-update', { results });
                }
            } catch (error: any) {
                socket.emit('poll:vote-ack', { success: false, error: error.message });
            }
        });

        // State recovery
        socket.on('state:recover', async (data: { sessionId: string }) => {
            try {
                const { sessionId } = data;
                const session = await sessionService.getSessionById(sessionId);
                if (!session) {
                    socket.emit('state:recovered', { error: 'Session not found.' });
                    return;
                }

                // Update socket ID for this session
                await sessionService.reconnectSession(sessionId, socket.id);
                socket.join(session.role);
                socket.join(`session:${sessionId}`);

                const activePoll = await pollService.getActivePoll();
                let hasVoted = false;
                let votedOptionIndex = -1;
                let results = null;

                if (activePoll) {
                    const pollId = activePoll._id.toString();
                    hasVoted = await voteService.hasVoted(pollId, sessionId);
                    results = await voteService.getResults(pollId);

                    if (hasVoted) {
                        const vote = await voteService.getVote(pollId, sessionId);
                        votedOptionIndex = vote?.optionIndex ?? -1;
                    }
                }

                // Notify teachers about student list on reconnect
                if (session.role === 'student') {
                    const students = await sessionService.getConnectedStudents();
                    this.io.to('teacher').emit('student:joined', {
                        students: students.map((s) => ({ name: s.name, sessionId: s.sessionId })),
                        count: students.length,
                    });
                }

                socket.emit('state:recovered', {
                    session: {
                        name: session.name,
                        role: session.role,
                    },
                    activePoll: activePoll
                        ? {
                            _id: activePoll._id,
                            question: activePoll.question,
                            options: activePoll.options,
                            timerDuration: activePoll.timerDuration,
                            endsAt: activePoll.endsAt.toISOString(),
                            totalVotes: activePoll.totalVotes,
                            status: activePoll.status,
                        }
                        : null,
                    hasVoted,
                    votedOptionIndex,
                    results,
                });
            } catch (error: any) {
                socket.emit('state:recovered', { error: error.message });
            }
        });

        // Kick student (Teacher only)
        socket.on('student:kick', async (data: { sessionId: string }) => {
            try {
                const session = await sessionService.getSessionBySocketId(socket.id);
                if (!session || session.role !== 'teacher') {
                    return;
                }

                const targetSession = await sessionService.getSessionById(data.sessionId);
                if (targetSession) {
                    // Notify the kicked student
                    this.io.to(`session:${data.sessionId}`).emit('session:kicked', {
                        message: 'You have been removed by the teacher.',
                    });

                    await sessionService.removeSession(data.sessionId);

                    // Update student list for teachers
                    const students = await sessionService.getConnectedStudents();
                    this.io.to('teacher').emit('student:joined', {
                        students: students.map((s) => ({ name: s.name, sessionId: s.sessionId })),
                        count: students.length,
                    });
                }
            } catch (error: any) {
                console.error('Error kicking student:', error);
            }
        });

        // Chat message
        socket.on('chat:message', async (data: { message: string }) => {
            try {
                const session = await sessionService.getSessionBySocketId(socket.id);
                if (!session) return;

                this.io.emit('chat:message', {
                    sender: session.name,
                    role: session.role,
                    message: data.message,
                    timestamp: new Date().toISOString(),
                });
            } catch (error: any) {
                console.error('Chat error:', error);
            }
        });

        // Disconnect
        socket.on('disconnect', async () => {
            try {
                const session = await sessionService.disconnectSession(socket.id);
                if (session && session.role === 'student') {
                    const students = await sessionService.getConnectedStudents();
                    this.io.to('teacher').emit('student:left', {
                        students: students.map((s) => ({ name: s.name, sessionId: s.sessionId })),
                        count: students.length,
                    });
                }
                console.log(`🔌 Socket disconnected: ${socket.id}`);
            } catch (error: any) {
                console.error('Disconnect error:', error);
            }
        });
    }

    private async handlePollExpiry(pollId: string): Promise<void> {
        try {
            const poll = await pollService.completePoll(pollId);
            if (poll) {
                const results = await voteService.getResults(pollId);
                this.io.emit('poll:completed', { poll, results });
                voteService.clearPollCache(pollId);
            }
        } catch (error) {
            console.error('Error handling poll expiry:', error);
        }
    }
}
