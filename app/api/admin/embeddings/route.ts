import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess, validateRequest, createDocumentSchema } from '@/lib/validation';
import { createHash } from 'crypto';

function computeContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex').substring(0, 16);
}

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return apiError('Unauthorized', 401);
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from('kb_documents')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        return apiError(error.message, 500);
    }

    return apiSuccess(data);
}

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return apiError('Unauthorized', 401);
    }

    const body = await req.json();
    const validation = validateRequest(createDocumentSchema, body);

    if (!validation.success) {
        return validation.error;
    }

    const { title, content, scope_type, list_a_id, list_b_id } = validation.data;

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from('kb_documents')
        .insert({
            title,
            content,
            scope_type,
            author_clerk_user_id: userId,
            content_hash: computeContentHash(content),
            list_a_id: scope_type === 'list_a' ? list_a_id : null,
            list_b_id: scope_type === 'list_b' ? list_b_id : null,
        })
        .select()
        .single();

    if (error) {
        return apiError(error.message, 500);
    }

    return apiSuccess(data, 201);
}

