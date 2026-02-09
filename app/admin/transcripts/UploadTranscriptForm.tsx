'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTranscript } from './actions';
import { Upload, Loader2 } from 'lucide-react';

export function UploadTranscriptForm() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const id = await createTranscript(title.trim(), content.trim());
            router.push(`/admin/transcripts/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload');
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Client Call - Lincoln Park Tour"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Transcript Content
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste the transcript here..."
                    rows={8}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                    disabled={isLoading}
                />
                <p className="text-xs text-neutral-400 mt-1">
                    {content.length.toLocaleString()} characters
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading || !title.trim() || !content.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                    </>
                ) : (
                    <>
                        <Upload className="w-4 h-4" />
                        Upload Transcript
                    </>
                )}
            </button>
        </form>
    );
}
