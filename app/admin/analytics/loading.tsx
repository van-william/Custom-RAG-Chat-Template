export default function AnalyticsLoading() {
    return (
        <div className="flex flex-col h-full bg-neutral-50 p-8 overflow-y-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-neutral-200 rounded animate-pulse" />
                <div className="w-48 h-7 bg-neutral-200 rounded animate-pulse" />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
                        <div className="w-24 h-4 bg-neutral-200 rounded animate-pulse mb-2" />
                        <div className="w-16 h-8 bg-neutral-200 rounded animate-pulse" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <div className="w-48 h-5 bg-neutral-200 rounded animate-pulse mb-4" />
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-6 h-4 bg-neutral-200 rounded animate-pulse" />
                                <div className="flex-1 h-4 bg-neutral-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <div className="w-32 h-5 bg-neutral-200 rounded animate-pulse mb-4" />
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="border-l-2 border-neutral-200 pl-3 py-1">
                                <div className="h-4 bg-neutral-200 rounded animate-pulse mb-1" />
                                <div className="w-24 h-3 bg-neutral-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
