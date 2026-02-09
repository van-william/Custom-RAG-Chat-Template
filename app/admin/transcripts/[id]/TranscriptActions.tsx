'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { processTranscript, publishApprovedFacts, deleteTranscript } from '../actions';
import { Sparkles, Send, Trash2, Loader2 } from 'lucide-react';

interface TranscriptActionsProps {
    transcriptId: string;
    status: string;
    hasApprovedFacts: boolean;
}

export function TranscriptActions({ transcriptId, status, hasApprovedFacts }: TranscriptActionsProps) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleExtract = async () => {
        setIsProcessing(true);
        try {
            await processTranscript(transcriptId);
            router.refresh();
        } catch (err) {
            console.error('Extraction failed:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const [message, setMessage] = useState<{ text: string; type: 'success' | 'natural' | 'error' } | null>(null);

    const handlePublish = async () => {
        setIsPublishing(true);
        setMessage(null);
        try {
            const { count, debug } = await publishApprovedFacts(transcriptId);
            if (count > 0) {
                setMessage({ text: `Successfully published ${count} facts!`, type: 'success' });
            } else {
                setMessage({ text: `No new facts. ${debug || ''}`, type: 'natural' });
            }
            router.refresh();

            // Clear message after 3s
            setTimeout(() => setMessage(null), 4000);
        } catch (err) {
            console.error('Publish failed:', err);
            setMessage({ text: "Failed to publish.", type: 'error' });
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this transcript and all extracted facts?')) return;

        setIsDeleting(true);
        try {
            await deleteTranscript(transcriptId);
            router.push('/admin/transcripts');
        } catch (err) {
            console.error('Delete failed:', err);
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {status === 'pending' && (
                <button
                    onClick={handleExtract}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Extracting...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            Extract Facts
                        </>
                    )}
                </button>
            )}

            {(status === 'extracted' || status === 'published') && hasApprovedFacts && (
                <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                    {isPublishing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Publishing...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Publish to Embeddings
                        </>
                    )}
                </button>
            )}

            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete transcript"
            >
                {isDeleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Trash2 className="w-5 h-5" />
                )}
            </button>

            {message && (
                <span className={`text-sm font-medium animate-in fade-in slide-in-from-left-2 ${message.type === 'success' ? 'text-green-600' :
                    message.type === 'error' ? 'text-red-600' :
                        'text-neutral-500'
                    }`}>
                    {message.text}
                </span>
            )}
        </div>
    );
}
