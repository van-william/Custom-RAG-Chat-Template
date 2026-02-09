import { getTranscriptWithFacts } from '../actions';
import { notFound } from 'next/navigation';
import { FileText, ArrowLeft, Check, X, Sparkles, Send } from 'lucide-react';
import Link from 'next/link';
import { TranscriptActions } from './TranscriptActions';
import { FactCard } from './FactCard';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TranscriptDetailPage({ params }: PageProps) {
    const { id } = await params;
    const data = await getTranscriptWithFacts(id);

    if (!data) {
        notFound();
    }

    const { transcript, facts } = data;
    const approvedCount = facts.filter(f => f.is_approved).length;
    const pendingCount = facts.filter(f => !f.is_approved && !f.is_rejected).length;

    return (
        <div className="flex flex-col h-full bg-neutral-50 p-8 overflow-y-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/admin/transcripts"
                    className="p-2 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-neutral-900">{transcript.title}</h1>
                    <p className="text-sm text-neutral-500">
                        Uploaded {new Date(transcript.created_at).toLocaleString()}
                    </p>
                </div>
                <TranscriptActions
                    transcriptId={transcript.id}
                    status={transcript.status}
                    hasApprovedFacts={approvedCount > 0}
                />
            </div>

            {/* Status Banner */}
            {transcript.status === 'pending' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <div className="flex-1">
                        <p className="font-medium text-amber-800">Ready to Extract</p>
                        <p className="text-sm text-amber-600">Click "Extract Facts" to use AI to identify knowledge from this transcript.</p>
                    </div>
                </div>
            )}

            {transcript.status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="font-medium text-red-800">Extraction Failed</p>
                    <p className="text-sm text-red-600">{transcript.error_message}</p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-6">
                {/* Raw Transcript */}
                <div className="col-span-1 bg-white border border-neutral-200 rounded-xl p-4">
                    <h2 className="font-semibold text-neutral-900 mb-3">Raw Transcript</h2>
                    <div className="max-h-[600px] overflow-y-auto">
                        <pre className="text-xs text-neutral-600 whitespace-pre-wrap font-mono">
                            {transcript.raw_content}
                        </pre>
                    </div>
                </div>

                {/* Extracted Facts */}
                <div className="col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-neutral-900">
                            Extracted Facts ({facts.length})
                        </h2>
                        {facts.length > 0 && (
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-green-600">
                                    <Check className="w-4 h-4" />
                                    {approvedCount} approved
                                </span>
                                <span className="text-neutral-400">
                                    {pendingCount} pending
                                </span>
                            </div>
                        )}
                    </div>

                    {facts.length === 0 ? (
                        <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
                            {transcript.status === 'pending' ? (
                                <>
                                    <Sparkles className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
                                    <p className="text-neutral-500">No facts extracted yet.</p>
                                    <p className="text-sm text-neutral-400">Click "Extract Facts" to begin.</p>
                                </>
                            ) : transcript.status === 'processing' ? (
                                <>
                                    <div className="w-10 h-10 mx-auto mb-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-neutral-500">Extracting facts...</p>
                                </>
                            ) : (
                                <p className="text-neutral-500">No facts were found in this transcript.</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {facts.map((fact) => (
                                <FactCard key={fact.id} fact={fact} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
