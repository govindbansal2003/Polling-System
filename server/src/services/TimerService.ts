import { Poll } from '../models/Poll';

export class TimerService {
    private timers: Map<string, NodeJS.Timeout> = new Map();

    startTimer(pollId: string, endsAt: Date, onExpiry: () => void): void {
        // Clear any existing timer for this poll
        this.cancelTimer(pollId);

        const now = Date.now();
        const remaining = endsAt.getTime() - now;

        if (remaining <= 0) {
            // Already expired, trigger immediately
            onExpiry();
            return;
        }

        const timer = setTimeout(() => {
            this.timers.delete(pollId);
            onExpiry();
        }, remaining);

        this.timers.set(pollId, timer);
    }

    getRemainingMs(endsAt: Date): number {
        return Math.max(0, endsAt.getTime() - Date.now());
    }

    cancelTimer(pollId: string): void {
        const timer = this.timers.get(pollId);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(pollId);
        }
    }

    isTimerActive(pollId: string): boolean {
        return this.timers.has(pollId);
    }
}

export const timerService = new TimerService();
