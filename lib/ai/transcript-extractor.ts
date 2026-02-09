/**
 * Transcript Extractor
 * 
 * Uses LLM to extract structured knowledge from raw transcripts.
 */

import { generateObject } from 'ai';
import { chatModel } from '@/lib/ai/config';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DEFAULT_TRANSCRIPT_EXTRACTION_PROMPT } from './defaults';

export const extractedFactSchema = z.object({
    facts: z.array(z.object({
        fact_type: z.enum(['qa', 'fact', 'entity_detail', 'category_info', 'insight']),
        title: z.string().describe('A short title for this piece of knowledge'),
        content: z.string().describe('The full content, written in the assistant\'s voice'),
        suggested_scope: z.enum(['global', 'list_a', 'list_b']).default('global'),
    }))
});

export type ExtractedFact = z.infer<typeof extractedFactSchema>['facts'][number];

export async function extractFactsFromTranscript(rawContent: string): Promise<ExtractedFact[]> {
    // 1. Get Prompt (DB or Default)
    let prompt = DEFAULT_TRANSCRIPT_EXTRACTION_PROMPT;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase
            .from('prompt_versions')
            .select('content')
            .eq('prompt_key', 'transcript_extractor')
            .eq('is_active', true)
            .single();

        if (data?.content) {
            prompt = data.content;
        }
    } catch (e) {
        // Fallback to default
        console.warn('Failed to fetch transcript prompt, using default', e);
    }

    const { object } = await generateObject({
        model: chatModel,
        schema: extractedFactSchema,
        prompt: prompt + '\n\nTRANSCRIPT:\n' + rawContent,
    });

    return object.facts;
}
