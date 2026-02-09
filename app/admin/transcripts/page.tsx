import { getTranscripts } from './actions';
import { FileText, Plus, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { UploadTranscriptForm } from './UploadTranscriptForm';

export default async function TranscriptsPage() {
    const transcripts = await getTranscripts();

    const statusConfig = {
        pending: { icon: Clock, color: 'text-neutral-500', bg: 'bg-neutral-100' },
        processing: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-100' },
        extracted: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
        published: { icon: CheckCircle, color: 'text-indigo-500', bg: 'bg-indigo-100' },
        failed: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100' },
    };

    return (
        <div className="flex flex-col h-full bg-neutral-50 p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Transcript Ingestion</h1>
                        <p className="text-sm text-neutral-500">Upload transcripts to extract knowledge for embeddings</p>
                    </div>
                </div>
            </div>

            {/* Upload Form */}
            <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Upload New Transcript</h2>
                <UploadTranscriptForm />
            </div>

            {/* Transcripts List */}
            <div className="bg-white border border-neutral-200 rounded-xl">
                <div className="px-6 py-4 border-b border-neutral-100">
                    <h2 className="font-semibold text-neutral-900">All Transcripts</h2>
                </div>

                {transcripts.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No transcripts yet. Upload one above to get started.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {transcripts.map((t) => {
                            const config = statusConfig[t.status];
                            const StatusIcon = config.icon;

                            return (
                                <Link
                                    key={t.id}
                                    href={`/admin/transcripts/${t.id}`}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors"
                                >
                                    <div className={`p-2 rounded-lg ${config.bg}`}>
                                        <StatusIcon className={`w-5 h-5 ${config.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-neutral-900 truncate">{t.title}</p>
                                        <p className="text-sm text-neutral-500">
                                            {new Date(t.created_at).toLocaleDateString()} •
                                            {t.raw_content.length.toLocaleString()} chars
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                                        {t.status}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
