import { Loader2 } from 'lucide-react';

export default function EmbeddingsLoading() {
    return (
        <div className="flex flex-col h-full bg-neutral-50 p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-64 bg-neutral-200 rounded mt-2 animate-pulse" />
                </div>
                <div className="h-10 w-36 bg-neutral-200 rounded-lg animate-pulse" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="p-6 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                        <p className="text-neutral-500 text-sm">Loading documents...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
