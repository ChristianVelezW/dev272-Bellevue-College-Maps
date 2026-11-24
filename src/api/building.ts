import { supabase } from "@/lib/supabase";
import { BuildingRow, CampusBuilding, RoomRow } from "@/types/campus";
import { mapRoomRow } from "./rooms";

type BuildingWithRoomsRow = BuildingRow & { rooms?: RoomRow[] | null };

// converts Supabase Building table row into CampusBuilding object
export function mapBuildingRow(row: BuildingWithRoomsRow): CampusBuilding {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    hours: row.hours,
    walk_time: row.walk_time,
    floors: row.floors,
    tags: row.tags,
    rooms: (row.rooms ?? []).map(mapRoomRow),
  };
}

// fetches all buildings and their rooms alphabetically by name
export async function getBuildings(): Promise<CampusBuilding[]> {
  const { data, error } = await supabase
    .from("buildings")
    .select("*, rooms(*)")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load buildings: ${error.message}`);
  }

  return ((data as BuildingWithRoomsRow[] | null) ?? []).map(mapBuildingRow);
}

// fetches single building and its rooms by id, or returns null if not found
export async function getBuildingById(
  id: string,
): Promise<CampusBuilding | null> {
  const normalizedId = id.trim();
  if (!normalizedId) return null;

  const { data, error } = await supabase
    .from("buildings")
    .select("*, rooms(*)")
    .ilike("id", normalizedId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load building "${id}": ${error.message}`);
  }

  if (!data) return null;
  return mapBuildingRow(data as BuildingWithRoomsRow);
}
