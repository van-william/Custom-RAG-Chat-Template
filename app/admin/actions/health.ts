'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateText } from 'ai';
import { chatModel } from '@/lib/ai/config';

export interface SystemHealthStatus {
    supabase: boolean;
    llm: boolean;
    internet: boolean;
    timestamp: string;
}

export async function checkSystemHealth(): Promise<SystemHealthStatus> {
    const status: SystemHealthStatus = {
        supabase: false,
        llm: false,
        internet: false,
        timestamp: new Date().toISOString()
    };

    // 1. Check Supabase
    try {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.from('kb_documents').select('count', { count: 'exact', head: true });
        if (!error) status.supabase = true;
    } catch {
        // Supabase check failed
    }

    // 2. Check LLM (Gemini)
    try {
        await generateText({
            model: chatModel,
            prompt: 'ping',
        });
        status.llm = true;
    } catch {
        // LLM check failed
    }

    // 3. Check Internet (Google)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
        const res = await fetch('https://www.google.com', { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) status.internet = true;
    } catch {
        // Internet check failed
    }

    return status;
}
