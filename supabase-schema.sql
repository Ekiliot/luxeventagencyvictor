-- =========================================================================
-- LUXE EVENT AGENCY — SUPABASE DATABASE SCHEMA
-- Скопируйте этот SQL код в Supabase: SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Таблица заявок с сайта
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  phone text not null,
  email text,
  service text,
  message text,
  status text default 'new', -- 'new', 'in_progress', 'completed', 'cancelled'
  notes text
);

-- 2. Таблица категорий услуг
create table if not exists public.categories (
  id text primary key,
  name_ru text not null,
  name_ro text,
  name_en text,
  order_index int default 0
);

-- 3. Таблица услуг и прайсов (поддерживает и Base64 текст, и URL ссылки)
create table if not exists public.catalog_items (
  id text primary key,
  category_id text references public.categories(id) on delete cascade,
  title_ru text not null,
  title_ro text,
  title_en text,
  description_ru text,
  description_ro text,
  description_en text,
  price text not null,
  image text not null, -- Хранит ссылку или Base64 строку (data:image/...;base64,...)
  badge text,
  features jsonb default '[]'::jsonb,
  order_index int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- 4. Таблица аналитики и посещаемости
create table if not exists public.analytics_visits (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz default now(),
  path text not null,
  referrer text,
  country text,
  city text,
  device text,
  browser text,
  ip text
);

-- 5. Таблица базы клиентов и досье (CRM / Блокнот команды)
create table if not exists public.clients (
  id text primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  name text not null,
  phone text not null,
  email text,
  event_date text,
  event_type text,
  budget text,
  status text default 'lead', -- 'lead', 'in_discussion', 'contract', 'paid', 'completed', 'archived'
  tags jsonb default '[]'::jsonb,
  notes text,
  preferences text
);

-- Включение Row Level Security (RLS) и доступ для чтения/записи
alter table public.leads enable row level security;
alter table public.categories enable row level security;
alter table public.catalog_items enable row level security;
alter table public.analytics_visits enable row level security;
alter table public.clients enable row level security;

-- Политики доступа (чтение и запись с публичным anon ключом)
create policy "Allow all operations for anon" on public.leads for all using (true) with check (true);
create policy "Allow all operations for anon" on public.categories for all using (true) with check (true);
create policy "Allow all operations for anon" on public.catalog_items for all using (true) with check (true);
create policy "Allow all operations for anon" on public.analytics_visits for all using (true) with check (true);
create policy "Allow all operations for anon" on public.clients for all using (true) with check (true);

-- Первоначальные категории
insert into public.categories (id, name_ru, name_ro, name_en, order_index)
values
  ('photozones', 'Фотозоны', 'Fotozone', 'Photozones', 1),
  ('decor', 'Декор и Свет', 'Decor și Lumini', 'Decor & Lights', 2),
  ('candybar', 'Candy Bar', 'Candy Bar', 'Candy Bar', 3),
  ('coordination', 'Координация', 'Coordonare', 'Coordination', 4),
  ('turnkey', 'Праздники под ключ', 'Evenimente la cheie', 'Turnkey Events', 5)
on conflict (id) do nothing;
