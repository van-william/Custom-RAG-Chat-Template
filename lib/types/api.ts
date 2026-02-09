/**
 * API Types
 * 
 * TypeScript interfaces for API request/response shapes.
 */

// Standard API error response
export interface ApiError {
    error: string;
    code?: string;
    details?: Record<string, unknown>;
}

// Standard API success response wrapper
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    success: boolean;
}

// Chat API
export interface ChatRequest {
    messages: ChatMessageInput[];
}

export interface ChatMessageInput {
    role: 'user' | 'assistant' | 'system';
    content: string | ContentPart[];
}

export interface ContentPart {
    type: 'text' | 'image';
    text?: string;
    image_url?: string;
}

// Embeddings API
export interface CreateDocumentRequest {
    title: string;
    content: string;
    scope_type: string;
    visibility: string;
    status: string;
    neighborhood_id?: string;
    listing_id?: string;
    managed_rental_id?: string;
}

export interface CreateDocumentResponse {
    id: string;
    success: boolean;
}

// Prompts API
export interface PromptsResponse {
    prompts: Array<{
        id: string;
        prompt_key: string;
        version: number;
        content: string;
        is_active: boolean;
        created_at: string;
    }>;
}

export interface CreatePromptRequest {
    key: string;
    content: string;
}

export interface CreatePromptResponse {
    success: boolean;
    version: number;
}

// System Health
export interface SystemHealthStatus {
    supabase: boolean;
    llm: boolean;
    internet: boolean;
    timestamp: string;
}

// Chat Users (for admin logs)
export interface ChatUser {
    id: string;
    name: string;
    email: string;
    image: string;
}

// Pagination
export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
