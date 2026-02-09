'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Send, User, Bot, MapPin, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { InlineAuthPrompt } from '@/components/auth/AuthBanner';

export default function ChatPage() {
    // Local state for input (AI SDK 5.0+ no longer manages input internally)
    const [input, setInput] = useState('');

    // Create transport instance (memoized to avoid recreating on each render)
    const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), []);

    const {
        messages,
        sendMessage,
        status,
        error,
        clearError,
    } = useChat({ transport });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isLoading = status === 'streaming' || status === 'submitted';

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        // Clear input immediately for better UX
        setInput('');

        try {
            await sendMessage({ text: trimmedInput });
        } catch {
            // Restore input on error
            setInput(trimmedInput);
        }

        // Refocus input after sending (like ChatGPT/Gemini)
        inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-neutral-900 text-neutral-100 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <header className="flex-none p-4 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10 safe-area-inset-top">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="font-bold text-white text-xs">AI</span>
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg tracking-tight">AI Assistant</h1>
                        <p className="text-xs text-neutral-400">Powered by RAG</p>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth overscroll-contain">
                <div className="max-w-3xl mx-auto space-y-6 pb-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Bot className="w-12 h-12 mb-4 text-indigo-500 opacity-60" />
                            <h2 className="text-xl font-medium mb-2 opacity-60">Welcome!</h2>
                            <p className="text-sm text-neutral-400 max-w-sm opacity-60">
                                Ask me anything about the knowledge base.
                            </p>
                            <InlineAuthPrompt />
                        </div>
                    )}

                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={cn(
                                'flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300',
                                m.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            <div
                                className={cn(
                                    'flex max-w-[85%] md:max-w-[75%] gap-3',
                                    m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                )}
                            >
                                {/* Avatar */}
                                <div
                                    className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
                                        m.role === 'user' ? 'bg-neutral-700' : 'bg-indigo-600'
                                    )}
                                >
                                    {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>

                                {/* Bubble */}
                                <div
                                    className={cn(
                                        'p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap',
                                        m.role === 'user'
                                            ? 'bg-neutral-800 text-neutral-100 rounded-tr-sm'
                                            : 'bg-neutral-800/50 border border-neutral-700/50 text-neutral-100 rounded-tl-sm'
                                    )}
                                >
                                    {/* Use parts if available, otherwise fallback to content */}
                                    {m.parts?.map((part, idx) =>
                                        part.type === 'text' ? <span key={idx}>{part.text}</span> : null
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Error Display */}
                    {error && (
                        <div className="flex justify-center">
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-3 max-w-md">
                                <AlertCircle size={18} className="flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium">Something went wrong</p>
                                    <p className="text-xs opacity-70 mt-0.5">{error.message}</p>
                                </div>
                                <button
                                    onClick={() => clearError()}
                                    className="text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}

                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex justify-start w-full animate-pulse">
                            <div className="flex max-w-[85%] md:max-w-[75%] gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot size={14} />
                                </div>
                                <div className="bg-neutral-800/50 border border-neutral-700/50 p-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="flex-none p-4 bg-neutral-900 border-t border-neutral-800 safe-area-inset-bottom">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={onSubmit} className="relative flex items-center">
                        <input
                            ref={inputRef}
                            className="w-full bg-neutral-800 text-white placeholder-neutral-500 border border-neutral-700 hover:border-neutral-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-full py-3.5 pl-5 pr-14 outline-none transition-all shadow-sm text-base"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Ask a question..."
                            disabled={isLoading}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-full transition-colors shadow-lg shadow-indigo-500/20"
                            aria-label="Send message"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-medium">
                            Powered by RAG Template
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
