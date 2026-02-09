/**
 * Documents Repository
 * 
 * Centralized data access for kb_documents table.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { KbDocument, KbScopeType, KbStatus, KbVisibility } from '@/lib/types/database';

export interface CreateDocumentData {
    title: string;
    content: string;
    scope_type: KbScopeType;
    visibility?: KbVisibility;
    status?: KbStatus;
    author_clerk_user_id: string;
    content_hash: string;
    list_a_id?: string | null;
    list_b_id?: string | null;
}

export interface UpdateDocumentData extends Partial<CreateDocumentData> {
    id: string;
}

export const documentsRepo = {
    /**
     * Get all documents, ordered by most recently updated.
     */
    async findAll(): Promise<KbDocument[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('kb_documents')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data ?? [];
    },

    /**
     * Get a single document by ID.
     */
    async findById(id: string): Promise<KbDocument | null> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('kb_documents')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(error.message);
        }
        return data;
    },

    /**
     * Create a new document.
     */
    async create(data: CreateDocumentData): Promise<KbDocument> {
        const supabase = await createServerSupabaseClient();
        const { data: created, error } = await supabase
            .from('kb_documents')
            .insert({
                ...data,
                version: 1,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return created;
    },

    /**
     * Update an existing document.
     */
    async update(id: string, data: Partial<CreateDocumentData>): Promise<KbDocument> {
        const supabase = await createServerSupabaseClient();
        const { data: updated, error } = await supabase
            .from('kb_documents')
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return updated;
    },

    /**
     * Delete a document by ID.
     */
    async delete(id: string): Promise<void> {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase
            .from('kb_documents')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    },

    /**
     * Find documents by scope type.
     */
    async findByScope(scope_type: KbScopeType): Promise<KbDocument[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('kb_documents')
            .select('*')
            .eq('scope_type', scope_type)
            .order('updated_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data ?? [];
    },

    /**
     * Find documents by status.
     */
    async findByStatus(status: KbStatus): Promise<KbDocument[]> {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('kb_documents')
            .select('*')
            .eq('status', status)
            .order('updated_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data ?? [];
    },
};
