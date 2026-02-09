import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
        refresh: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
    auth: vi.fn(() => Promise.resolve({
        userId: 'test-user-id',
        getToken: vi.fn(() => Promise.resolve('test-token')),
    })),
    clerkClient: vi.fn(() => ({
        users: {
            getUserList: vi.fn(() => Promise.resolve({ data: [], totalCount: 0 })),
        },
    })),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
    createServerSupabaseClient: vi.fn(() => Promise.resolve({
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            range: vi.fn().mockReturnThis(),
        })),
        rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
}));
