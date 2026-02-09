export default function TranscriptsLoading() {
    return (
        <div className="flex flex-col h-full bg-neutral-50 p-8 overflow-y-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-neutral-200 rounded animate-pulse" />
                <div>
                    <div className="w-48 h-7 bg-neutral-200 rounded animate-pulse mb-1" />
                    <div className="w-64 h-4 bg-neutral-200 rounded animate-pulse" />
                </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-8">
                <div className="w-40 h-5 bg-neutral-200 rounded animate-pulse mb-4" />
                <div className="space-y-4">
                    <div className="h-10 bg-neutral-100 rounded animate-pulse" />
                    <div className="h-32 bg-neutral-100 rounded animate-pulse" />
                </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl">
                <div className="px-6 py-4 border-b border-neutral-100">
                    <div className="w-32 h-5 bg-neutral-200 rounded animate-pulse" />
                </div>
                <div className="divide-y divide-neutral-100">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4">
                            <div className="w-9 h-9 bg-neutral-200 rounded-lg animate-pulse" />
                            <div className="flex-1">
                                <div className="w-48 h-4 bg-neutral-200 rounded animate-pulse mb-1" />
                                <div className="w-32 h-3 bg-neutral-200 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
