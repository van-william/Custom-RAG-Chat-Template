/**
 * Database Types
 * 
 * TypeScript interfaces for Supabase tables.
 * These should match the schema defined in supabase/schema.sql
 */

// Enums matching database types
export type KbScopeType = 'global' | 'list_a' | 'list_b' | 'user';
export type KbVisibility = 'public' | 'private';
export type KbStatus = 'active' | 'archived' | 'draft';

// Knowledge Base Documents
export interface KbDocument {
    id: string;
    title: string;
    content: string;
    scope_type: KbScopeType;
    visibility: KbVisibility;
    status: KbStatus;
    version: number;
    content_hash: string;
    author_clerk_user_id: string;
    list_a_id: string | null;
    list_b_id: string | null;
    owner_clerk_user_id: string | null;
    created_at: string;
    updated_at: string;
}

// Knowledge Base Chunks (for vector search)
export interface KbChunk {
    id: string;
    document_id: string;
    chunk_index: number;
    chunk_text: string;
    embedding: number[]; // vector(768)
    created_at: string;
}

// List A (Generic Category/Neighborhood)
export interface ListAItem {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    metadata: Record<string, any>;
    created_at: string;
}

// List B (Generic Item/Listing)
export interface ListBItem {
    id: string;
    list_a_id: string | null;
    external_id: string | null;
    title: string;
    fields: Record<string, any>;
    is_active: boolean;
    created_at: string;
}

// Prompt Versions
export interface PromptVersion {
    id: string;
    prompt_key: string;
    version: number;
    content: string;
    is_active: boolean;
    author_clerk_user_id: string | null;
    created_at: string;
}

// Chat Messages (optional/client-side mostly, but good to have)
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    user_id: string;
    created_at: string;
}

// Match result from vector search RPC
export interface KbChunkMatch {
    chunk_id: string;
    document_id: string;
    chunk_text: string;
    distance: number;
}

// Enriched match with document details
export interface EnrichedKbChunkMatch extends KbChunkMatch {
    document: Pick<KbDocument, 'id' | 'title' | 'status' | 'visibility'> | null;
}
