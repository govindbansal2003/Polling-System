import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SocketProvider } from './context/SocketContext';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <UserProvider>
            <SocketProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </SocketProvider>
        </UserProvider>
    </React.StrictMode>
);
