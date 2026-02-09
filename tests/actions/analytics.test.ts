import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock setup
vi.mock('@/lib/supabase/server', () => ({
    createServerSupabaseClient: vi.fn(),
}));

describe('Analytics Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getTopDocuments', () => {
        it('should aggregate document usage correctly', async () => {
            const { createServerSupabaseClient } = await import('@/lib/supabase/server');

            // Mock Logs aggregation
            vi.mocked(createServerSupabaseClient).mockResolvedValue({
                from: vi.fn((table) => {
                    if (table === 'retrieval_logs') {
                        return {
                            select: vi.fn().mockReturnThis(),
                            order: vi.fn().mockReturnThis(),
                            limit: vi.fn().mockResolvedValue({
                                data: [
                                    { matched_chunks: [{ document_id: 'doc1', distance: 0.1 }] },
                                    { matched_chunks: [{ document_id: 'doc1', distance: 0.2 }, { document_id: 'doc2', distance: 0.1 }] }
                                ],
                                error: null
                            }),
                            gte: vi.fn().mockReturnThis(), // Support date filtering
                        };
                    }
                    if (table === 'kb_documents') {
                        return {
                            select: vi.fn().mockReturnThis(),
                            in: vi.fn().mockResolvedValue({
                                data: [{ id: 'doc1', title: 'Doc 1' }, { id: 'doc2', title: 'Doc 2' }],
                                error: null
                            })
                        };
                    }
                    return {};
                }),
            } as any);

            const { getTopDocuments } = await import('@/app/admin/analytics/actions');
            const results = await getTopDocuments();

            expect(results).toHaveLength(2);
            // doc1: 2 refs, doc2: 1 ref
            expect(results[0].document_id).toBe('doc1');
            expect(results[0].retrieval_count).toBe(2);
            expect(results[1].document_id).toBe('doc2');
            expect(results[1].retrieval_count).toBe(1);
        });
    });
});
