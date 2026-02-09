export default function Loading() {
    return (
        <div className="flex flex-col h-full bg-neutral-50 p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-neutral-200 animate-pulse" />
                <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-xl border border-neutral-200 p-8 animate-pulse">
                            <div className="h-6 w-1/3 bg-neutral-100 rounded mb-4" />
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-neutral-50 rounded" />
                                <div className="h-4 w-full bg-neutral-50 rounded" />
                                <div className="h-4 w-2/3 bg-neutral-50 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
                        <div className="h-6 w-1/2 bg-neutral-100 rounded mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-neutral-50" />
                                    <div className="h-4 w-24 bg-neutral-50 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
