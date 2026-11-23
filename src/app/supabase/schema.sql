-- ==========================================
-- BC Maps Sprint 2 Database Schema & Seed
-- ==========================================

-- 1. Buildings table (matches CampusBuilding in src/types/campus.ts)
create table if not exists public.buildings (
  id text primary key,
  code text not null,
  name text not null,
  category text not null check (category in ('Academic', 'Student Services', 'Library', 'Dining')),
  hours text not null,
  walk_time text not null,
  floors integer[] not null default '{}',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 2. Rooms table (matches CampusRoom in src/types/campus.ts)
create table if not exists public.rooms (
  id text primary key,
  building_id text not null references public.buildings(id) on delete cascade,
  number text not null,
  name text not null,
  floor integer not null,
  type text not null check (type in ('Classroom', 'Computer Lab', 'Office', 'Study')),
  is_accessible boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Saved Places table (used by Profile & Save Place modal)
create table if not exists public.saved_places (
  id uuid primary key default gen_random_uuid(),
  building_id text not null references public.buildings(id) on delete cascade,
  room_id text not null references public.rooms(id) on delete cascade,
  label text,
  created_at timestamptz not null default now()
);

-- 4. Issue Reports table (used by Report an Issue modal)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('Bug', 'Feature Request', 'Wrong Information', 'Other')),
  building_id text references public.buildings(id) on delete set null,
  description text not null check (char_length(trim(description)) > 0),
  created_at timestamptz not null default now()
);

-- ==========================================
-- Row Level Security (RLS) & Policies
-- ==========================================

alter table public.buildings enable row level security;
alter table public.rooms enable row level security;
alter table public.saved_places enable row level security;
alter table public.reports enable row level security;

-- Buildings & Rooms: public read-only catalog
create policy "Allow public read buildings"
  on public.buildings for select to anon using (true);

create policy "Allow public read rooms"
  on public.rooms for select to anon using (true);

-- Saved Places: read, insert, and delete
create policy "Allow public read saved_places"
  on public.saved_places for select to anon using (true);

create policy "Allow public insert saved_places"
  on public.saved_places for insert to anon with check (true);

create policy "Allow public delete saved_places"
  on public.saved_places for delete to anon using (true);

-- Reports: read and insert
create policy "Allow public read reports"
  on public.reports for select to anon using (true);

create policy "Allow public insert reports"
  on public.reports for insert to anon with check (true);

grant usage on schema public to anon;

grant select on table public.buildings to anon;
grant select on table public.rooms to anon;
grant select, insert, delete on table public.saved_places to anon;
grant select, insert on table public.reports to anon;

-- ==========================================
-- Seed Data (5 Buildings, Rooms, Saved Places)
-- ==========================================

insert into public.buildings (id, code, name, category, hours, walk_time, floors, tags) values
  ('L', 'L', 'L Building', 'Academic', 'Open until 10:00 PM', '4 min walk', '{1,2,3}', '{"Accessible entry","Elevator","Restrooms"}'),
  ('D', 'D', 'D Building (Library Media Center)', 'Library', 'Open until 8:00 PM', '2 min walk', '{1,2}', '{"Accessible entry","Elevator","Study Spaces"}'),
  ('C', 'C', 'C Building (Cafeteria & Student Union)', 'Dining', 'Open until 7:00 PM', '3 min walk', '{1,2}', '{"Accessible entry","Food","Restrooms"}'),
  ('N', 'N', 'N Building', 'Academic', 'Open until 9:00 PM', '5 min walk', '{1,2}', '{"Accessible entry","Elevator"}'),
  ('R', 'R', 'R Building', 'Academic', 'Open until 9:00 PM', '6 min walk', '{1,2,3}', '{"Accessible entry","Elevator","Restrooms"}')
on conflict (id) do nothing;

insert into public.rooms (id, building_id, number, name, floor, type, is_accessible) values
  ('L-101', 'L', 'L-101', 'Lecture Hall', 1, 'Classroom', true),
  ('L-201', 'L', 'L-201', 'Classroom', 2, 'Classroom', true),
  ('L-205', 'L', 'L-205', 'Classroom', 2, 'Classroom', true),
  ('L-210', 'L', 'L-210', 'Computer Lab', 2, 'Computer Lab', true),
  ('L-225', 'L', 'L-225', 'Faculty Office', 2, 'Office', false),
  ('L-302', 'L', 'L-302', 'Quiet Study Room', 3, 'Study', true),
  ('D-101', 'D', 'D-101', 'Main Library Desk', 1, 'Study', true),
  ('D-204', 'D', 'D-204', 'Media Lab', 2, 'Computer Lab', true),
  ('C-102', 'C', 'C-102', 'Main Dining Commons', 1, 'Study', true),
  ('C-212', 'C', 'C-212', 'Student Government Office', 2, 'Office', true),
  ('N-201', 'N', 'N-201', 'Computer Science Lab', 2, 'Computer Lab', true),
  ('R-110', 'R', 'R-110', 'Seminar Room', 1, 'Classroom', true)
on conflict (id) do nothing;

insert into public.saved_places (building_id, room_id, label) values
  ('D', 'D-101', 'Library Study Spot'),
  ('L', 'L-302', 'Quiet Study');