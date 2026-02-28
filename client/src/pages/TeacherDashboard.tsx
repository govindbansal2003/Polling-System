import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { useSocket, useSocketEvent } from '../hooks/useSocket';
import { useToastContext } from '../context/ToastContext';
import { usePollState } from '../hooks/usePollState';
import { useStateRecovery } from '../hooks/useStateRecovery';
import { SOCKET_EVENTS } from '../utils/constants';
import { Poll, PollResults as PollResultsType, StudentInfo } from '../types';
import PollForm from '../components/poll/PollForm';
import PollResults from '../components/poll/PollResults';
import PollHistory from '../components/poll/PollHistory';
import ChatPopup from '../components/poll/ChatPopup';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { name, role, sessionId, isLoggedIn, logout } = useUserContext();
    const { emit, isConnected } = useSocket();
    const { showToast } = useToastContext();
    const {
        phase,
        currentPoll,
        results,
        setPhase,
        setCurrentPoll,
        setResults,
        resetPollState,
    } = usePollState();

    const [students, setStudents] = useState<StudentInfo[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isRecovering, setIsRecovering] = useState(true);
    const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('participants');
    const [showHistory, setShowHistory] = useState(false);

    // Redirect if not logged in as teacher
    useEffect(() => {
        if (!isLoggedIn || role !== 'teacher') {
            navigate('/');
        }
    }, [isLoggedIn, role, navigate]);

    // Join session on mount
    useEffect(() => {
        if (isConnected && sessionId && name && role === 'teacher') {
            emit(SOCKET_EVENTS.SESSION_JOIN, { sessionId, name, role });
        }
    }, [isConnected, sessionId, name, role, emit]);

    // State recovery
    useStateRecovery({
        onRecovered: (state) => {
            if (state.activePoll) {
                setCurrentPoll(state.activePoll);
                if (state.results) {
                    setResults(state.results);
                }
                setPhase('active');
            }
            setIsRecovering(false);
        },
    });

    // Socket events
    useSocketEvent(SOCKET_EVENTS.POLL_CREATED, (data: { poll: Poll }) => {
        setCurrentPoll(data.poll);
        setPhase('active');
        setIsCreating(false);
        showToast('Poll created successfully!', 'success');
    });

    useSocketEvent(SOCKET_EVENTS.POLL_ERROR, (data: { error: string }) => {
        showToast(data.error, 'error');
        setIsCreating(false);
    });

    useSocketEvent(SOCKET_EVENTS.POLL_RESULTS_UPDATE, (data: { results: PollResultsType }) => {
        setResults(data.results);
    });

    useSocketEvent(SOCKET_EVENTS.POLL_COMPLETED, (data: { poll: Poll; results: PollResultsType }) => {
        setCurrentPoll(data.poll);
        setResults(data.results);
        setPhase('results');
        showToast('Poll has ended! Final results are in.', 'info');
    });

    useSocketEvent(SOCKET_EVENTS.STUDENT_JOINED, (data: { students: StudentInfo[]; count: number }) => {
        setStudents(data.students);
    });

    useSocketEvent(SOCKET_EVENTS.STUDENT_LEFT, (data: { students: StudentInfo[]; count: number }) => {
        setStudents(data.students);
    });

    const handleCreatePoll = useCallback(
        (question: string, options: string[], timerDuration: number) => {
            setIsCreating(true);
            emit(SOCKET_EVENTS.POLL_CREATE, { question, options, timerDuration });
        },
        [emit]
    );

    const handleKickStudent = useCallback(
        (studentSessionId: string) => {
            emit(SOCKET_EVENTS.STUDENT_KICK, { sessionId: studentSessionId });
            showToast('Student removed', 'info');
        },
        [emit, showToast]
    );

    const handleNewPoll = () => {
        resetPollState();
        setShowHistory(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (isRecovering) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark">
                <Loader message="Recovering session..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark text-white">
            {/* Main content */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex gap-6">
                    {/* Left - Poll Area */}
                    <div className="flex-1 space-y-6">
                        {/* Show poll history */}
                        {showHistory && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold">View <span className="font-bold">Poll History</span></h2>
                                </div>
                                <PollHistory />
                                <div className="text-center pt-2">
                                    <button
                                        onClick={handleNewPoll}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-semibold transition-all"
                                    >
                                        + Ask a new question
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Idle - show poll form */}
                        {!showHistory && phase === 'idle' && (
                            <PollForm
                                onSubmit={handleCreatePoll}
                                isLoading={isCreating}
                                disabled={!isConnected}
                            />
                        )}

                        {/* Active poll - show results */}
                        {!showHistory && (phase === 'active' || phase === 'voted') && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-300">Question</h3>
                                {results ? (
                                    <PollResults
                                        results={results}
                                        endsAt={currentPoll?.endsAt || null}
                                        isCompleted={false}
                                    />
                                ) : currentPoll ? (
                                    <div className="space-y-4">
                                        <div className="bg-primary rounded-xl p-4">
                                            <p className="text-white font-medium">{currentPoll.question}</p>
                                        </div>
                                        <p className="text-gray-400 text-center">Waiting for votes...</p>
                                    </div>
                                ) : null}
                                <div className="text-center pt-2">
                                    <button
                                        onClick={handleNewPoll}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-semibold transition-all"
                                    >
                                        + Ask a new question
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Completed - show final results */}
                        {!showHistory && phase === 'results' && results && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-300">Question</h3>
                                <PollResults
                                    results={results}
                                    isCompleted={true}
                                />
                                <div className="flex items-center justify-center gap-3 pt-2">
                                    <button
                                        onClick={() => setShowHistory(true)}
                                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-semibold transition-all flex items-center gap-2"
                                    >
                                        📋 View Poll History
                                    </button>
                                    <button
                                        onClick={handleNewPoll}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-sm font-semibold transition-all"
                                    >
                                        + Ask a new question
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right - Chat & Participants Panel */}
                    <div className="w-72 flex-shrink-0">
                        <div className="bg-dark-light rounded-xl border border-gray-700 overflow-hidden">
                            {/* Tab headers */}
                            <div className="flex border-b border-gray-700">
                                <button
                                    onClick={() => setActiveTab('chat')}
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'chat'
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    Chat
                                </button>
                                <button
                                    onClick={() => setActiveTab('participants')}
                                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'participants'
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    Participants
                                </button>
                            </div>

                            {/* Tab content */}
                            <div className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                                {activeTab === 'participants' ? (
                                    <div className="space-y-3">
                                        {students.length === 0 ? (
                                            <p className="text-gray-500 text-sm text-center py-8">No students connected yet</p>
                                        ) : (
                                            <>
                                                <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
                                                    <span>Name</span>
                                                    <span>Action</span>
                                                </div>
                                                {students.map((student) => (
                                                    <div key={student.sessionId} className="flex items-center justify-between py-1.5">
                                                        <span className="text-sm text-gray-200">{student.name}</span>
                                                        <button
                                                            onClick={() => handleKickStudent(student.sessionId)}
                                                            className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                                                        >
                                                            Kick out
                                                        </button>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-sm text-center py-8">
                                        Use the chat bubble below to chat
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat popup */}
            <ChatPopup />

            {/* Toast container */}
            <Toast />
        </div>
    );
};

export default TeacherDashboard;
