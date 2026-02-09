import { createServerSupabaseClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { apiError, apiSuccess, validateRequest, createPromptSchema } from '@/lib/validation';
import { DEFAULT_TRANSCRIPT_EXTRACTION_PROMPT } from '@/lib/ai/defaults';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return apiError('Unauthorized', 401);
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from('prompt_versions')
        .select('*')
        .eq('is_active', true)
        .order('prompt_key');

    if (error) {
        return apiError(error.message, 500);
    }

    const prompts = data || [];
    // Inject default transcript prompt if missing
    if (!prompts.find(p => p.prompt_key === 'transcript_extractor')) {
        prompts.push({
            id: 'default_transcript',
            prompt_key: 'transcript_extractor',
            version: 0,
            content: DEFAULT_TRANSCRIPT_EXTRACTION_PROMPT,
            is_active: true,
            created_at: new Date().toISOString(),
        });
    }

    return apiSuccess({ prompts });
}

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { userId } = await auth();

    const body = await req.json();
    const validation = validateRequest(createPromptSchema, body);

    if (!validation.success) {
        return validation.error;
    }

    const { key, content } = validation.data;

    // Get current version
    const { data: current } = await supabase
        .from('prompt_versions')
        .select('version')
        .eq('prompt_key', key)
        .order('version', { ascending: false })
        .limit(1)
        .single();

    const nextVersion = (current?.version || 0) + 1;

    // ATOMIC UPDATE: First deactivate ALL versions for this key
    // This prevents race conditions where multiple inserts could create duplicate active versions
    const { error: deactivateError } = await supabase
        .from('prompt_versions')
        .update({ is_active: false })
        .eq('prompt_key', key)
        .eq('is_active', true);

    if (deactivateError) {
        return apiError(deactivateError.message, 500);
    }

    // Insert new version as the only active one
    const { error: insertError } = await supabase.from('prompt_versions').insert({
        prompt_key: key,
        version: nextVersion,
        content: content,
        is_active: true,
        author_clerk_user_id: userId || 'system',
    });

    if (insertError) {
        // If insert fails, we have no active version - attempt to reactivate the previous one
        if (current?.version) {
            await supabase
                .from('prompt_versions')
                .update({ is_active: true })
                .eq('prompt_key', key)
                .eq('version', current.version);
        }
        return apiError(insertError.message, 500);
    }

    return apiSuccess({ success: true, version: nextVersion });
}
