import axios from 'axios';
import { SERVER_URL } from '../utils/constants';
import { Poll, PollResults } from '../types';

const api = axios.create({
    baseURL: `${SERVER_URL}/api`,
    timeout: 10000,
});

export const pollApi = {
    getActivePoll: async (): Promise<{ poll: Poll | null }> => {
        const { data } = await api.get('/polls/active');
        return data;
    },

    getPollHistory: async (): Promise<{ polls: Poll[] }> => {
        const { data } = await api.get('/polls/history');
        return data;
    },

    getMyVote: async (pollId: string, sessionId: string): Promise<{ hasVoted: boolean; vote: any }> => {
        const { data } = await api.get(`/polls/${pollId}/my-vote`, {
            params: { sessionId },
        });
        return data;
    },

    validateName: async (name: string, role: string): Promise<{ isTaken: boolean; available: boolean }> => {
        const { data } = await api.post('/sessions/validate-name', { name, role });
        return data;
    },
};
