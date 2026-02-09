import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getSystemPrompt(key: string, fallback: string): Promise<string> {
    const supabase = await createServerSupabaseClient();

    try {
        const { data, error } = await supabase
            .from('prompt_versions')
            .select('content')
            .eq('prompt_key', key)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            console.warn(`[getSystemPrompt] Failed to fetch active prompt for key "${key}". Using fallback.`, error);
            return fallback;
        }

        return data.content;
    } catch (e) {
        console.error(`[getSystemPrompt] Exception fetching prompt for key "${key}". Using fallback.`, e);
        return fallback;
    }
}
