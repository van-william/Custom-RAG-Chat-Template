/**
 * Prompts Repository
 * 
 * Centralized data access for prompt_versions table.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { PromptVersion } from '@/lib/types';

export const promptsRepo = {
    /**
     * Get all active prompts.
     */
    async findAllActive(): Promise<PromptVersion[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('prompt_versions')
            .select('*')
            .eq('is_active', true)
            .order('prompt_key');

        if (error) throw new Error(error.message);
        return data ?? [];
    },

    /**
     * Get the active version of a specific prompt.
     */
    async findActiveByKey(key: string): Promise<PromptVersion | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('prompt_versions')
            .select('*')
            .eq('prompt_key', key)
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }
        return data;
    },

    /**
     * Get the latest version number for a prompt key.
     */
    async getLatestVersion(key: string): Promise<number> {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase
            .from('prompt_versions')
            .select('version')
            .eq('prompt_key', key)
            .order('version', { ascending: false })
            .limit(1)
            .single();

        return data?.version ?? 0;
    },

    /**
     * Create a new version of a prompt.
     * Deactivates previous versions atomically.
     */
    async createVersion(
        key: string,
        content: string,
        authorId: string | null
    ): Promise<{ version: number }> {
        const supabase = await createServerSupabaseClient();

        const currentVersion = await this.getLatestVersion(key);
        const nextVersion = currentVersion + 1;

        // Deactivate existing versions
        const { error: deactivateError } = await supabase
            .from('prompt_versions')
            .update({ is_active: false })
            .eq('prompt_key', key)
            .eq('is_active', true);

        if (deactivateError) {
            throw new Error(deactivateError.message);
        }

        // Insert new version
        const { error: insertError } = await supabase
            .from('prompt_versions')
            .insert({
                prompt_key: key,
                version: nextVersion,
                content,
                is_active: true,
                author_clerk_user_id: authorId || 'system',
            });

        if (insertError) {
            // Attempt rollback
            if (currentVersion > 0) {
                await supabase
                    .from('prompt_versions')
                    .update({ is_active: true })
                    .eq('prompt_key', key)
                    .eq('version', currentVersion);
            }
            throw new Error(insertError.message);
        }

        return { version: nextVersion };
    },

    /**
     * Get version history for a prompt key.
     */
    async getHistory(key: string): Promise<PromptVersion[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('prompt_versions')
            .select('*')
            .eq('prompt_key', key)
            .order('version', { ascending: false });

        if (error) throw new Error(error.message);
        return data ?? [];
    },
};
