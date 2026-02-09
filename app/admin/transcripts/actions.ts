'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { extractFactsFromTranscript } from '@/lib/ai/transcript-extractor';
import { revalidatePath } from 'next/cache';
import { generateChunksAndEmbeddings } from '@/lib/ai/embedding';

export interface Transcript {
    id: string;
    title: string;
    raw_content: string;
    source_type: string;
    status: 'pending' | 'processing' | 'extracted' | 'published' | 'failed';
    error_message: string | null;
    created_by: string | null;
    created_at: string;
    processed_at: string | null;
}

export interface ExtractedFact {
    id: string;
    transcript_id: string;
    fact_type: string;
    title: string | null;
    content: string;
    suggested_scope: string;
    is_approved: boolean;
    is_rejected: boolean;
    published_doc_id: string | null;
    created_at: string;
}

/**
 * Get all transcripts.
 */
export async function getTranscripts(): Promise<Transcript[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from('transcripts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
}

/**
 * Get a single transcript with its extracted facts.
 */
export async function getTranscriptWithFacts(id: string): Promise<{
    transcript: Transcript;
    facts: ExtractedFact[];
} | null> {
    const supabase = await createServerSupabaseClient();

    const { data: transcript, error: tError } = await supabase
        .from('transcripts')
        .select('*')
        .eq('id', id)
        .single();

    if (tError) {
        if (tError.code === 'PGRST116') return null;
        throw new Error(tError.message);
    }

    const { data: facts, error: fError } = await supabase
        .from('extracted_facts')
        .select('*')
        .eq('transcript_id', id)
        .order('created_at', { ascending: true });

    if (fError) throw new Error(fError.message);

    return { transcript, facts: facts || [] };
}

/**
 * Create a new transcript.
 */
export async function createTranscript(title: string, content: string): Promise<string> {
    const supabase = await createServerSupabaseClient();
    const { userId } = await auth();

    const { data, error } = await supabase
        .from('transcripts')
        .insert({
            title,
            raw_content: content,
            source_type: 'paste',
            status: 'pending',
            created_by: userId,
        })
        .select('id')
        .single();

    if (error) throw new Error(error.message);

    revalidatePath('/admin/transcripts');
    return data.id;
}

/**
 * Process a transcript - extract facts using LLM.
 */
export async function processTranscript(id: string): Promise<void> {
    const supabase = await createServerSupabaseClient();

    // Update status to processing
    await supabase
        .from('transcripts')
        .update({ status: 'processing' })
        .eq('id', id);

    try {
        // Get transcript content
        const { data: transcript } = await supabase
            .from('transcripts')
            .select('raw_content')
            .eq('id', id)
            .single();

        if (!transcript) throw new Error('Transcript not found');

        // Extract facts
        const facts = await extractFactsFromTranscript(transcript.raw_content);

        // Insert extracted facts
        if (facts.length > 0) {
            await supabase.from('extracted_facts').insert(
                facts.map(f => ({
                    transcript_id: id,
                    fact_type: f.fact_type,
                    title: f.title,
                    content: f.content,
                    suggested_scope: f.suggested_scope,
                }))
            );
        }

        // Update status
        await supabase
            .from('transcripts')
            .update({
                status: 'extracted',
                processed_at: new Date().toISOString()
            })
            .eq('id', id);

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        await supabase
            .from('transcripts')
            .update({
                status: 'failed',
                error_message: message
            })
            .eq('id', id);
        throw error;
    }

    revalidatePath('/admin/transcripts');
    revalidatePath(`/admin/transcripts/${id}`);
}

/**
 * Approve or reject a fact.
 */
export async function updateFactStatus(
    factId: string,
    action: 'approve' | 'reject'
): Promise<void> {
    const supabase = await createServerSupabaseClient();

    await supabase
        .from('extracted_facts')
        .update({
            is_approved: action === 'approve',
            is_rejected: action === 'reject',
        })
        .eq('id', factId);

    revalidatePath('/admin/transcripts');
}

/**
 * Update fact content before publishing.
 */
export async function updateFactContent(
    factId: string,
    title: string,
    content: string,
    scope: string
): Promise<void> {
    const supabase = await createServerSupabaseClient();

    await supabase
        .from('extracted_facts')
        .update({
            title: title || null,
            content,
            suggested_scope: scope,
        })
        .eq('id', factId);

    revalidatePath('/admin/transcripts');
}

/**
 * Publish approved facts as embeddings.
 */
export async function publishApprovedFacts(transcriptId: string): Promise<{ count: number; debug: string }> {
    const supabase = await createServerSupabaseClient();
    const { userId } = await auth();

    // Pre-fetch entities for auto-resolution
    const { data: neighborhoods } = await supabase.from('neighborhoods').select('id, name');
    const { data: listings } = await supabase.from('listings').select('id, title, mls_id');

    // DEBUG: Get stats
    const { data: allFacts } = await supabase
        .from('extracted_facts')
        .select('*')
        .eq('transcript_id', transcriptId);

    const total = allFacts?.length || 0;
    const approved = allFacts?.filter(f => f.is_approved).length || 0;
    const unpublished = allFacts?.filter(f => !f.published_doc_id).length || 0;
    const ready = allFacts?.filter(f => f.is_approved && !f.published_doc_id).length || 0;

    console.log(`[Publish Debug] Total: ${total}, Approved: ${approved}, Unpublished: ${unpublished}, Ready: ${ready}`);

    // Get approved facts that haven't been published
    const facts = allFacts?.filter(f => f.is_approved && !f.published_doc_id) || [];

    if (facts.length === 0) {
        return {
            count: 0,
            debug: `Found ${total} facts. ${approved} approved. ${unpublished} unpublished. Ready: ${ready}. Check filtering logic.`
        };
    }

    // Helper to resolve entity
    const resolveEntity = (fact: any) => {
        const text = ((fact.title || '') + ' ' + (fact.content || '')).toLowerCase();

        if (fact.suggested_scope === 'neighborhood') {
            const match = neighborhoods?.find(n => text.includes(n.name.toLowerCase()));
            return match ? { neighborhood_id: match.id, scope_type: 'neighborhood' } : null;
        }
        if (fact.suggested_scope === 'listing') {
            const match = listings?.find(l => text.includes(l.title.toLowerCase()) || (l.mls_id && text.includes(l.mls_id.toLowerCase())));
            return match ? { listing_id: match.id, scope_type: 'listing' } : null;
        }
        return null;
    };

    let published = 0;

    for (const fact of facts) {
        // Resolve entity ID or fallback to global
        let scopeType = 'global';
        let entityIds = {};

        if (fact.suggested_scope === 'global') {
            scopeType = 'global';
        } else {
            const resolved = resolveEntity(fact);
            if (resolved) {
                scopeType = resolved.scope_type;
                if (resolved.neighborhood_id) entityIds = { neighborhood_id: resolved.neighborhood_id };
                if (resolved.listing_id) entityIds = { listing_id: resolved.listing_id };
            } else {
                // Resolution failed: Fallback to global
                console.warn(`[Publish] Could not resolve entity for fact ${fact.id}. Defaulting to global.`);
                scopeType = 'global';
            }
        }

        // Create document
        const { data: doc, error: docError } = await supabase
            .from('kb_documents')
            .insert({
                title: fact.title || `Extracted: ${fact.fact_type}`,
                content: fact.content,
                scope_type: scopeType,
                ...entityIds,
                status: 'active',
                visibility: 'public',
                author_clerk_user_id: userId,
                content_hash: `transcript_${fact.id}`,
            })
            .select('id')
            .single();

        if (docError) {
            console.error('Failed to publish fact:', docError);
            continue;
        }

        // Generate Embeddings (Critical Step)
        // Wrap in try/catch to ensure we don't leave broken docs
        try {
            await generateChunksAndEmbeddings(doc.id, fact.content);
        } catch (embedError) {
            console.error(`Failed to embed document ${doc.id}:`, embedError);

            // Rollback: Delete the document since it has no embeddings
            await supabase.from('kb_documents').delete().eq('id', doc.id);

            // Skip updating fact status and count
            continue;
        }

        // Update fact with document reference ONLY if embedding succeeded
        await supabase
            .from('extracted_facts')
            .update({ published_doc_id: doc.id })
            .eq('id', fact.id);

        published++;
    }

    // Update transcript status
    await supabase
        .from('transcripts')
        .update({ status: 'published' })
        .eq('id', transcriptId);

    revalidatePath('/admin/transcripts');
    revalidatePath('/admin/embeddings');

    return { count: published, debug: `Success` };
}

/**
 * Delete a transcript and its facts.
 */
export async function deleteTranscript(id: string): Promise<void> {
    const supabase = await createServerSupabaseClient();

    await supabase
        .from('transcripts')
        .delete()
        .eq('id', id);

    revalidatePath('/admin/transcripts');
}
