-- =========================================================================
-- LUXE EVENT AGENCY — SUPABASE DATABASE SCHEMA
-- Скопируйте этот SQL код в Supabase: SQL Editor -> New Query -> Run
-- Скрипт идемпотентен: его можно безопасно запускать и для новой БД,
-- и для обновления уже существующих таблиц.
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
  currency text not null default 'EUR' check (currency in ('EUR', 'MDL')),
  price_from boolean not null default false, -- true = отображать "от / de la / from" перед ценой
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

-- 5. Таблица базы клиентов и досье (CRM / Финансы и Прибыль)
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
  budget_amount numeric default 0,
  budget_currency text not null default 'EUR' check (budget_currency in ('EUR', 'MDL')),
  expenses_amount numeric default 0,
  status text default 'lead', -- 'lead', 'in_discussion', 'contract', 'paid', 'completed', 'archived'
  tags jsonb default '[]'::jsonb,
  notes text,
  preferences text
);

-- 6. Таблица портфолио (хранит фото в Base64 или URL ссылки)
create table if not exists public.portfolio_items (
  id text primary key,
  title_ru text not null,
  title_ro text,
  title_en text,
  category_ru text not null,
  category_ro text,
  category_en text,
  image text not null, -- Хранит Base64 строку (data:image/...;base64,...) или URL
  order_index int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- =========================================================================
-- МИГРАЦИЯ ДЛЯ УЖЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ (безопасное добавление новых колонок)
-- =========================================================================
alter table public.catalog_items
  add column if not exists currency text not null default 'EUR';

alter table public.catalog_items
  add column if not exists price_from boolean not null default false;

alter table public.clients
  add column if not exists budget_amount numeric default 0;

alter table public.clients
  add column if not exists budget_currency text not null default 'EUR';

alter table public.clients
  add column if not exists expenses_amount numeric default 0;

-- Автоматическая миграция старых строковых цен (если в price было "от", "MDL" или "лей")
update public.catalog_items
set
  currency = case
    when lower(price) like '%mdl%' or lower(price) like '%лей%' or lower(price) like '%lei%' then 'MDL'
    else coalesce(currency, 'EUR')
  end,
  price_from = case
    when lower(price) like 'от %' or lower(price) like 'de la %' or lower(price) like 'from %' then true
    else coalesce(price_from, false)
  end
where price is not null;

-- Включение Row Level Security (RLS) и доступ для чтения/записи
alter table public.leads enable row level security;
alter table public.categories enable row level security;
alter table public.catalog_items enable row level security;
alter table public.analytics_visits enable row level security;
alter table public.clients enable row level security;
alter table public.portfolio_items enable row level security;

-- Политики доступа (идемпотентное пересоздание)
drop policy if exists "Allow all operations for anon" on public.leads;
drop policy if exists "Allow all operations for anon" on public.categories;
drop policy if exists "Allow all operations for anon" on public.catalog_items;
drop policy if exists "Allow all operations for anon" on public.analytics_visits;
drop policy if exists "Allow all operations for anon" on public.clients;
drop policy if exists "Allow all operations for anon" on public.portfolio_items;

create policy "Allow all operations for anon" on public.leads for all using (true) with check (true);
create policy "Allow all operations for anon" on public.categories for all using (true) with check (true);
create policy "Allow all operations for anon" on public.catalog_items for all using (true) with check (true);
create policy "Allow all operations for anon" on public.analytics_visits for all using (true) with check (true);
create policy "Allow all operations for anon" on public.clients for all using (true) with check (true);
create policy "Allow all operations for anon" on public.portfolio_items for all using (true) with check (true);

-- Первоначальные работы в портфолио
insert into public.portfolio_items (id, title_ru, title_ro, title_en, category_ru, category_ro, category_en, image, order_index, active)
values
  ('corporate', 'Корпоративные Мероприятия', 'Evenimente Corporative', 'Corporate Events', 'Корпоративы', 'Corporate', 'Corporate', 'https://static.tildacdn.com/tild3237-3161-4437-a361-383537333038/Screenshot_-_2025-10.png', 1, true),
  ('candybar', 'Кэнди Бары', 'Candy Bars', 'Candy Bars', 'Candy Bar', 'Candy Bar', 'Candy Bar', 'https://catering-muscat.ru/img/blog/blog_candy_6.jpg', 2, true),
  ('birthdays', 'Дни Рождения', 'Zile de Naștere', 'Birthdays', 'Частные события', 'Privat', 'Private', 'https://optim.tildacdn.com/tild3961-6363-4562-b862-356434613264/-/resize/824x/-/format/webp/DSC07101.jpg.webp', 3, true),
  ('decor', 'Эксклюзивный Декор', 'Decor Exclusivist', 'Exclusive Decor', 'Декор', 'Decor', 'Decor', 'https://img.freepik.com/free-photo/pink-chrysanthemums-hang-threads-from-ceiling-dinner-hall_1304-3325.jpg?semt=ais_related_payload_trends&w=740&q=80', 4, true),
  ('photozones', 'Эффектные Фотозоны', 'Foto-zone Spectaculoase', 'Spectacular Photo Zones', 'Инсталляции', 'Instalații', 'Installations', 'https://solaair.ru/upload/iblock/93b/i0dm3pdols5q3paylyrd4hmulhirxm82.JPG', 5, true)
on conflict (id) do nothing;

-- Первоначальные категории
insert into public.categories (id, name_ru, name_ro, name_en, order_index)
values
  ('photozones', 'Фотозоны', 'Fotozone', 'Photozones', 1),
  ('decor', 'Декор и Свет', 'Decor și Lumini', 'Decor & Lights', 2),
  ('candybar', 'Candy Bar', 'Candy Bar', 'Candy Bar', 3),
  ('coordination', 'Координация', 'Coordonare', 'Coordination', 4),
  ('turnkey', 'Праздники под ключ', 'Evenimente la cheie', 'Turnkey Events', 5)
on conflict (id) do nothing;
