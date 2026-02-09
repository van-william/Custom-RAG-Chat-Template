import { createServerSupabaseClient } from '@/lib/supabase/server';
import { chunkText } from './utils';

const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const EMBEDDING_MODEL = 'gemini-embedding-001';
const OUTPUT_DIMENSIONS = 768;

/**
 * Directly calls Google's Gemini embedding API with explicit dimension control.
 * Bypasses Vercel AI SDK which doesn't support outputDimensionality.
 */
export async function embedTextsWithGoogle(texts: string[]): Promise<number[][]> {
    if (!GOOGLE_API_KEY) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
    }

    // Filter out empty strings
    const validTexts = texts.map(t => t.trim()).filter(t => t.length > 0);
    if (validTexts.length === 0) {
        throw new Error('No valid text content to embed');
    }

    // Use batchEmbedContents for efficiency
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents?key=${GOOGLE_API_KEY}`;

    const requests = validTexts.map(text => ({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: OUTPUT_DIMENSIONS,
    }));

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Embedding API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Extract embeddings from response
    // Response format: { embeddings: [{ values: number[] }, ...] }
    return data.embeddings.map((e: { values: number[] }) => e.values);
}

/**
 * Embed a single text string. Convenience wrapper for query embedding.
 */
export async function embedTextWithGoogle(text: string): Promise<number[]> {
    const [embedding] = await embedTextsWithGoogle([text]);
    return embedding;
}

/**
 * Re-embeds a document:
 * 1. Chunks the content
 * 2. Generates embeddings (direct API call with 768 dimensions)
 * 3. Deletes old chunks
 * 4. Inserts new chunks
 */
export async function generateChunksAndEmbeddings(documentId: string, content: string) {
    const supabase = await createServerSupabaseClient();

    // 1. Chunk content
    const chunks = chunkText(content);
    if (chunks.length === 0) return;

    // 2. Generate embeddings using direct Google API call
    const embeddings = await embedTextsWithGoogle(chunks);

    // 3. Delete old chunks
    const { error: deleteError } = await supabase
        .from('kb_chunks')
        .delete()
        .eq('document_id', documentId);

    if (deleteError) throw new Error(`Failed to delete old chunks: ${deleteError.message}`);

    // 4. Insert new chunks
    const chunksData = chunks.map((text, i) => ({
        document_id: documentId,
        chunk_index: i,
        chunk_text: text,
        embedding: embeddings[i],
        metadata: { source: 'admin-update' }
    }));

    const { error: insertError } = await supabase
        .from('kb_chunks')
        .insert(chunksData);

    if (insertError) throw new Error(`Chunk insert failed: ${insertError.message}`);

    return chunks.length;
}
