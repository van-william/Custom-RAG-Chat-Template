-- Enable pgvector (extension name: vector).
create extension if not exists vector;

-- List A (Generic List 1, e.g., Categories, Neighborhoods)
create table if not exists public.list_a (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb, -- Generic metadata field
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- List B (Generic List 2, e.g., Products, Listings)
create table if not exists public.list_b (
  id uuid primary key default gen_random_uuid(),
  list_a_id uuid references public.list_a(id) on delete set null,
  external_id text,              -- optional: external reference ID
  title text not null,           -- Primary display title
  fields jsonb not null default '{}'::jsonb, -- Flexible fields for any data
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Knowledge base documents
do $$ begin
  create type public.kb_scope_type as enum ('global', 'list_a', 'list_b', 'user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.kb_visibility as enum ('public', 'private');
exception when duplicate_object then null; end $$;

create table if not exists public.kb_documents (
  id uuid primary key default gen_random_uuid(),

  -- One of: global, list_a, list_b, user
  scope_type public.kb_scope_type not null,

  list_a_id uuid references public.list_a(id) on delete cascade,
  list_b_id uuid references public.list_b(id) on delete cascade,

  -- Clerk user id for user-scoped docs and authorship tracking.
  owner_clerk_user_id text,
  author_clerk_user_id text not null, -- who created/last updated the document

  visibility public.kb_visibility not null default 'public',

  title text not null,
  source_kind text not null default 'manual', -- manual | import | scrape | etc.
  source_uri text,
  content text not null,                      -- canonical full document content

  content_hash text not null,                 -- stable hash for dedupe/re-embed checks
  version int not null default 1,
  status text not null default 'active',       -- active | archived | draft

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint kb_documents_scope_check check (
    (scope_type = 'global'      and list_a_id is null and list_b_id is null and owner_clerk_user_id is null)
    or
    (scope_type = 'list_a'      and list_a_id is not null and list_b_id is null and owner_clerk_user_id is null)
    or
    (scope_type = 'list_b'      and list_b_id is not null and owner_clerk_user_id is null)
    or
    (scope_type = 'user'        and owner_clerk_user_id is not null)
  )
);

-- Chunk table (vector index lives here).
-- Using 768 for generic embeddings (e.g. Gemini, Nomic).
create table if not exists public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.kb_documents(id) on delete cascade,

  chunk_index int not null,
  chunk_text text not null,
  token_count int,
  metadata jsonb not null default '{}'::jsonb,

  embedding vector(768) not null,

  created_at timestamptz not null default now(),

  unique (document_id, chunk_index)
);

-- Indexing strategy: HNSW
create index if not exists kb_chunks_embedding_hnsw
  on public.kb_chunks using hnsw (embedding vector_cosine_ops);

-- Filter helpers for admin browse
create index if not exists kb_documents_scope_idx
  on public.kb_documents (scope_type, list_a_id, list_b_id, owner_clerk_user_id);

-- Prompt versioning
create table if not exists public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  prompt_key text not null,      -- e.g., 'user_chat_system'
  version int not null,
  content text not null,
  author_clerk_user_id text not null, -- 'system' or admin ID
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Note: 'change_requests' table removed as Admin Chat HITL workflow is removed.
-- Direct admin mutations are now the standard.

-- RLS Setup
alter table public.kb_documents enable row level security;
alter table public.kb_chunks enable row level security;
alter table public.prompt_versions enable row level security;

-- Read public docs
create policy "read public kb_documents"
on public.kb_documents
for select
to authenticated
using (visibility = 'public');

-- Read own user-scoped docs
create policy "read own user kb_documents"
on public.kb_documents
for select
to authenticated
using (scope_type = 'user' and owner_clerk_user_id = (select auth.jwt()->>'sub'));

-- Admin policies (assuming metadata->role = 'admin')
-- NOTE: In production, ensure the claim is properly set in Clerk and propagated.
create policy "admin all kb_documents"
on public.kb_documents
for all
to authenticated
using ((select auth.jwt()->'metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'metadata'->>'role') = 'admin');

-- Chunks visibility matches document
create policy "read chunks if doc readable"
on public.kb_chunks
for select
to authenticated
using (
  exists (
    select 1
    from public.kb_documents d
    where d.id = kb_chunks.document_id
      and (
        d.visibility = 'public'
        or (d.scope_type = 'user' and d.owner_clerk_user_id = (select auth.jwt()->>'sub'))
        or ((select auth.jwt()->'metadata'->>'role') = 'admin')
      )
  )
);

-- Similarity search function
create or replace function public.match_kb_chunks(
  query_embedding vector(768),
  match_count int default 12,
  scope_filter public.kb_scope_type default null,
  list_a_filter uuid default null,
  list_b_filter uuid default null
)
returns table (
  chunk_id uuid,
  document_id uuid,
  chunk_text text,
  distance float
)
language sql stable as $$
  select
    c.id as chunk_id,
    c.document_id,
    c.chunk_text,
    (c.embedding <=> query_embedding) as distance
  from public.kb_chunks c
  join public.kb_documents d on d.id = c.document_id
  where
    d.status = 'active'
    and d.visibility = 'public'
    and (
      scope_filter is null
      or d.scope_type = scope_filter
    )
    and (
      list_a_filter is null
      or d.list_a_id = list_a_filter
    )
    and (
      list_b_filter is null
      or d.list_b_id = list_b_filter
    )
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

