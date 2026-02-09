/**
 * Chat Messages Repository
 * 
 * Centralized data access for chat_messages table.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ChatMessage } from '@/lib/types';

export const chatMessagesRepo = {
    /**
     * Save a message to the database.
     */
    async save(
        userId: string,
        role: 'user' | 'assistant',
        content: string
    ): Promise<ChatMessage> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                user_id: userId,
                role,
                content,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    /**
     * Get messages for a specific user.
     */
    async findByUserId(
        userId: string,
        limit: number = 100
    ): Promise<ChatMessage[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw new Error(error.message);
        return data ?? [];
    },

    /**
     * Get all unique users who have sent messages.
     */
    async getUniqueUserIds(): Promise<string[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('chat_messages')
            .select('user_id')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        const uniqueIds = Array.from(
            new Set((data ?? []).map(m => m.user_id))
        ).filter(Boolean);

        return uniqueIds;
    },

    /**
     * Get recent messages across all users.
     */
    async findRecent(limit: number = 50): Promise<ChatMessage[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw new Error(error.message);
        return data ?? [];
    },

    /**
     * Get message count for a user.
     */
    async countByUserId(userId: string): Promise<number> {
        const supabase = await createServerSupabaseClient();
        const { count, error } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) throw new Error(error.message);
        return count ?? 0;
    },
};
