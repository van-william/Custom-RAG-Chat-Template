'use client';

import { useState } from 'react';
import { testBroadSearch } from '../actions/documents';
import { Search, Loader2, Database, AlertCircle, FileText } from 'lucide-react';

export default function EmbeddingTester() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResults(null);
        try {
            const res = await testBroadSearch(query);
            setResults(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Database size={20} className="text-indigo-600" />
                Test Embeddings & Retrieval
            </h3>

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter a test query (e.g., 'Platform features')"
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="bg-neutral-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Test Search'}
                </button>
            </form>

            {results && results.error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} />
                    {results.error}
                </div>
            )}

            {results && results.matches && (
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                        Top {results.matches.length} Matches
                    </h4>

                    {results.matches.length === 0 ? (
                        <p className="text-neutral-500 italic">No matches found.</p>
                    ) : (
                        <div className="grid gap-3">
                            {results.matches.map((match: any, i: number) => (
                                <div key={match.chunk_id || i} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded">
                                                Rank #{i + 1}
                                            </span>
                                            <span className="text-xs font-mono text-neutral-500">
                                                Dist: {match.distance.toFixed(4)}
                                            </span>
                                        </div>
                                        {match.document && (
                                            <div className="flex items-center gap-2">
                                                <FileText size={14} className="text-neutral-400" />
                                                <span className="text-sm font-medium text-neutral-700">
                                                    {match.document.title}
                                                </span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${match.document.status === 'active'
                                                    ? 'bg-green-50 border-green-200 text-green-700'
                                                    : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                                    }`}>
                                                    {match.document.status}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-neutral-100 p-3 rounded text-sm text-neutral-700 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                                        {match.chunk_text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
