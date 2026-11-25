import { getBuildings } from "@/api/building";
import {
  createSavedPlace,
  deleteSavedPlace,
  getSavedPlaces,
} from "@/api/savedPlaces";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CampusBuilding, LocationType, SavedPlace } from "../types/campus";

export type { SavedPlace } from "@/types/campus";

type CampusContextValue = {
  buildings: CampusBuilding[];
  savedPlaces: SavedPlace[];
  isLoading: boolean;
  error: string | null;
  accessibleOnly: boolean;
  avoidStairs: boolean;
  setAccessibleOnly: (value: boolean) => void;
  setAvoidStairs: (value: boolean) => void;
  getBuildingById: (id: string) => CampusBuilding | undefined;
  refreshCampusData: () => Promise<void>;
  addSavedPlace: (
    buildingId: string,
    roomId: string | null,
    label: string,
    locationType: LocationType,
    notes: string | null,
  ) => Promise<SavedPlace>;
  removeSavedPlace: (id: string) => Promise<void>;
};

const CampusContext = createContext<CampusContextValue>({
  buildings: [],
  savedPlaces: [],
  isLoading: false,
  error: null,
  accessibleOnly: false,
  avoidStairs: false,
  setAccessibleOnly: () => {},
  setAvoidStairs: () => {},
  getBuildingById: () => undefined,
  refreshCampusData: async () => {},
  addSavedPlace: async () => {
    throw new Error("CampusProvider not mounted");
  },
  removeSavedPlace: async () => {
    throw new Error("CampusProvider not mounted");
  },
});

export function CampusProvider({ children }: { children: ReactNode }) {
  const [buildings, setBuildings] = useState<CampusBuilding[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [avoidStairs, setAvoidStairs] = useState(false);

  // loads buildings and saved places from Supabase and updates loading/error state
  const refreshCampusData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedBuildings, fetchedSavedPlaces] = await Promise.all([
        getBuildings(),
        getSavedPlaces(),
      ]);
      setBuildings(fetchedBuildings);
      setSavedPlaces(fetchedSavedPlaces);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load campus data.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // used for manual refreshes
  useEffect(() => {
    let isActive = true;

    async function loadInitialCampusData() {
      setIsLoading(true);
      setError(null);
      try {
        const [fetchedBuildings, fetchedSavedPlaces] = await Promise.all([
          getBuildings(),
          getSavedPlaces(),
        ]);
        if (!isActive) return;
        setBuildings(fetchedBuildings);
        setSavedPlaces(fetchedSavedPlaces);
      } catch (err) {
        if (!isActive) return;
        const message =
          err instanceof Error ? err.message : "Failed to load campus data.";
        setError(message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialCampusData();

    return () => {
      isActive = false;
    };
  }, []);

  // looks up building from already loaded buildings list in context
  const getBuildingById = useCallback(
    (id: string): CampusBuilding | undefined => {
      const normalizedId = id.trim().toLowerCase();
      return buildings.find(
        (building) => building.id.toLowerCase() === normalizedId,
      );
    },
    [buildings],
  );

  // saves place in Supabase and prepends to savedPlaces
  const addSavedPlace = useCallback(
    async (
      building_id: string,
      room_id: string | null,
      label: string,
      location_type: LocationType,
      notes: string | null,
    ): Promise<SavedPlace> => {
      const created = await createSavedPlace({
        building_id,
        room_id,
        label,
        location_type,
        notes,
      });
      setSavedPlaces((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  // deletes a saved place and removes from savedPlace
  const removeSavedPlace = useCallback(async (id: string): Promise<void> => {
    await deleteSavedPlace(id);
    setSavedPlaces((prev) => prev.filter((place) => place.id !== id));
  }, []);

  return (
    <CampusContext.Provider
      value={{
        buildings,
        savedPlaces,
        isLoading,
        error,
        accessibleOnly,
        avoidStairs,
        setAccessibleOnly,
        setAvoidStairs,
        getBuildingById,
        refreshCampusData,
        addSavedPlace,
        removeSavedPlace,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  return useContext(CampusContext);
}
