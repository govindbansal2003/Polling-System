import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface UserContextType {
    sessionId: string;
    name: string;
    role: 'teacher' | 'student' | null;
    setName: (name: string) => void;
    setRole: (role: 'teacher' | 'student') => void;
    isLoggedIn: boolean;
    logout: () => void;
}

const UserContext = createContext<UserContextType>({
    sessionId: '',
    name: '',
    role: null,
    setName: () => { },
    setRole: () => { },
    isLoggedIn: false,
    logout: () => { },
});

export const useUserContext = () => useContext(UserContext);

// Generate or retrieve sessionId from sessionStorage
const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('poll_sessionId');
    if (!sessionId) {
        sessionId = uuidv4();
        sessionStorage.setItem('poll_sessionId', sessionId);
    }
    return sessionId;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sessionId] = useState<string>(getSessionId());
    const [name, setNameState] = useState<string>(() => sessionStorage.getItem('poll_name') || '');
    const [role, setRoleState] = useState<'teacher' | 'student' | null>(
        () => (sessionStorage.getItem('poll_role') as 'teacher' | 'student') || null
    );

    const setName = useCallback((newName: string) => {
        setNameState(newName);
        sessionStorage.setItem('poll_name', newName);
    }, []);

    const setRole = useCallback((newRole: 'teacher' | 'student') => {
        setRoleState(newRole);
        sessionStorage.setItem('poll_role', newRole);
    }, []);

    const isLoggedIn = !!name && !!role;

    const logout = useCallback(() => {
        setNameState('');
        setRoleState(null);
        sessionStorage.removeItem('poll_name');
        sessionStorage.removeItem('poll_role');
        sessionStorage.removeItem('poll_sessionId');
    }, []);

    return (
        <UserContext.Provider value={{ sessionId, name, role, setName, setRole, isLoggedIn, logout }}>
            {children}
        </UserContext.Provider>
    );
};
