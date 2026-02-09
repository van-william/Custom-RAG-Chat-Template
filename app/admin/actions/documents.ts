'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { generateChunksAndEmbeddings, embedTextWithGoogle } from '@/lib/ai/embedding';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createHash } from 'crypto';

// Utility to compute content hash for deduplication
function computeContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex').substring(0, 16);
}

interface RagMatch {
    document_id: string;
    chunk_id: string;
    chunk_text: string;
    distance: number;
}

interface EnrichedMatch extends RagMatch {
    document: {
        id: string;
        title: string;
        status: string;
        visibility: string;
    } | null;
}

export async function saveDocument(formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const { userId } = await auth();

    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const scope_type = formData.get('scope_type') as string;
    const visibility = formData.get('visibility') as string;
    const status = formData.get('status') as string;

    // Optional Scope IDs
    const list_a_id = formData.get('list_a_id') as string || null;
    const list_b_id = formData.get('list_b_id') as string || null;

    // Validate Scope Constraints
    if (scope_type === 'list_a' && !list_a_id) throw new Error("List A ID required for List A scope");
    if (scope_type === 'list_b' && !list_b_id) throw new Error("List B ID required for List B scope");

    let targetId = id;
    let newVersion = 1;

    if (id) {
        // Fetch current version for increment
        const { data: currentDoc } = await supabase
            .from('kb_documents')
            .select('version')
            .eq('id', id)
            .single();

        newVersion = (currentDoc?.version ?? 0) + 1;

        // Update with incremented version
        const { error } = await supabase
            .from('kb_documents')
            .update({
                title,
                content,
                scope_type,
                visibility,
                status,
                updated_at: new Date().toISOString(),
                list_a_id: scope_type === 'list_a' ? list_a_id : null,
                list_b_id: scope_type === 'list_b' ? list_b_id : null,
                version: newVersion,
            })
            .eq('id', id);
        if (error) throw new Error(error.message);
    } else {
        // Create
        const { data, error } = await supabase
            .from('kb_documents')
            .insert([{
                title,
                content,
                scope_type,
                visibility,
                status,
                updated_at: new Date().toISOString(),
                list_a_id: scope_type === 'list_a' ? list_a_id : null,
                list_b_id: scope_type === 'list_b' ? list_b_id : null,
                version: 1,
                author_clerk_user_id: userId || 'system',
                content_hash: computeContentHash(content)
            }])
            .select('id')
            .single();

        if (error) throw new Error(error.message);
        targetId = data.id;
    }

    // Re-embed
    await generateChunksAndEmbeddings(targetId, content);

    revalidatePath('/admin/embeddings');
    revalidatePath(`/admin/embeddings/${targetId}`);

    if (!id) {
        // New document: redirect to edit page with success
        redirect(`/admin/embeddings/${targetId}?success=true`);
    } else {
        // Existing document: redirect to list with toast
        const docTitle = encodeURIComponent(title);
        redirect(`/admin/embeddings?updated=true&title=${docTitle}&version=${newVersion}`);
    }
}

export async function deleteDocument(id: string) {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('kb_documents')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/admin/embeddings');
}

export async function testBroadSearch(query: string): Promise<{ matches?: EnrichedMatch[]; error?: string }> {
    const supabase = await createServerSupabaseClient();

    // 1. Generate Embedding using direct Google API (768 dimensions)
    const embedding = await embedTextWithGoogle(query);

    // 2. Search
    const { data: matches, error } = await supabase.rpc('match_kb_chunks', {
        query_embedding: embedding,
        match_count: 5,
        scope_filter: null,
        list_a_filter: null,
        list_b_filter: null,
    });

    if (error) {
        return { error: error.message };
    }

    // 3. Enrich with document titles - BATCH QUERY to avoid N+1
    const typedMatches = matches as RagMatch[];
    const docIds = typedMatches.map((m) => m.document_id);
    const { data: docs } = await supabase
        .from('kb_documents')
        .select('id, title, status, visibility')
        .in('id', docIds);

    const docMap = new Map((docs || []).map((d) => [d.id, d]));

    const enrichedMatches: EnrichedMatch[] = typedMatches.map((m) => ({
        ...m,
        document: docMap.get(m.document_id) || null
    }));

    return { matches: enrichedMatches };
}
