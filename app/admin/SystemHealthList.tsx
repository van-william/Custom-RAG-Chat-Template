
// Client component for health list to potentially handle polling or client-side visual states if needed, 
// though we'll keep it simple server-side first if possible. 
// Actually, to avoid slow page loads, it's better to fetch this async inside a Suspense or as a Client Component that fetches on mount.
// Let's make it a Client Component that calls the Server Action `checkSystemHealth`.

'use client';

import { useEffect, useState } from 'react';
import { checkSystemHealth } from './actions/health';
import { CheckCircle, XCircle, Loader2, Globe, Database, Bot } from 'lucide-react';

export default function SystemHealthList() {
    const [status, setStatus] = useState<{ supabase: boolean; llm: boolean; internet: boolean } | null>(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkSystemHealth()
            .then((res) => {
                if (res) setStatus(res);
            })
            .catch((e) => {
                console.error("System health check failed:", e);
                setError("Failed to load status");
            })
            .finally(() => setLoading(false));
    }, []);

    if (error) {
        return (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
                Unable to load system status. Please try refreshing.
            </div>
        );
    }

    const items = [
        { label: 'Internet Connectivity', key: 'internet', icon: Globe },
        { label: 'Supabase Database', key: 'supabase', icon: Database },
        { label: 'Gemini LLM (Google)', key: 'llm', icon: Bot },
    ] as const;

    return (
        <div className="grid md:grid-cols-3 gap-4">
            {items.map((item) => {
                const isHealthy = status ? status[item.key] : false;
                const Icon = item.icon;

                return (
                    <div key={item.key} className="bg-indigo-800/50 backdrop-blur-sm border border-indigo-700/50 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${loading ? 'bg-indigo-700/50' : isHealthy ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                <Icon size={18} />
                            </div>
                            <span className="text-sm font-medium text-indigo-100">{item.label}</span>
                        </div>

                        {loading ? (
                            <Loader2 className="animate-spin text-indigo-400" size={18} />
                        ) : isHealthy ? (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Operational
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-red-300 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
                                <XCircle size={12} />
                                Outage
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
