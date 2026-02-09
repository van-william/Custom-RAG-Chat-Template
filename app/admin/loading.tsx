import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center h-full bg-neutral-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-neutral-500 text-sm">Loading admin dashboard...</p>
            </div>
        </div>
    );
}
