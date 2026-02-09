import { Loader2 } from 'lucide-react';

export default function ListsLoading() {
    return (
        <div className="bg-neutral-50 min-h-full p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <div className="h-8 w-40 bg-neutral-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-72 bg-neutral-200 rounded mt-2 animate-pulse" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[0, 1].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-neutral-200 h-[400px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                                <p className="text-neutral-500 text-sm">Loading list...</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
