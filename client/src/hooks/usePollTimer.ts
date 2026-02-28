import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePollTimerReturn {
    remainingSeconds: number;
    isExpired: boolean;
    formattedTime: string;
}

export const usePollTimer = (endsAt: string | null): UsePollTimerReturn => {
    const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const calculateRemaining = useCallback(() => {
        if (!endsAt) return 0;
        const remaining = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
        return remaining;
    }, [endsAt]);

    useEffect(() => {
        if (!endsAt) {
            setRemainingSeconds(0);
            return;
        }

        // Set initial value
        setRemainingSeconds(calculateRemaining());

        // Update every second
        intervalRef.current = setInterval(() => {
            const remaining = calculateRemaining();
            setRemainingSeconds(remaining);

            if (remaining <= 0 && intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [endsAt, calculateRemaining]);

    const isExpired = remainingSeconds <= 0 && !!endsAt;

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return { remainingSeconds, isExpired, formattedTime };
};
