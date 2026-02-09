import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock setup
vi.mock('@/lib/supabase/server', () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({
    auth: vi.fn(() => Promise.resolve({ userId: 'test-admin-id' })),
}));

// Mock crypto for content hash
vi.mock('crypto', () => ({
    createHash: vi.fn(() => ({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('mock-hash'),
    })),
}));

// Mock ai
vi.mock('ai', () => ({
    embed: vi.fn().mockResolvedValue({ embedding: [0.1, 0.2, 0.3] }),
}));

vi.mock('@/lib/ai/embedding', () => ({
    generateChunksAndEmbeddings: vi.fn(),
}));

describe('Document Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('deleteDocument', () => {
        it('should delete a document by id', async () => {
            const { createServerSupabaseClient } = await import('@/lib/supabase/server');
            const mockDelete = vi.fn().mockReturnThis();
            const mockEq = vi.fn(() => Promise.resolve({ error: null }));

            vi.mocked(createServerSupabaseClient).mockResolvedValue({
                from: vi.fn(() => ({
                    delete: mockDelete,
                    eq: mockEq,
                })),
            } as any);

            const { deleteDocument } = await import('@/app/admin/actions/documents');
            await deleteDocument('test-doc-id');

            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith('id', 'test-doc-id');
        });

        it('should throw error on delete failure', async () => {
            const { createServerSupabaseClient } = await import('@/lib/supabase/server');

            vi.mocked(createServerSupabaseClient).mockResolvedValue({
                from: vi.fn(() => ({
                    delete: vi.fn().mockReturnThis(),
                    eq: vi.fn(() => Promise.resolve({ error: { message: 'Delete failed' } })),
                })),
            } as any);

            const { deleteDocument } = await import('@/app/admin/actions/documents');
            await expect(deleteDocument('test-doc-id')).rejects.toThrow('Delete failed');
        });
    });

    describe('saveDocument', () => {
        it('should create a new document', async () => {
            const { createServerSupabaseClient } = await import('@/lib/supabase/server');
            const { generateChunksAndEmbeddings } = await import('@/lib/ai/embedding');

            const mockInsert = vi.fn().mockReturnThis();
            const mockSelect = vi.fn().mockReturnThis();
            const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null });

            vi.mocked(createServerSupabaseClient).mockResolvedValue({
                from: vi.fn(() => ({
                    insert: mockInsert,
                    select: mockSelect,
                    single: mockSingle,
                })),
            } as any);

            const formData = new FormData();
            formData.append('title', 'Test Doc');
            formData.append('content', 'Test Content');
            formData.append('scope_type', 'global');
            formData.append('visibility', 'public');
            formData.append('status', 'published');

            const { saveDocument } = await import('@/app/admin/actions/documents');

            // We expect redirect to be called, which throws NEXT_REDIRECT
            try {
                await saveDocument(formData);
            } catch (e: any) {
                if (e.message !== 'NEXT_REDIRECT') throw e;
            }

            expect(mockInsert).toHaveBeenCalled();
            expect(generateChunksAndEmbeddings).toHaveBeenCalledWith('new-id', 'Test Content');
        });
    });
});
