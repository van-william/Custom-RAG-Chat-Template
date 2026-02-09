'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

export async function createNote(formData: FormData) {
    const supabase = await createServerSupabaseClient();
    const { userId } = await auth();

    const content = formData.get('content') as string;
    const category = formData.get('category') as string;

    if (!content || !category) throw new Error("Content and category are required");

    const { error } = await supabase
        .from('admin_notes')
        .insert([{
            content,
            category,
            is_completed: false,
            created_by: userId || 'system'
        }]);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/notes');
}

export async function deleteNote(id: string) {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('admin_notes')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/notes');
}

export async function toggleNoteCompletion(id: string, is_completed: boolean) {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from('admin_notes')
        .update({ is_completed })
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/notes');
}
