import { createContext, ReactNode, useContext, useState } from "react";
import {
  CAMPUS_BUILDINGS,
  getBuildingById as lookupBuildingById,
  SAVED_PLACES,
} from "../data/buildings";
import { CampusBuilding } from "../types/campus";

export type SavedPlace = {
  id: number;
  buildingId: string;
  roomId: string;
};

type CampusContextValue = {
  buildings: CampusBuilding[];
  savedPlaces: SavedPlace[];
  accessibleOnly: boolean;
  avoidStairs: boolean;
  setAccessibleOnly: (value: boolean) => void;
  setAvoidStairs: (value: boolean) => void;
  getBuildingById: (id: string) => CampusBuilding | undefined;
  addSavedPlace: (buildingId: string, roomId: string) => void;
};

const CampusContext = createContext<CampusContextValue>({
  buildings: CAMPUS_BUILDINGS,
  savedPlaces: SAVED_PLACES,
  accessibleOnly: false,
  avoidStairs: false,
  setAccessibleOnly: () => {},
  setAvoidStairs: () => {},
  getBuildingById: lookupBuildingById,
  addSavedPlace: () => {},
});

export function CampusProvider({ children }: { children: ReactNode }) {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(SAVED_PLACES);
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [avoidStairs, setAvoidStairs] = useState(false);

  const addSavedPlace = (buildingId: string, roomId: string) => {
    setSavedPlaces((prev) => [...prev, { id: Date.now(), buildingId, roomId }]);
  };

  return (
    <CampusContext.Provider
      value={{
        buildings: CAMPUS_BUILDINGS,
        savedPlaces,
        accessibleOnly,
        avoidStairs,
        setAccessibleOnly,
        setAvoidStairs,
        getBuildingById: lookupBuildingById,
        addSavedPlace,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  return useContext(CampusContext);
}
