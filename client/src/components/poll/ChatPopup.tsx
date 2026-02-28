import React, { useState, useRef, useEffect } from 'react';
import { useSocket, useSocketEvent } from '../../hooks/useSocket';
import { useUserContext } from '../../context/UserContext';
import { ChatMessage } from '../../types';

const ChatPopup: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [unread, setUnread] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { emit } = useSocket();
    const { name, role } = useUserContext();

    useSocketEvent('chat:message', (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
        if (!isOpen) {
            setUnread((prev) => prev + 1);
        }
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        emit('chat:message', { message: input.trim() });
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setUnread(0);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat window */}
            {isOpen && (
                <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slide-up" style={{ height: '400px' }}>
                    {/* Header */}
                    <div className="bg-primary text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
                        <span className="font-semibold text-sm">💬 Live Chat</span>
                        <button onClick={toggleChat} className="text-white/80 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                        {messages.length === 0 && (
                            <p className="text-center text-gray-400 text-xs mt-8">No messages yet. Say hello! 👋</p>
                        )}
                        {messages.map((msg, i) => {
                            const isMine = msg.sender === name;
                            return (
                                <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-xl px-3 py-2 ${isMine
                                        ? 'bg-primary text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                        }`}>
                                        {!isMine && (
                                            <p className={`text-[10px] font-semibold mb-0.5 ${msg.role === 'teacher' ? 'text-primary' : 'text-gray-500'}`}>
                                                {msg.sender} {msg.role === 'teacher' ? '👨‍🏫' : ''}
                                            </p>
                                        )}
                                        <p className="text-sm break-words">{msg.message}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 flex-shrink-0 bg-white">
                        <div className="flex items-center gap-2">
                            <input
                                id="chat-input"
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-40"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FAB */}
            <button
                id="chat-toggle-btn"
                onClick={toggleChat}
                className="w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center relative"
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
                {unread > 0 && !isOpen && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>
        </div>
    );
};

export default ChatPopup;
