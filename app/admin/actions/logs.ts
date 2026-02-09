'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { clerkClient } from '@clerk/nextjs/server';

export interface LogFilters {
    search?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    role?: 'user' | 'assistant' | 'all';
    page?: number;
    pageSize?: number;
}

export interface LogsResult {
    logs: Array<{
        id: string;
        user_id: string;
        role: 'user' | 'assistant';
        content: string;
        created_at: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ChatUser {
    id: string;
    name: string;
    email: string;
    image: string;
}

export async function getLogs(filters: LogFilters): Promise<LogsResult> {
    const supabase = await createServerSupabaseClient();
    const { search, userId, startDate, endDate, role, page = 1, pageSize = 50 } = filters;

    let query = supabase
        .from('chat_messages')
        .select('*', { count: 'exact' });

    if (search) {
        query = query.ilike('content', `%${search}%`);
    }

    if (userId && userId !== 'all') {
        query = query.eq('user_id', userId);
    }

    if (startDate) {
        query = query.gte('created_at', startDate);
    }

    if (endDate) {
        // Add one day to include the end date fully if it's just a date string
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('created_at', nextDay.toISOString());
    }

    if (role && role !== 'all') {
        query = query.eq('role', role);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        throw new Error(error.message);
    }

    return {
        logs: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0
    };
}

export async function getChatUsers(): Promise<ChatUser[]> {
    const supabase = await createServerSupabaseClient();
    const client = await clerkClient();

    // 1. Fetch distinct user_ids from chat_messages
    const { data: users, error: fetchError } = await supabase
        .from('chat_messages')
        .select('user_id')
        .order('created_at', { ascending: false });

    if (fetchError) throw new Error(fetchError.message);

    // Dedup user IDs
    const uniqueUserIds = Array.from(new Set(users?.map(u => u.user_id))).filter(Boolean);

    // 2. Fetch User Details from Clerk
    const { data: clerkUsers } = await client.users.getUserList({
        limit: 100,
        orderBy: '-last_sign_in_at'
    });

    // Use Map for O(1) lookups
    const userMap = new Map(clerkUsers.map(u => [u.id, u]));

    const enrichedUsers: ChatUser[] = uniqueUserIds.map(userId => {
        const user = userMap.get(userId);
        return {
            id: userId,
            name: user ? (user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User') : userId,
            email: user?.emailAddresses[0]?.emailAddress || '',
            image: user?.imageUrl || ''
        };
    });

    return enrichedUsers;
}
