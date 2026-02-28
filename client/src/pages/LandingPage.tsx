import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { setRole, isLoggedIn, role } = useUserContext();
    const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);

    // If already logged in, redirect to dashboard
    React.useEffect(() => {
        if (isLoggedIn && role) {
            navigate(`/${role}`);
        }
    }, [isLoggedIn, role, navigate]);

    const handleContinue = () => {
        if (!selectedRole) return;
        setRole(selectedRole);
        navigate('/name');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark p-4">
            <div className="max-w-lg w-full text-center space-y-8">
                {/* Intervue Poll Badge */}
                <div className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                    <span className="text-sm">⚡</span> Intervue Poll
                </div>

                {/* Heading */}
                <div>
                    <h1 className="text-3xl text-white">
                        Welcome to the <span className="font-bold">Live Polling System</span>
                    </h1>
                    <p className="text-gray-400 mt-3 text-sm">
                        Please select the role that best describes you to begin using the live polling system
                    </p>
                </div>

                {/* Role Cards - Side by Side */}
                <div className="flex gap-4 justify-center">
                    {/* Student Card */}
                    <button
                        id="role-student-btn"
                        onClick={() => setSelectedRole('student')}
                        className={`flex-1 max-w-[220px] p-5 rounded-xl border-2 text-left transition-all duration-200 bg-white
                            ${selectedRole === 'student'
                                ? 'border-primary shadow-lg shadow-primary/20'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <h3 className="font-bold text-dark text-base">I'm a Student</h3>
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </p>
                    </button>

                    {/* Teacher Card */}
                    <button
                        id="role-teacher-btn"
                        onClick={() => setSelectedRole('teacher')}
                        className={`flex-1 max-w-[220px] p-5 rounded-xl border-2 text-left transition-all duration-200 bg-white
                            ${selectedRole === 'teacher'
                                ? 'border-primary shadow-lg shadow-primary/20'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <h3 className="font-bold text-dark text-base">I'm a Teacher</h3>
                        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                            Submit answers and view live poll results in real-time.
                        </p>
                    </button>
                </div>

                {/* Continue Button */}
                <button
                    id="continue-btn"
                    onClick={handleContinue}
                    disabled={!selectedRole}
                    className={`px-10 py-3 rounded-full text-white font-semibold text-sm transition-all duration-200
                        ${selectedRole
                            ? 'bg-primary hover:bg-primary-dark shadow-md hover:shadow-lg cursor-pointer'
                            : 'bg-primary/50 cursor-not-allowed'
                        }`}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
