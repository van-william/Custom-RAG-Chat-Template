import { streamText, convertToModelMessages, type UIMessage, type TextPart } from 'ai';
import { chatModel } from '@/lib/ai/config';
import { embedTextWithGoogle } from '@/lib/ai/embedding';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { getSystemPrompt } from '@/lib/prompts';
import { apiError } from '@/lib/validation';
import { chatLogger } from '@/lib/logger';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface RagMatch {
    chunk_id: string;
    document_id: string;
    chunk_text: string;
    distance: number;
}

export async function POST(req: Request) {
    const { messages } = await req.json();
    const lastUserMessage = [...messages].reverse().find((m: UIMessage) => m.role === 'user');

    // Debug: Log the message structure
    console.log('[Chat Debug] Last user message:', JSON.stringify(lastUserMessage, null, 2));

    // Handle various content formats from AI SDK
    // SDK v3+ uses "parts" array, older versions used "content"
    let question = '';
    const messageContent = lastUserMessage?.content || lastUserMessage?.parts;

    if (messageContent) {
        if (typeof messageContent === 'string') {
            question = messageContent;
        } else if (Array.isArray(messageContent)) {
            // Extract text from parts array
            question = messageContent
                .filter((part: any) => part.text)
                .map((part: any) => part.text)
                .join(' ');
        }
    }

    console.log('[Chat Debug] Extracted question:', question);

    // Validate question is not empty
    if (!question || question.trim().length === 0) {
        console.log('[Chat Debug] Question was empty or invalid');
        return apiError('Please enter a message', 400);
    }

    // 1) Embed the user question using direct Google API (768 dimensions)
    const embedding = await embedTextWithGoogle(question.trim());

    // 2) Retrieve top chunks via Supabase RPC
    const supabase = await createServerSupabaseClient();

    const { data: matches, error } = await supabase.rpc('match_kb_chunks', {
        query_embedding: embedding,
        match_count: 8,
        scope_filter: null,
        list_a_filter: null,
        list_b_filter: null,
    });

    if (error) {
        chatLogger.error('Supabase retrieval failed', { error: error.message });
        return apiError('Knowledge base temporarily unavailable. Please try again.', 503);
    }

    const matchesArray: RagMatch[] = matches ?? [];

    chatLogger.debug('RAG retrieval', {
        question: question.substring(0, 100),
        matchCount: matchesArray.length,
        avgDistance: matchesArray.length > 0
            ? (matchesArray.reduce((acc, m) => acc + m.distance, 0) / matchesArray.length).toFixed(4)
            : 'n/a'
    });

    // Log retrieval for analytics (non-blocking)
    if (matchesArray.length > 0) {
        const avgDistance = matchesArray.reduce((acc, m) => acc + (m.distance || 0), 0) / matchesArray.length;
        supabase.from('retrieval_logs').insert({
            user_id: (await auth()).userId || 'anonymous',
            question,
            matched_chunks: matchesArray.map((m) => ({
                chunk_id: m.chunk_id,
                document_id: m.document_id,
                distance: m.distance
            })),
            avg_distance: avgDistance,
            match_count: matchesArray.length
        }).then(({ error: logError }) => {
            if (logError) chatLogger.error('Failed to log retrieval', { error: logError.message });
        });
    }

    const context = matchesArray
        .map((m) => m.chunk_text)
        .join('\n\n');

    // 3) Stream grounded answer
    const defaultSystemPrompt = `You are a helpful and knowledgeable AI assistant.
  
  Your goal is to answer questions using the provided Context.
  - If the answer is in the Context, use it and cite the source if possible.
  - If the answer is NOT in the Context, say "I don't have that information right now" or ask clarifying questions. DO NOT make up facts.
  - Be friendly, professional, and concise.`;

    const dynamicPrompt = await getSystemPrompt('user_chat', defaultSystemPrompt);

    const systemPrompt = `${dynamicPrompt}
  
  Context:
  ${context}
  `;

    const { userId } = await auth();

    const result = streamText({
        model: chatModel,
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
        onFinish: async (event) => {
            // Log User Message
            const userInsert = await supabase.from('chat_messages').insert({
                user_id: userId || 'anonymous',
                role: 'user',
                content: question,
            });

            if (userInsert.error) {
                chatLogger.error('Failed to save user message', { error: userInsert.error.message });
            }

            // Log Assistant Response
            const assistantInsert = await supabase.from('chat_messages').insert({
                user_id: userId || 'anonymous',
                role: 'assistant',
                content: event.text,
            });

            if (assistantInsert.error) {
                chatLogger.error('Failed to save assistant message', { error: assistantInsert.error.message });
            }
        }
    });

    return result.toUIMessageStreamResponse();
}
