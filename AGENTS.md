# AGENTS.md for Generic RAG Template

**Document purpose.** This file defines the “agents” that power the application’s chat and admin workflows, including their responsibilities, tool/API contracts, safety constraints, and operational notes.

**System context.** The app is a three-route Next.js App Router application deployed on Vercel, with Supabase Postgres (pgvector) as the vector store + system of record, Clerk as the authentication layer, and the Vercel AI SDK for chat streaming, tool calling, and embeddings.

**Date / timezone.** 2026-02-02 (America/Chicago).

## Overview

### Routes, agents, and primary outcomes

The product has three primary user surfaces (routes), each powered by one primary agent:

| Route | Primary user | Agent | Outcome |
|---|---|---|---|
| `/chat` | end users | **User RAG Chat Agent** | Answer questions grounded in retrieved knowledge (List A/B items + global info). |
| `/admin/chat` | Admin User | **Admin Chat Agent (HITL)** | Propose knowledge/prompt/embedding changes as drafts and require explicit confirmation before applying. |
| `/admin/embeddings` | Admin User | **Admin Embeddings Management Agent** | View, organize, and apply CRUD + batch operations to embedding-backed knowledge items. |

### Execution boundaries and invariants

The agents are built using Next.js Route Handlers (server) and AI SDK UI hooks (client), which together provide streaming chat and tool invocation flows.

**Hard invariants (must always hold):**

1. **User RAG Chat Agent never writes to the knowledge base.** It can only read knowledge that the requesting user is allowed to access.
2. **Admin Chat Agent never applies changes without human confirmation.** All state changes must pass a “propose → confirm → apply” barrier.
3. **Every vector retrieval is permission-aware.** Vector search operates on pgvector in Postgres; access control is implemented using Row Level Security (RLS) and/or permission-aware filtering.

### API surfaces (Route Handlers)

Next.js Route Handlers live in the `app/` directory and implement HTTP methods (GET/POST/etc.).

| Endpoint | Method | Used by | Purpose |
|---|---:|---|---|
| `/api/chat` | POST | User RAG Chat Agent | Accept UI messages, retrieve context via vector search, stream grounded answer. |
| `/api/admin/chat` | POST | Admin Chat Agent | Stream proposals, create draft change requests, request confirmation. |
| `/api/admin/embeddings` | GET/POST | Admin Embeddings Mgmt Agent | List knowledge docs/scopes; create new docs; batch actions. |
| `/api/admin/embeddings/:id` | GET/PATCH/DELETE | Admin Embeddings Mgmt Agent | CRUD for a single knowledge doc; trigger re-embed. |
| `/api/admin/change-requests/:id/confirm` | POST | Admin Chat Agent | Atomically approve + apply a change request, then re-embed as needed. |

## Shared architecture, data model, and conventions

### Canonical knowledge representation for RAG

This system uses a two-layer knowledge structure:

- **Knowledge Documents**: human-editable “units of truth” (e.g., “List A: Category X summary”, “List B: Item Y facts”, “Global policies”).  
- **Knowledge Chunks**: smaller, retrievable segments of documents, each with a pgvector embedding.

### Scope taxonomy

Every knowledge document and its chunks are categorized into exactly one scope:

- **global**: system-wide info (policies, general guidance)
- **list_a**: info specific to an item in List A (e.g., Categories, Neighborhoods, Topics)
- **list_b**: info specific to an item in List B (e.g., Listings, Products, Entities)
- **user**: user-scoped info (private notes or preferences)

> **Note on Renaming**: The database tables are named `list_a` and `list_b` for maximum flexibility. You should rename the **UI labels** (e.g., in the Admin Dashboard) to match your domain, but keep the underlying table names consistent to ensure the retrieval logic (`match_kb_chunks`) works out of the box.

### Minimum schema elements referenced by agents

The exact schema may vary, but agents assume these core concepts exist in Supabase Postgres:

| Concept | Required fields (minimum) | Used by |
|---|---|---|
| list_a | `id`, `name`, `slug`, optional metadata | retrieval filters; admin organization |
| list_b | `id`, `list_a_id` (optional), canonical facts | retrieval grounding; admin edits |
| kb_documents | `id`, `scope_type`, optional FK (`list_a_id` or `list_b_id`), `content`, `visibility`, lifecycle status | all agents |
| kb_chunks | `id`, `document_id`, `chunk_text`, `embedding vector(dim)` | user retrieval; admin QA |
| prompt_versions | `prompt_key`, `version`, `content` | user + admin chat behavior |
| change_requests | `id`, `status`, target reference, JSON payload patch, audit metadata | admin HITL workflow |

### Vector indexing requirements

As the chunks table grows, create a vector index (HNSW recommended) to prevent sequential scans.

### Shared agent toolchain (AI SDK)

All agent implementations use the AI SDK’s primitives:
- `streamText()` for chat streaming.
- `embed()` and `embedMany()` for embedding generation.
- `useChat()` for UI state management.
- Human-in-the-loop patterns for safe mutations.

## User RAG Chat Agent

### Mission and contract

**Goal.** Provide helpful, grounded answers about List A/B items and global knowledge by retrieving relevant chunks.

**What it must not do.** It must not modify embeddings, prompts, or list items.

### Workflow (server-side)

1. Accepts UI messages.
2. Extracts user query.
3. Computes query embedding.
4. Executes permission-aware vector search (Supabase RPC).
5. Constructs grounded system context.
6. Streams assistant response.

### Data access rules

- Reads: `kb_documents` + `kb_chunks` as permitted by RLS.
- Optional reads: `list_a`, `list_b` for structured rendering.
- Writes: none.

## Admin Chat Agent with human-in-the-loop confirmation

### Mission and contract

**Goal.** Let Admin “talk to the system” to create or update knowledge and prompts via a conversational interface, requiring explicit approval for mutations.

### Responsibilities

- Draft new or updated knowledge documents (global/list_a/list_b/user scope).
- Draft prompt updates.
- Create durable “pending change request” records.
- Apply changes after confirmation.

### Example admin conversation scripts

**Proposal script example:**

> Admin: “Add a new global rule: Always check List A context first.”
> Agent: (1) Summarizes the change; (2) shows diff; (3) requests confirmation; (4) outputs `changeRequestId`.

**Confirmation script example:**

> Admin: “Confirm 3f8a…”
> Agent: Applies change, updates prompt version, regenerates embeddings, and confirms success.

## Admin Embeddings Management Agent

### Mission and contract

**Goal.** Provide deterministic, auditable management of the full embeddings corpus: viewing, organizing, updating, and re-embedding knowledge across scope categories.

### Responsibilities

- List knowledge documents by scope and by foreign key.
- Inspect derived chunks and embedding state.
- Support edits and re-embedding.
- Manage scope assignments.

### Embeddings UI structure (recommended)

- **Left panel:** Filter by List A / List B.
- **Main table:** Documents list.
- **Detail view:** Editor, chunk preview, re-embed actions.

## Authentication, authorization, and safety controls

### Role-based access control

- **Roles:** `user` (default), `admin`.
- **Enforcement:** Clerk middleware + Supabase RLS.

### Admin confirmation safety mechanisms

1. **RBAC gating**: Only admin can reach admin routes.
2. **HITL gating**: AI SDK tool approval flows.
3. **Durable change requests**: DB-level pending mutation objects.

### Operational conventions

> [!NOTE]  
> **Proxy Naming**: In Next.js 16+, the `middleware.ts` file convention is **deprecated** and renamed to `proxy.ts`.  
> This project uses Next.js 16+, so we use `proxy.ts` for authentication and edge routing rules. Do not rename it back to `middleware.ts`.