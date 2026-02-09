/**
 * Validation Schemas
 * 
 * Zod schemas for validating API requests and form data.
 */

import { z } from 'zod';

// --- Document Schemas ---

// --- Document Schemas ---

export const kbScopeTypeSchema = z.enum(['global', 'list_a', 'list_b', 'user']);
export const kbVisibilitySchema = z.enum(['public', 'private']);
export const kbStatusSchema = z.enum(['active', 'archived', 'draft']);

export const createDocumentSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: z.string().min(1, 'Content is required'),
    scope_type: kbScopeTypeSchema,
    visibility: kbVisibilitySchema.default('public'),
    status: kbStatusSchema.default('active'),
    list_a_id: z.string().uuid().optional().nullable(),
    list_b_id: z.string().uuid().optional().nullable(),
}).refine(
    (data) => {
        if (data.scope_type === 'list_a' && !data.list_a_id) return false;
        if (data.scope_type === 'list_b' && !data.list_b_id) return false;
        return true;
    },
    { message: 'Scope ID is required for the selected scope type' }
);

export const updateDocumentSchema = createDocumentSchema.extend({
    id: z.string().uuid(),
});

// --- Prompt Schemas ---

export const createPromptSchema = z.object({
    key: z.string().min(1, 'Prompt key is required').max(50, 'Key too long'),
    content: z.string().min(1, 'Content is required'),
});

// --- List Item Schemas ---

export const createListASchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export const createListBSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
});

// --- Change Request Schemas ---

export const changeRequestTypeSchema = z.enum(['feature', 'bug']);
export const changeRequestStatusSchema = z.enum(['open', 'in_progress', 'completed', 'rejected']);
export const changeRequestPrioritySchema = z.enum(['low', 'medium', 'high']);

export const createChangeRequestSchema = z.object({
    request_type: changeRequestTypeSchema,
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().optional().nullable(),
    priority: changeRequestPrioritySchema.default('medium'),
});

// --- Search/Pagination Schemas ---

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const searchDocumentsSchema = paginationSchema.extend({
    search: z.string().optional(),
    status: kbStatusSchema.optional(),
    scope_type: kbScopeTypeSchema.optional(),
});

// --- Chat Schemas ---

export const chatMessageSchema = z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.union([
        z.string(),
        z.array(z.object({
            type: z.enum(['text', 'image']),
            text: z.string().optional(),
            image_url: z.string().url().optional(),
        })),
    ]),
});

export const chatRequestSchema = z.object({
    messages: z.array(chatMessageSchema).min(1, 'At least one message is required'),
});

// Type exports
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type CreateListAInput = z.infer<typeof createListASchema>;
export type CreateListBInput = z.infer<typeof createListBSchema>;
export type CreateChangeRequestInput = z.infer<typeof createChangeRequestSchema>;
export type SearchDocumentsInput = z.infer<typeof searchDocumentsSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
