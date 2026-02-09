import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock setup
vi.mock('@/lib/supabase/server', () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock('ai', () => ({
    generateObject: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('Transcript Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('processTranscript', () => {
        it('should extract facts and update status', async () => {
            const { createServerSupabaseClient } = await import('@/lib/supabase/server');
            const { generateObject } = await import('ai');

            // Mock Supabase
            const mockUpdate = vi.fn().mockReturnThis();
            const mockInsert = vi.fn().mockReturnThis();

            vi.mocked(createServerSupabaseClient).mockResolvedValue({
                from: vi.fn((table) => ({
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn((col, val) => {
                        if (table === 'transcripts' && col === 'id') {
                            return {
                                single: vi.fn().mockResolvedValue({ data: { raw_content: 'Test content' } })
                            };
                        }
                        return { single: vi.fn() }; // Default fallback
                    }),
                    update: mockUpdate, // For updating status
                    insert: mockInsert, // For inserting facts
                })),
            } as any);

            // Mock LLM
            vi.mocked(generateObject).mockResolvedValue({
                object: {
                    facts: [
                        { title: 'Fact 1', content: 'Content 1', fact_type: 'fact', suggested_scope: 'global' }
                    ]
                }
            } as any);

            const { processTranscript } = await import('@/app/admin/transcripts/actions');
            await processTranscript('transcript-id');

            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'processing' }));
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'extracted' }));
            expect(mockInsert).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ title: 'Fact 1' })
            ]));
        });
    });
});
