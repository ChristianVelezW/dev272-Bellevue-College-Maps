import { supabase } from "@/lib/supabase";
import { CampusRoom, RoomRow } from "@/types/campus";

// converts Supabase Room table row into CampusRoom object
export function mapRoomRow(row: RoomRow): CampusRoom {
  return {
    id: row.id,
    building_id: row.building_id,
    number: row.number,
    name: row.name,
    floor: row.floor,
    type: row.type,
    is_accessible: row.is_accessible,
  };
}

// fetches all rooms, ordered by room number
export async function getRooms(): Promise<CampusRoom[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("number", { ascending: true });

  if (error) {
    throw new Error(`Failed to load rooms: ${error.message}`);
  }

  return ((data as RoomRow[] | null) ?? []).map(mapRoomRow);
}

// fetches all rooms for specific building, ordered by floor and room number
export async function getRoomsByBuildingId(
  buildingId: string,
): Promise<CampusRoom[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("building_id", buildingId)
    .order("number", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to load rooms for building "${buildingId}": ${error.message}`,
    );
  }

  return ((data as RoomRow[] | null) ?? []).map(mapRoomRow);
}

// fetches a single room by id, returns null if not found
export async function getRoomById(id: string): Promise<CampusRoom | null> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load room "${id}": ${error.message}`);
  }

  if (!data) return null;
  return mapRoomRow(data as RoomRow);
}
