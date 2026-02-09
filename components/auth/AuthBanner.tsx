'use client';

import { useUser, SignInButton } from '@clerk/nextjs';
import { LogIn, Sparkles, History } from 'lucide-react';

interface AuthBannerProps {
    variant?: 'minimal' | 'full';
    className?: string;
}

/**
 * A banner component that shows benefits of signing in.
 * Shows saving chat history, personalization, etc.
 */
export function AuthBanner({ variant = 'minimal', className = '' }: AuthBannerProps) {
    const { isSignedIn, isLoaded } = useUser();

    // Don't show if still loading or already signed in
    if (!isLoaded || isSignedIn) return null;

    if (variant === 'minimal') {
        return (
            <div className={`bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 ${className}`}>
                <SignInButton mode="modal">
                    <button className="w-full flex items-center justify-center gap-2 text-indigo-300 hover:text-indigo-200 transition-colors text-sm">
                        <LogIn size={16} />
                        <span>Sign in to save your chat history</span>
                    </button>
                </SignInButton>
            </div>
        );
    }

    return (
        <div className={`bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 ${className}`}>
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">Get more from Becker AI</h3>
                    <p className="text-sm text-neutral-400 mb-3">
                        Sign in to unlock personalized features
                    </p>
                    <ul className="space-y-1.5 text-sm text-neutral-300 mb-4">
                        <li className="flex items-center gap-2">
                            <History size={14} className="text-indigo-400" />
                            Save and access chat history
                        </li>
                        <li className="flex items-center gap-2">
                            <Sparkles size={14} className="text-indigo-400" />
                            Personalized recommendations
                        </li>
                    </ul>
                    <SignInButton mode="modal">
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            <LogIn size={16} />
                            Sign in
                        </button>
                    </SignInButton>
                </div>
            </div>
        </div>
    );
}

/**
 * A simple inline sign-in prompt for the chat welcome screen
 */
export function InlineAuthPrompt() {
    const { isSignedIn, isLoaded } = useUser();

    if (!isLoaded || isSignedIn) return null;

    return (
        <div className="mt-6">
            <SignInButton mode="modal">
                <button className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1.5 mx-auto transition-colors">
                    <LogIn size={14} />
                    <span>Sign in to save conversations</span>
                </button>
            </SignInButton>
        </div>
    );
}
