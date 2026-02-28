import React from 'react';
import { usePollTimer } from '../../hooks/usePollTimer';

interface PollTimerProps {
    endsAt: string | null;
    size?: 'sm' | 'md' | 'lg';
}

const PollTimer: React.FC<PollTimerProps> = ({ endsAt, size = 'md' }) => {
    const { remainingSeconds, isExpired, formattedTime } = usePollTimer(endsAt);

    const isWarning = remainingSeconds <= 10 && remainingSeconds > 0;

    const sizeStyles = {
        sm: 'text-lg px-3 py-1.5',
        md: 'text-2xl px-5 py-2.5',
        lg: 'text-4xl px-8 py-4',
    };

    if (!endsAt) return null;

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className={`font-mono font-bold rounded-xl inline-flex items-center justify-center
                    ${sizeStyles[size]}
                    ${isExpired
                        ? 'bg-gray-100 text-gray-400'
                        : isWarning
                            ? 'bg-red-50 text-red-600 timer-warning border-2 border-red-200'
                            : 'bg-primary-50 text-primary-700 border-2 border-primary-200'
                    }
                    transition-all duration-300`}
            >
                {isExpired ? (
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Time's Up!
                    </span>
                ) : (
                    formattedTime
                )}
            </div>
            {!isExpired && (
                <span className="text-xs text-gray-500 font-medium">
                    {isWarning ? '⚡ Hurry up!' : 'Time remaining'}
                </span>
            )}
        </div>
    );
};

export default PollTimer;
