import { supabase } from "@/lib/supabase";
import {
  CreateSavedPlaceInput,
  SavedPlace,
  SavedPlaceRow,
  UpdateSavedPlaceInput,
} from "@/types/campus";

// converts saved_places table into object
export function mapSavedPlaceRow(row: SavedPlaceRow): SavedPlace {
  return {
    id: row.id,
    building_id: row.building_id,
    room_id: row.room_id,
    label: row.label,
    created_at: row.created_at,
  };
}

// fetches all saved places, ordered by newest
export async function getSavedPlaces(): Promise<SavedPlace[]> {
  const { data, error } = await supabase
    .from("saved_places")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load saved places: ${error.message}`);
  }

  return ((data as SavedPlaceRow[] | null) ?? []).map(mapSavedPlaceRow);
}

// inserts new saved place and returns the created record
export async function createSavedPlace(
  input: CreateSavedPlaceInput,
): Promise<SavedPlace> {
  const { data, error } = await supabase
    .from("saved_places")
    .insert({
      building_id: input.building_id,
      room_id: input.room_id,
      label: input.label ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to save place: ${error.message}`);
  }

  return mapSavedPlaceRow(data as SavedPlaceRow);
}

// updates saved place's label by id and returns updated record
export async function updateSavedPlace(
  id: string,
  input: UpdateSavedPlaceInput,
): Promise<SavedPlace> {
  const { data, error } = await supabase
    .from("saved_places")
    .update({
      ...(input.label !== undefined ? { label: input.label } : {}),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update saved place: ${error.message}`);
  }

  return mapSavedPlaceRow(data as SavedPlaceRow);
}

// deletes a saved place from Supabase by id
export async function deleteSavedPlace(id: string): Promise<void> {
  const { error } = await supabase.from("saved_places").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete saved place: ${error.message}`);
  }
}
