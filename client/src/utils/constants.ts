export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const SOCKET_EVENTS = {
    // Client -> Server
    SESSION_JOIN: 'session:join',
    POLL_CREATE: 'poll:create',
    POLL_VOTE: 'poll:vote',
    STATE_RECOVER: 'state:recover',
    STUDENT_KICK: 'student:kick',
    CHAT_MESSAGE: 'chat:message',

    // Server -> Client
    SESSION_JOINED: 'session:joined',
    SESSION_ERROR: 'session:error',
    SESSION_KICKED: 'session:kicked',
    POLL_NEW: 'poll:new',
    POLL_CREATED: 'poll:created',
    POLL_ERROR: 'poll:error',
    POLL_VOTE_ACK: 'poll:vote-ack',
    POLL_RESULTS_UPDATE: 'poll:results-update',
    POLL_COMPLETED: 'poll:completed',
    STATE_RECOVERED: 'state:recovered',
    STUDENT_JOINED: 'student:joined',
    STUDENT_LEFT: 'student:left',
} as const;

export const DEFAULT_TIMER_DURATION = 60;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;
