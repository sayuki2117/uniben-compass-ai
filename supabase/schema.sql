create extension if not exists vector;

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'New chat',
  user_id uuid null,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_url text null,
  audience text not null default 'general',
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.knowledge_documents(id) on delete cascade,
  content text not null,
  source_title text not null,
  source_url text null,
  audience text not null default 'general',
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

create index if not exists knowledge_chunks_embedding_idx
on public.knowledge_chunks
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

create or replace function public.match_knowledge_chunks(
  query_embedding vector(1536),
  match_count int default 5,
  filter_audience text default 'general'
)
returns table (
  id uuid,
  content text,
  source_title text,
  source_url text,
  audience text,
  similarity float
)
language sql stable
as $$
  select
    knowledge_chunks.id,
    knowledge_chunks.content,
    knowledge_chunks.source_title,
    knowledge_chunks.source_url,
    knowledge_chunks.audience,
    1 - (knowledge_chunks.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks
  where knowledge_chunks.audience = filter_audience
     or knowledge_chunks.audience = 'general'
  order by knowledge_chunks.embedding <=> query_embedding
  limit match_count;
$$;

