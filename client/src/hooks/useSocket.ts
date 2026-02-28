import { useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useSocketContext } from '../context/SocketContext';

export const useSocket = () => {
    const { socket, isConnected } = useSocketContext();

    const on = useCallback(
        (event: string, handler: (...args: any[]) => void) => {
            socket?.on(event, handler);
        },
        [socket]
    );

    const off = useCallback(
        (event: string, handler?: (...args: any[]) => void) => {
            if (handler) {
                socket?.off(event, handler);
            } else {
                socket?.off(event);
            }
        },
        [socket]
    );

    const emit = useCallback(
        (event: string, data?: any) => {
            socket?.emit(event, data);
        },
        [socket]
    );

    return { socket, isConnected, on, off, emit };
};

// Hook to subscribe to a socket event with automatic cleanup
export const useSocketEvent = (
    event: string,
    handler: (...args: any[]) => void,
    deps: any[] = []
) => {
    const { socket } = useSocketContext();
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        if (!socket) return;

        const wrappedHandler = (...args: any[]) => handlerRef.current(...args);
        socket.on(event, wrappedHandler);

        return () => {
            socket.off(event, wrappedHandler);
        };
    }, [socket, event]);
};
