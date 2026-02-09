'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface DocumentUsage {
    document_id: string;
    title: string;
    retrieval_count: number;
    avg_distance: number;
}

export interface GapQuery {
    id: string;
    question: string;
    avg_distance: number;
    match_count: number;
    created_at: string;
}

export interface DailyStats {
    date: string;
    query_count: number;
    avg_distance: number;
}

/**
 * Get most referenced documents.
 */
export async function getTopDocuments(limit: number = 10, days: number = 14): Promise<DocumentUsage[]> {
    const supabase = await createServerSupabaseClient();

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get retrieval logs within time range
    const { data: logs, error } = await supabase
        .from('retrieval_logs')
        .select('matched_chunks, avg_distance')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

    if (error) throw new Error(error.message);

    // Count document references
    const docCounts = new Map<string, { count: number; totalDistance: number }>();

    for (const log of logs || []) {
        const chunks = log.matched_chunks as Array<{ document_id: string; distance: number }>;
        for (const chunk of chunks) {
            const existing = docCounts.get(chunk.document_id) || { count: 0, totalDistance: 0 };
            docCounts.set(chunk.document_id, {
                count: existing.count + 1,
                totalDistance: existing.totalDistance + (chunk.distance || 0)
            });
        }
    }

    // Get document titles
    const docIds = Array.from(docCounts.keys());
    if (docIds.length === 0) return [];

    const { data: docs } = await supabase
        .from('kb_documents')
        .select('id, title')
        .in('id', docIds);

    const docTitles = new Map((docs || []).map(d => [d.id, d.title]));

    // Build result
    const results: DocumentUsage[] = Array.from(docCounts.entries())
        .map(([id, stats]) => ({
            document_id: id,
            title: docTitles.get(id) || 'Unknown Document',
            retrieval_count: stats.count,
            avg_distance: stats.totalDistance / stats.count
        }))
        .sort((a, b) => b.retrieval_count - a.retrieval_count)
        .slice(0, limit);

    return results;
}

/**
 * Get queries with poor match quality (content gaps).
 */
export async function getGapQueries(threshold: number = 0.5, limit: number = 20, days: number = 14): Promise<GapQuery[]> {
    const supabase = await createServerSupabaseClient();

    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
        .from('retrieval_logs')
        .select('id, question, avg_distance, match_count, created_at')
        .gt('avg_distance', threshold)
        .gte('created_at', since.toISOString())
        .order('avg_distance', { ascending: false })
        .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
}

/**
 * Get documents that have never been retrieved.
 */
export async function getColdDocuments(): Promise<Array<{ id: string; title: string; created_at: string }>> {
    const supabase = await createServerSupabaseClient();

    // Get all retrieval logs to find referenced documents
    const { data: logs } = await supabase
        .from('retrieval_logs')
        .select('matched_chunks');

    const referencedDocs = new Set<string>();
    for (const log of logs || []) {
        const chunks = log.matched_chunks as Array<{ document_id: string }>;
        for (const chunk of chunks) {
            referencedDocs.add(chunk.document_id);
        }
    }

    // Get all documents
    const { data: allDocs, error } = await supabase
        .from('kb_documents')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Filter to only cold documents
    return (allDocs || []).filter(doc => !referencedDocs.has(doc.id));
}

/**
 * Get daily query statistics.
 */
export async function getDailyStats(days: number = 30): Promise<DailyStats[]> {
    const supabase = await createServerSupabaseClient();

    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
        .from('retrieval_logs')
        .select('created_at, avg_distance')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    // Group by date
    const byDate = new Map<string, { count: number; totalDistance: number }>();

    for (const log of data || []) {
        const date = new Date(log.created_at).toISOString().split('T')[0];
        const existing = byDate.get(date) || { count: 0, totalDistance: 0 };
        byDate.set(date, {
            count: existing.count + 1,
            totalDistance: existing.totalDistance + (log.avg_distance || 0)
        });
    }

    return Array.from(byDate.entries()).map(([date, stats]) => ({
        date,
        query_count: stats.count,
        avg_distance: stats.totalDistance / stats.count
    }));
}

/**
 * Get analytics summary.
 */
export async function getAnalyticsSummary(days: number = 14) {
    const supabase = await createServerSupabaseClient();

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Total queries in time range
    const { count: totalQueries } = await supabase
        .from('retrieval_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since.toISOString());

    // Total documents
    const { count: totalDocuments } = await supabase
        .from('kb_documents')
        .select('*', { count: 'exact', head: true });

    // Queries today
    const today = new Date().toISOString().split('T')[0];
    const { count: queriesToday } = await supabase
        .from('retrieval_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

    // Average match quality in time range
    const { data: avgData } = await supabase
        .from('retrieval_logs')
        .select('avg_distance')
        .gte('created_at', since.toISOString())
        .limit(100);

    const avgQuality = avgData?.length
        ? 1 - (avgData.reduce((acc, d) => acc + (d.avg_distance || 0), 0) / avgData.length)
        : 0;

    return {
        totalQueries: totalQueries || 0,
        totalDocuments: totalDocuments || 0,
        queriesToday: queriesToday || 0,
        avgQuality: Math.round(avgQuality * 100),
    };
}
