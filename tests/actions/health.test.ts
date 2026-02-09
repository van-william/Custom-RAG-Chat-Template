import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock setup
vi.mock('@/lib/supabase/server', () => ({
    createServerSupabaseClient: vi.fn(),
}));

describe('Health Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('checkSystemHealth', () => {
        it('should return health status object', async () => {
            const { createServerSupabaseClient } = await import('@/lib/supabase/server');

            vi.mocked(createServerSupabaseClient).mockResolvedValue({
                from: vi.fn(() => ({
                    select: vi.fn(() => Promise.resolve({ error: null })),
                })),
            } as any);

            // Mock generateText
            vi.mock('ai', () => ({
                generateText: vi.fn(() => Promise.resolve({ text: 'pong' })),
            }));

            // Mock fetch for internet check
            global.fetch = vi.fn(() => Promise.resolve({ ok: true } as Response));

            const { checkSystemHealth } = await import('@/app/admin/actions/health');
            const status = await checkSystemHealth();

            expect(status).toHaveProperty('supabase');
            expect(status).toHaveProperty('llm');
            expect(status).toHaveProperty('internet');
            expect(status).toHaveProperty('timestamp');
        });
    });
});
