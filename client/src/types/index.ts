export interface PollOption {
    text: string;
    voteCount?: number;
}

export interface Poll {
    _id: string;
    question: string;
    options: PollOption[];
    timerDuration: number;
    status: 'active' | 'completed';
    createdBy?: string;
    startedAt?: string;
    endsAt: string;
    totalVotes: number;
    remainingMs?: number;
}

export interface Vote {
    pollId: string;
    optionIndex: number;
    studentName: string;
    studentSessionId: string;
}

export interface SessionData {
    sessionId: string;
    name: string;
    role: 'teacher' | 'student';
}

export interface StudentInfo {
    name: string;
    sessionId: string;
}

export interface PollResults {
    pollId: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    status: string;
}

export interface ChatMessage {
    sender: string;
    role: 'teacher' | 'student';
    message: string;
    timestamp: string;
}

export interface RecoveryState {
    session: {
        name: string;
        role: 'teacher' | 'student';
    } | null;
    activePoll: Poll | null;
    hasVoted: boolean;
    votedOptionIndex: number;
    results: PollResults | null;
    error?: string;
}

export type PollPhase = 'idle' | 'active' | 'voted' | 'results';
