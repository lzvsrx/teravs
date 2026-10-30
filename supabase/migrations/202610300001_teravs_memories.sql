begin;

-- A separate table preserves the old device-based store; no automatic import.
create table if not exists public.teravs_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 2000),
  consent boolean not null check (consent = true),
  created_at timestamptz not null default now()
);
create index if not exists teravs_memories_user_created on public.teravs_memories(user_id, created_at desc);
alter table public.teravs_memories enable row level security;
alter table public.teravs_memories force row level security;
revoke all on public.teravs_memories from anon, authenticated;
grant select, insert, delete on public.teravs_memories to authenticated;

drop policy if exists teravs_memory_read on public.teravs_memories;
create policy teravs_memory_read on public.teravs_memories for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists teravs_memory_insert on public.teravs_memories;
create policy teravs_memory_insert on public.teravs_memories for insert to authenticated
  with check ((select auth.uid()) = user_id and consent = true);
drop policy if exists teravs_memory_delete on public.teravs_memories;
create policy teravs_memory_delete on public.teravs_memories for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Serialize inserts per user so parallel requests cannot bypass the quota.
create or replace function public.teravs_check_memory_quota() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null or auth.uid() <> new.user_id then
    raise exception 'Invalid owner' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  if (select count(*) from public.teravs_memories where user_id = new.user_id) >= 100 then
    raise exception 'Memory limit reached' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.teravs_check_memory_quota() from public, anon;
grant execute on function public.teravs_check_memory_quota() to authenticated;
drop trigger if exists teravs_memory_quota on public.teravs_memories;
create trigger teravs_memory_quota before insert on public.teravs_memories
  for each row execute function public.teravs_check_memory_quota();

commit;
