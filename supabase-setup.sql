-- RAU Lab: live customer reviews (instant publish)
-- Run this entire script once in Supabase Dashboard > SQL Editor.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 50),
  product text not null check (product in (
    'Original Clear',
    'Coffee Scrub',
    'Rose Pink',
    'Peach Nude',
    'Mint Fresh',
    'Honey Glow',
    'Cherry Red',
    'Berry Plump',
    'Golden Gleam'
  )),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(btrim(comment)) between 5 and 600),
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

drop policy if exists "Anyone can read public reviews" on public.reviews;
create policy "Anyone can read public reviews"
  on public.reviews for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can submit a review" on public.reviews;
create policy "Anyone can submit a review"
  on public.reviews for insert
  to anon, authenticated
  with check (true);

grant select, insert on public.reviews to anon, authenticated;

-- Add the table to Realtime only if it is not already enabled.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reviews'
  ) then
    alter publication supabase_realtime add table public.reviews;
  end if;
end $$;
