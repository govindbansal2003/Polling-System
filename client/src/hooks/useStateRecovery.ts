import { useEffect, useRef } from 'react';
import { useSocket } from './useSocket';
import { useUserContext } from '../context/UserContext';
import { SOCKET_EVENTS } from '../utils/constants';
import { RecoveryState } from '../types';

interface UseStateRecoveryOptions {
    onRecovered: (state: RecoveryState) => void;
}

export const useStateRecovery = ({ onRecovered }: UseStateRecoveryOptions) => {
    const { socket, isConnected } = useSocket();
    const { sessionId, name, role } = useUserContext();
    const hasRecovered = useRef(false);

    useEffect(() => {
        if (!socket || !isConnected || !sessionId || !name || !role) return;
        if (hasRecovered.current) return;

        // Re-join session first
        socket.emit(SOCKET_EVENTS.SESSION_JOIN, { sessionId, name, role });

        // Then request state recovery
        socket.emit(SOCKET_EVENTS.STATE_RECOVER, { sessionId });

        const handleRecovered = (state: RecoveryState) => {
            hasRecovered.current = true;
            onRecovered(state);
        };

        socket.on(SOCKET_EVENTS.STATE_RECOVERED, handleRecovered);

        return () => {
            socket.off(SOCKET_EVENTS.STATE_RECOVERED, handleRecovered);
        };
    }, [socket, isConnected, sessionId, name, role]);

    return { hasRecovered: hasRecovered.current };
};
