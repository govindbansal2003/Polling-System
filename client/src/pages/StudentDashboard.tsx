import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { useSocket, useSocketEvent } from '../hooks/useSocket';
import { useToastContext } from '../context/ToastContext';
import { usePollState } from '../hooks/usePollState';
import { useStateRecovery } from '../hooks/useStateRecovery';
import { usePollTimer } from '../hooks/usePollTimer';
import { SOCKET_EVENTS } from '../utils/constants';
import { Poll, PollResults as PollResultsType } from '../types';
import PollResults from '../components/poll/PollResults';
import ChatPopup from '../components/poll/ChatPopup';
import Toast from '../components/common/Toast';

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { name, role, sessionId, isLoggedIn, logout } = useUserContext();
    const { emit, isConnected } = useSocket();
    const { showToast } = useToastContext();
    const {
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
    } = usePollState();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRecovering, setIsRecovering] = useState(true);
    const [kicked, setKicked] = useState(false);

    const { formattedTime, remainingSeconds } = usePollTimer(
        currentPoll?.endsAt || null
    );

    // Redirect if not logged in as student
    useEffect(() => {
        if (!isLoggedIn || role !== 'student') {
            navigate('/');
        }
    }, [isLoggedIn, role, navigate]);

    // Join session on mount
    useEffect(() => {
        if (isConnected && sessionId && name && role === 'student') {
            emit(SOCKET_EVENTS.SESSION_JOIN, { sessionId, name, role });
        }
    }, [isConnected, sessionId, name, role, emit]);

    // State recovery
    useStateRecovery({
        onRecovered: (state) => {
            if (state.activePoll) {
                setCurrentPoll(state.activePoll);
                if (state.hasVoted) {
                    setVotedOptionIndex(state.votedOptionIndex);
                    setPhase('voted');
                    if (state.results) {
                        setResults(state.results);
                    }
                } else {
                    setPhase('active');
                }
            }
            setIsRecovering(false);
        },
    });

    // Socket events
    useSocketEvent(SOCKET_EVENTS.POLL_NEW, (data: { poll: Poll }) => {
        resetPollState();
        setCurrentPoll(data.poll);
        setPhase('active');
        showToast('New poll available! 📊', 'info');
    });

    useSocketEvent(SOCKET_EVENTS.POLL_VOTE_ACK, (data: { success: boolean; error?: string }) => {
        setIsSubmitting(false);
        if (data.success) {
            setVotedOptionIndex(selectedOption!);
            setPhase('voted');
            showToast('Vote submitted! ✅', 'success');
        } else {
            showToast(data.error || 'Vote failed', 'error');
        }
    });

    useSocketEvent(SOCKET_EVENTS.POLL_RESULTS_UPDATE, (data: { results: PollResultsType }) => {
        setResults(data.results);
    });

    useSocketEvent(SOCKET_EVENTS.POLL_COMPLETED, (data: { poll: Poll; results: PollResultsType }) => {
        setCurrentPoll(data.poll);
        setResults(data.results);
        setPhase('results');
        showToast('Poll has ended! 📊', 'info');
    });

    useSocketEvent(SOCKET_EVENTS.SESSION_KICKED, () => {
        setKicked(true);
    });

    const handleVote = useCallback(() => {
        if (selectedOption === null || !currentPoll) return;
        setIsSubmitting(true);
        emit(SOCKET_EVENTS.POLL_VOTE, {
            pollId: currentPoll._id,
            optionIndex: selectedOption,
        });
    }, [selectedOption, currentPoll, emit]);

    // Kicked out screen
    if (kicked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark p-4">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                        <span className="text-sm">⚡</span> Intervue Poll
                    </div>
                    <h1 className="text-2xl font-bold text-white">You've been Kicked out !</h1>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                        Looks like the teacher had removed you from the poll system. Please try again sometime.
                    </p>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                        className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-semibold transition-all mt-4"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (isRecovering) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                        <span className="text-sm">⚡</span> Intervue Poll
                    </div>
                    <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full spinner mx-auto" />
                    <p className="text-gray-400 text-sm">Recovering session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark text-white">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Idle / Waiting state */}
                {phase === 'idle' && (
                    <div className="text-center py-16 space-y-4">
                        <div className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                            <span className="text-sm">⚡</span> Intervue Poll
                        </div>
                        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full spinner mx-auto" />
                        <h2 className="text-xl text-white">Wait for the teacher to ask questions..</h2>
                    </div>
                )}

                {/* Active poll - question view */}
                {phase === 'active' && currentPoll && (
                    <div className="space-y-5">
                        {/* Header with question number & timer */}
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold">Question 1</h2>
                            <div className={`flex items-center gap-1.5 text-sm font-mono ${remainingSeconds <= 10 ? 'text-red-400' : 'text-gray-400'}`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formattedTime}
                            </div>
                        </div>

                        {/* Question */}
                        <div className="bg-primary rounded-xl p-4">
                            <p className="text-white font-medium">{currentPoll.question}</p>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            {currentPoll.options.map((option, index) => {
                                const isSelected = selectedOption === index;
                                return (
                                    <button
                                        key={index}
                                        id={`poll-option-${index}`}
                                        onClick={() => setSelectedOption(index)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3
                                            ${isSelected
                                                ? 'border-primary bg-primary/10'
                                                : 'border-gray-700 bg-dark-light hover:border-gray-500'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                            ${isSelected ? 'border-primary' : 'border-gray-500'}`}
                                        >
                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                        <span className={`text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>{option.text}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Submit */}
                        <div className="text-right">
                            <button
                                id="submit-vote-btn"
                                onClick={handleVote}
                                disabled={selectedOption === null || isSubmitting}
                                className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-semibold transition-all disabled:opacity-40"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Voted - show results */}
                {phase === 'voted' && currentPoll && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold">Question 1</h2>
                            <div className={`flex items-center gap-1.5 text-sm font-mono ${remainingSeconds <= 10 ? 'text-red-400' : 'text-gray-400'}`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formattedTime}
                            </div>
                        </div>

                        {results ? (
                            <PollResults
                                results={results}
                                endsAt={currentPoll.endsAt}
                                votedIndex={votedOptionIndex}
                                isCompleted={false}
                            />
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-primary rounded-xl p-4">
                                    <p className="text-white font-medium">{currentPoll.question}</p>
                                </div>
                                <p className="text-gray-400 text-center">Your vote has been submitted. Waiting for results...</p>
                            </div>
                        )}

                        <p className="text-gray-500 text-sm text-center">Wait for the teacher to ask a new question.</p>
                    </div>
                )}

                {/* Final results */}
                {phase === 'results' && results && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold">Question 1</h2>
                            <div className="flex items-center gap-1.5 text-sm font-mono text-red-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formattedTime}
                            </div>
                        </div>

                        <PollResults
                            results={results}
                            votedIndex={votedOptionIndex >= 0 ? votedOptionIndex : undefined}
                            isCompleted={true}
                        />

                        <p className="text-gray-500 text-sm text-center">Wait for the teacher to ask a new question.</p>
                    </div>
                )}
            </div>

            {/* Chat popup */}
            <ChatPopup />

            {/* Toast container */}
            <Toast />
        </div>
    );
};

export default StudentDashboard;
