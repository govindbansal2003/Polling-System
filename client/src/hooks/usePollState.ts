import { useState, useCallback } from 'react';
import { Poll, PollResults, PollPhase } from '../types';

interface UsePollStateReturn {
    phase: PollPhase;
    currentPoll: Poll | null;
    results: PollResults | null;
    selectedOption: number | null;
    votedOptionIndex: number;
    setPhase: (phase: PollPhase) => void;
    setCurrentPoll: (poll: Poll | null) => void;
    setResults: (results: PollResults | null) => void;
    setSelectedOption: (index: number | null) => void;
    setVotedOptionIndex: (index: number) => void;
    resetPollState: () => void;
}

export const usePollState = (): UsePollStateReturn => {
    const [phase, setPhase] = useState<PollPhase>('idle');
    const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
    const [results, setResults] = useState<PollResults | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [votedOptionIndex, setVotedOptionIndex] = useState<number>(-1);

    const resetPollState = useCallback(() => {
        setPhase('idle');
        setCurrentPoll(null);
        setResults(null);
        setSelectedOption(null);
        setVotedOptionIndex(-1);
    }, []);

    return {
        phase,
        currentPoll,
        results,
        selectedOption,
        votedOptionIndex,
        setPhase,
        setCurrentPoll,
        setResults,
        setSelectedOption,
        setVotedOptionIndex,
        resetPollState,
    };
};
