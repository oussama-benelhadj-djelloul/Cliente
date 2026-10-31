-- Cliente database schema (Supabase / Postgres)
-- Applied to the Supabase project "cliente" as two migrations:
--   initial_schema, move_helpers_to_private_schema

-- Profiles (one per auth user, created automatically on sign-up)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Companies
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade,
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description text,
  website text, facebook text, linkedin text, instagram text,
  created_at timestamptz not null default now()
);
create index companies_owner_id_idx on public.companies (owner_id);

-- Feedbacks
create type public.importance as enum ('nice-to-have','important','critical');
create type public.feedback_status as enum ('new','planned','in_progress','done');

create table public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies on delete cascade,
  author_id uuid not null references auth.users on delete cascade,
  title text not null,
  description text not null,
  importance public.importance not null,
  status public.feedback_status not null default 'new',
  is_private boolean not null default false,
  response text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (company_id, title)
);
create index feedbacks_author_id_idx on public.feedbacks (author_id);

-- Votes (one per user per feedback)
create table public.votes (
  feedback_id uuid not null references public.feedbacks on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (feedback_id, user_id)
);
create index votes_user_id_idx on public.votes (user_id);

-- RLS helper functions (kept out of the public API)
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.owns_company(cid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.companies c where c.id = cid and c.owner_id = (select auth.uid()));
$$;

create or replace function private.can_see_feedback(fid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.feedbacks f
    where f.id = fid
      and (not f.is_private or f.author_id = (select auth.uid()) or private.owns_company(f.company_id))
  );
$$;

revoke all on function private.owns_company(uuid) from public;
revoke all on function private.can_see_feedback(uuid) from public;
grant execute on function private.owns_company(uuid) to anon, authenticated;
grant execute on function private.can_see_feedback(uuid) to anon, authenticated;

-- Row Level Security
alter table public.profiles  enable row level security;
alter table public.companies enable row level security;
alter table public.feedbacks enable row level security;
alter table public.votes     enable row level security;

create policy "Own profile readable" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy "Companies are public" on public.companies
  for select using (true);
create policy "Create own company" on public.companies
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Owner updates company" on public.companies
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Owner deletes company" on public.companies
  for delete to authenticated using (owner_id = (select auth.uid()));

create policy "Visible feedbacks" on public.feedbacks
  for select using (
    not is_private
    or author_id = (select auth.uid())
    or private.owns_company(company_id)
  );
create policy "Users post feedback as themselves" on public.feedbacks
  for insert to authenticated with check (
    author_id = (select auth.uid()) and response is null and status = 'new'
  );
create policy "Company owner manages feedback" on public.feedbacks
  for update to authenticated using (private.owns_company(company_id)) with check (private.owns_company(company_id));
create policy "Author or owner deletes feedback" on public.feedbacks
  for delete to authenticated using (author_id = (select auth.uid()) or private.owns_company(company_id));

create policy "Votes on visible feedback are readable" on public.votes
  for select using (private.can_see_feedback(feedback_id));
create policy "Vote as yourself" on public.votes
  for insert to authenticated with check (user_id = (select auth.uid()) and private.can_see_feedback(feedback_id));
create policy "Remove own vote" on public.votes
  for delete to authenticated using (user_id = (select auth.uid()));
