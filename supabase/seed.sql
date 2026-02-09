-- Seed default system prompts

insert into public.prompt_versions (prompt_key, version, content, author_clerk_user_id, is_active)
values
(
  'user_chat',
  1,
  'You are a helpful AI assistant for a specific knowledge base.

Your goal is to answer user questions using ONLY the provided context.
If the context does not contain the answer, politely state that you do not have that information.
Do not hallucinate or make up facts.

Context will be provided in a <context> block.
',
  'system',
  true
)
on conflict (prompt_key, version) do nothing;

-- Seed sample data (optional, for template demonstration)
insert into public.list_a (name, slug, description)
values 
('Example Category', 'example-category', 'This is an example category (List A) to help you get started.')
on conflict (slug) do nothing;

insert into public.list_b (title, is_active)
values 
('Example Item', true)
on conflict do nothing;
