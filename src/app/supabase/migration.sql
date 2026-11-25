-- Update saved_places: allow empty room_id, set FK to ON DELETE SET NULL, add location_type and notes
alter table public.saved_places
  alter column room_id drop not null,
  drop constraint if exists saved_places_room_id_fkey,
  add constraint saved_places_room_id_fkey
    foreign key (room_id) references public.rooms(id) on delete set null;

alter table public.saved_places
  add column if not exists location_type text not null default 'Other' check (location_type in ('Study Spot', 'Classroom', 'Food', 'Office', 'Other')),
  add column if not exists notes text;

-- Update reports: add optional room_id foreign key
alter table public.reports
  add column if not exists room_id text references public.rooms(id) on delete set null;