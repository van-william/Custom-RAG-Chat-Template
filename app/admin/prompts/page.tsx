'use client';

import { useState, useEffect, useTransition } from 'react';
import { FileText, Save, Info, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type Prompt = {
    id: string;
    prompt_key: string;
    version: number;
    content: string;
    is_active: boolean;
};

export default function PromptsPage() {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, startSaving] = useTransition();
    const [saveStatus, setSaveStatus] = useState<{ key: string; status: 'success' | 'error' | null }>({ key: '', status: null });

    useEffect(() => {
        fetch('/api/admin/prompts')
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setPrompts(data.prompts || []);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = (promptKey: string, newContent: string) => {
        startSaving(async () => {
            setSaveStatus({ key: promptKey, status: null });
            try {
                const res = await fetch('/api/admin/prompts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: promptKey, content: newContent }),
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setSaveStatus({ key: promptKey, status: 'success' });
                // Update local state
                setPrompts(prev => prev.map(p => p.prompt_key === promptKey ? { ...p, content: newContent, version: data.version } : p));
            } catch (e: any) {
                setSaveStatus({ key: promptKey, status: 'error' });
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-neutral-400" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-red-600">
                <AlertCircle className="inline mr-2" /> Error: {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-neutral-50 p-8 overflow-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-900">System Prompts</h1>
                <p className="text-neutral-500 mt-1">
                    Define the AI's personality and behavior rules. Changes take effect immediately.
                </p>
            </div>

            <div className="space-y-8">
                <PromptCard
                    title="User Chat Prompt"
                    description="This is the system prompt for the public /chat interface. It instructs the AI how to respond to users."
                    promptKey="user_chat"
                    prompt={prompts.find(p => p.prompt_key === 'user_chat')}
                    onSave={handleSave}
                    saving={saving}
                    saveStatus={saveStatus}
                />
                <PromptCard
                    title="Admin Chat Prompt"
                    description="This is the system prompt for /admin/chat. It defines how the Admin Agent behaves and what tools it can use."
                    promptKey="admin_chat"
                    prompt={prompts.find(p => p.prompt_key === 'admin_chat')}
                    onSave={handleSave}
                    saving={saving}
                    saveStatus={saveStatus}
                />
                <PromptCard
                    title="Transcript Extraction Prompt"
                    description="Instructions for the AI that converts raw transcripts into structured facts. This controls how facts are identified, titled, and scoped."
                    promptKey="transcript_extractor"
                    prompt={prompts.find(p => p.prompt_key === 'transcript_extractor')}
                    onSave={handleSave}
                    saving={saving}
                    saveStatus={saveStatus}
                />
            </div>
        </div>
    );
}

function PromptCard({
    title,
    description,
    promptKey,
    prompt,
    onSave,
    saving,
    saveStatus,
}: {
    title: string;
    description: string;
    promptKey: string;
    prompt?: Prompt;
    onSave: (key: string, content: string) => void;
    saving: boolean;
    saveStatus: { key: string; status: 'success' | 'error' | null };
}) {
    const [content, setContent] = useState(prompt?.content || '');
    const isThisOne = saveStatus.key === promptKey;
    const hasChanges = content !== (prompt?.content || '');

    useEffect(() => {
        if (prompt?.content) setContent(prompt.content);
    }, [prompt?.content]);

    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                        <FileText size={18} className="text-indigo-500" />
                        {title}
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1 flex items-center gap-1">
                        <Info size={14} /> {description}
                    </p>
                </div>
                {prompt && prompt.version > 0 ? (
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                        v{prompt.version}
                    </span>
                ) : (
                    <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full border border-amber-200">
                        New / Default
                    </span>
                )}
            </div>

            <textarea
                className="w-full h-48 p-4 border border-neutral-200 rounded-lg text-sm font-mono bg-neutral-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all resize-none"
                value={content}
                placeholder={!prompt ? "Enter prompt content to override default..." : undefined}
                onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm">
                    {isThisOne && saveStatus.status === 'success' && (
                        <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle size={14} /> Saved!
                        </span>
                    )}
                    {isThisOne && saveStatus.status === 'error' && (
                        <span className="text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} /> Error saving.
                        </span>
                    )}
                </div>
                <button
                    onClick={() => onSave(promptKey, content)}
                    disabled={saving || !hasChanges}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 disabled:bg-neutral-300 disabled:text-neutral-500 transition-colors"
                >
                    {saving && isThisOne ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {prompt ? 'Save Changes' : 'Create Prompt'}
                </button>
            </div>
        </div>
    );
}
