'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addListA(formData: FormData) {
    const name = formData.get('name') as string;
    if (!name) return;

    const supabase = await createServerSupabaseClient();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    await supabase.from('list_a').insert({
        name,
        slug,
    });

    revalidatePath('/admin/lists');
}

export async function deleteListA(id: string) {
    const supabase = await createServerSupabaseClient();
    await supabase.from('list_a').delete().eq('id', id);
    revalidatePath('/admin/lists');
}

export async function addListB(formData: FormData) {
    const title = formData.get('title') as string;
    if (!title) return;

    const supabase = await createServerSupabaseClient();

    await supabase.from('list_b').insert({
        title,
    });

    revalidatePath('/admin/lists');
}

export async function deleteListB(id: string) {
    const supabase = await createServerSupabaseClient();
    await supabase.from('list_b').delete().eq('id', id);
    revalidatePath('/admin/lists');
}
