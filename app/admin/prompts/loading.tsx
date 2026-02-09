export default function Loading() {
    return (
        <div className="flex flex-col h-full bg-neutral-50 p-8">
            <div className="mb-8">
                <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-96 bg-neutral-100 rounded animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 h-48 animate-pulse">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-6 w-32 bg-neutral-100 rounded" />
                            <div className="h-6 w-16 bg-neutral-100 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-neutral-50 rounded" />
                            <div className="h-4 w-3/4 bg-neutral-50 rounded" />
                            <div className="h-4 w-1/2 bg-neutral-50 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
