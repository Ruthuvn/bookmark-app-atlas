-- Dev Atlas Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories table
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null, -- Hugeicons icon name
  color text, -- Optional hex color
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, name)
);

-- Bookmarks table
create table if not exists public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text,
  url text not null,
  og_image_url text, -- Cached OpenGraph image
  og_image_url_thumb text, -- Pre-optimized thumbnail URL (300x169px WebP)
  favicon_url text, -- Website favicon
  favicon_url_thumb text, -- Pre-optimized favicon URL (32x32px WebP)
  media_type text check (media_type in ('youtube', 'vimeo', 'default')),
  media_embed_id text, -- YouTube video ID or Vimeo ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User preferences table
create table if not exists public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  sidebar_expanded boolean default true,
  theme text default 'system',
  -- Desktop preferences
  view_mode_desktop text default 'card' check (view_mode_desktop in ('card', 'list')),
  card_columns_desktop integer default 4 check (card_columns_desktop between 2 and 8),
  list_columns_desktop integer default 1 check (list_columns_desktop between 1 and 5),
  group_columns_desktop integer default 1 check (group_columns_desktop between 1 and 3),
  -- Mobile preferences
  view_mode_mobile text default 'card' check (view_mode_mobile in ('card', 'list')),
  card_columns_mobile integer default 1 check (card_columns_mobile between 1 and 2),
  list_columns_mobile integer default 1 check (list_columns_mobile between 1 and 2),
  group_columns_mobile integer default 1 check (group_columns_mobile between 1 and 2),
  -- Collapsed categories (synced across devices)
  collapsed_categories text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists categories_user_id_order_idx on public.categories(user_id, "order");
create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);
create index if not exists bookmarks_category_id_idx on public.bookmarks(category_id);
create index if not exists bookmarks_user_id_created_at_idx on public.bookmarks(user_id, created_at desc);

-- Enable Row Level Security (RLS)
alter table public.categories enable row level security;
alter table public.bookmarks enable row level security;
alter table public.user_preferences enable row level security;

-- RLS Policies for categories
drop policy if exists "Users can view their own categories" on public.categories;
create policy "Users can view their own categories"
  on public.categories for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own categories" on public.categories;
create policy "Users can insert their own categories"
  on public.categories for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own categories" on public.categories;
create policy "Users can update their own categories"
  on public.categories for update
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own categories" on public.categories;
create policy "Users can delete their own categories"
  on public.categories for delete
  using ((select auth.uid()) = user_id);

-- RLS Policies for bookmarks
drop policy if exists "Users can view their own bookmarks" on public.bookmarks;
create policy "Users can view their own bookmarks"
  on public.bookmarks for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own bookmarks" on public.bookmarks;
create policy "Users can insert their own bookmarks"
  on public.bookmarks for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own bookmarks" on public.bookmarks;
create policy "Users can update their own bookmarks"
  on public.bookmarks for update
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own bookmarks" on public.bookmarks;
create policy "Users can delete their own bookmarks"
  on public.bookmarks for delete
  using ((select auth.uid()) = user_id);

-- RLS Policies for user_preferences
drop policy if exists "Users can view their own preferences" on public.user_preferences;
create policy "Users can view their own preferences"
  on public.user_preferences for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own preferences" on public.user_preferences;
create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own preferences" on public.user_preferences;
create policy "Users can update their own preferences"
  on public.user_preferences for update
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own preferences" on public.user_preferences;
create policy "Users can delete their own preferences"
  on public.user_preferences for delete
  using ((select auth.uid()) = user_id);

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql set search_path = public;

-- Triggers for updated_at
create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.handle_updated_at();

create trigger bookmarks_updated_at
  before update on public.bookmarks
  for each row execute function public.handle_updated_at();

create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.handle_updated_at();
