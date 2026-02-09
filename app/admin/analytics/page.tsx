import {
    getAnalyticsSummary,
    getTopDocuments,
    getGapQueries,
    getColdDocuments,
    getDailyStats
} from './actions';
import { BarChart3, TrendingUp, AlertTriangle, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { TimeRangeFilter } from './TimeRangeFilter';

interface PageProps {
    searchParams: Promise<{ days?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
    const { days: daysParam } = await searchParams;
    const days = parseInt(daysParam || '14', 10);

    const [summary, topDocs, gaps, coldDocs, dailyStats] = await Promise.all([
        getAnalyticsSummary(days),
        getTopDocuments(8, days),
        getGapQueries(0.4, 10, days),
        getColdDocuments(),
        getDailyStats(days),
    ]);

    return (
        <div className="flex flex-col h-full bg-neutral-50 p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-neutral-900">Embedding Analytics</h1>
                </div>
                <TimeRangeFilter />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <SummaryCard
                    label="Total Queries"
                    value={summary.totalQueries}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="indigo"
                />
                <SummaryCard
                    label="Today"
                    value={summary.queriesToday}
                    icon={<BarChart3 className="w-5 h-5" />}
                    color="green"
                />
                <SummaryCard
                    label="Match Quality"
                    value={`${summary.avgQuality}%`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="blue"
                />
                <SummaryCard
                    label="Cold Documents"
                    value={coldDocs.length}
                    icon={<FileQuestion className="w-5 h-5" />}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Top Documents */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                        Most Referenced Documents
                    </h2>
                    {topDocs.length === 0 ? (
                        <p className="text-neutral-500 text-sm">No retrieval data yet. Start chatting!</p>
                    ) : (
                        <div className="space-y-3">
                            {topDocs.map((doc, i) => (
                                <div key={doc.document_id} className="flex items-center gap-3">
                                    <span className="text-sm font-mono text-neutral-400 w-6">
                                        {i + 1}.
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/admin/embeddings/${doc.document_id}`}
                                            className="text-sm font-medium text-indigo-600 hover:underline truncate block"
                                        >
                                            {doc.title}
                                        </Link>
                                    </div>
                                    <span className="text-sm text-neutral-500">
                                        {doc.retrieval_count} refs
                                    </span>
                                    <div className="w-20 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${(doc.retrieval_count / topDocs[0].retrieval_count) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Gap Analysis */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-semibold text-neutral-900">
                            Content Gaps
                        </h2>
                    </div>
                    <p className="text-xs text-neutral-500 mb-4">
                        Questions with poor match quality — consider adding content for these topics.
                    </p>
                    {gaps.length === 0 ? (
                        <p className="text-neutral-500 text-sm">No significant gaps detected!</p>
                    ) : (
                        <div className="space-y-3">
                            {gaps.map((gap) => (
                                <div key={gap.id} className="border-l-2 border-amber-400 pl-3 py-1">
                                    <p className="text-sm text-neutral-800 line-clamp-2">
                                        "{gap.question}"
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        Distance: {gap.avg_distance.toFixed(2)} •
                                        {new Date(gap.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Cold Documents */}
            {coldDocs.length > 0 && (
                <div className="mt-8 bg-white border border-neutral-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FileQuestion className="w-5 h-5 text-orange-500" />
                        <h2 className="text-lg font-semibold text-neutral-900">
                            Cold Documents
                        </h2>
                    </div>
                    <p className="text-xs text-neutral-500 mb-4">
                        These documents have never been retrieved. Consider reviewing or removing them.
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        {coldDocs.slice(0, 9).map((doc) => (
                            <Link
                                key={doc.id}
                                href={`/admin/embeddings/${doc.id}`}
                                className="p-3 border border-neutral-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                            >
                                <p className="text-sm font-medium text-neutral-800 truncate">
                                    {doc.title}
                                </p>
                                <p className="text-xs text-neutral-400">
                                    Created {new Date(doc.created_at).toLocaleDateString()}
                                </p>
                            </Link>
                        ))}
                    </div>
                    {coldDocs.length > 9 && (
                        <p className="text-xs text-neutral-400 mt-3">
                            And {coldDocs.length - 9} more...
                        </p>
                    )}
                </div>
            )}

            {/* Daily Trend */}
            <div className="mt-8 bg-white border border-neutral-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                    Query Volume (Last 14 Days)
                </h2>
                {dailyStats.length === 0 ? (
                    <p className="text-neutral-500 text-sm">No data yet.</p>
                ) : (
                    <div className="flex items-end gap-1 h-32">
                        {dailyStats.map((day) => {
                            const maxCount = Math.max(...dailyStats.map(d => d.query_count), 1);
                            const height = (day.query_count / maxCount) * 100;
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full bg-indigo-400 rounded-t"
                                        style={{ height: `${height}%`, minHeight: day.query_count > 0 ? '4px' : '0' }}
                                        title={`${day.query_count} queries`}
                                    />
                                    <span className="text-xs text-neutral-400 rotate-45 origin-left">
                                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryCard({
    label,
    value,
    icon,
    color
}: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color: 'indigo' | 'green' | 'blue' | 'orange';
}) {
    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
    };

    return (
        <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-sm font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}
