import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { pollApi } from '../api/pollApi';

const NameEntryPage: React.FC = () => {
    const navigate = useNavigate();
    const { role, setName, isLoggedIn } = useUserContext();
    const [nameInput, setNameInput] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in
    React.useEffect(() => {
        if (isLoggedIn && role) {
            navigate(`/${role}`);
        }
    }, [isLoggedIn, role, navigate]);

    // Redirect back if no role selected
    React.useEffect(() => {
        if (!role) {
            navigate('/');
        }
    }, [role, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = nameInput.trim();

        if (!trimmed) {
            setError('Please enter your name');
            return;
        }
        if (trimmed.length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { isTaken } = await pollApi.validateName(trimmed, role!);
            if (isTaken) {
                setError('This name is already taken. Please choose another.');
                setIsLoading(false);
                return;
            }
            setName(trimmed);
            navigate(`/${role}`);
        } catch (err) {
            setError('Connection error. Please try again.');
            setIsLoading(false);
        }
    };

    const isTeacher = role === 'teacher';

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark p-4">
            <div className="max-w-md w-full space-y-6">
                {/* Intervue Poll Badge */}
                <div className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                    <span className="text-sm">⚡</span> Intervue Poll
                </div>

                {/* Heading */}
                <div>
                    <h1 className="text-3xl text-white">
                        Let's <span className="font-bold">Get Started</span>
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                        {isTeacher
                            ? "you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time."
                            : "If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates."
                        }
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name-input" className="block text-sm font-medium text-gray-300 mb-2">
                            Enter your Name
                        </label>
                        <input
                            id="name-input"
                            type="text"
                            placeholder={isTeacher ? "e.g., Rahul Bajaj" : "e.g., Rahul Bajaj"}
                            value={nameInput}
                            onChange={(e) => {
                                setNameInput(e.target.value);
                                setError('');
                            }}
                            autoFocus
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        />
                        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                    </div>

                    <button
                        id="name-submit-btn"
                        type="submit"
                        disabled={isLoading}
                        className="px-10 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                        {isLoading ? 'Checking...' : 'Continue'}
                    </button>
                </form>

                <button
                    onClick={() => navigate('/')}
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                    ← Back to role selection
                </button>
            </div>
        </div>
    );
};

export default NameEntryPage;
