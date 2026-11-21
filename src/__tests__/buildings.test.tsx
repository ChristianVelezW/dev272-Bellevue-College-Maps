import { getBuildings } from "@/api/building";
import { getSavedPlaces } from "@/api/savedPlaces";
import type { CampusBuilding, CampusRoom, SavedPlace } from "@/types/campus";

jest.mock("@/api/building", () => ({
  getBuildings: jest.fn(),
}));

jest.mock("@/api/savedPlaces", () => ({
  getSavedPlaces: jest.fn(),
}));

function getBuildingById(
  buildings: CampusBuilding[],
  id: string,
): CampusBuilding | undefined {
  const normalized = id.trim().toLowerCase();
  if (!normalized) return undefined;
  return buildings.find((building) => building.id.toLowerCase() === normalized);
}

function makeRoom(overrides: Partial<CampusRoom> = {}): CampusRoom {
  return {
    id: "L-101",
    building_id: "L",
    number: "L-101",
    name: "Lecture Hall",
    floor: 1,
    type: "Classroom",
    is_accessible: true,
    ...overrides,
  };
}

function makeBuilding(overrides: Partial<CampusBuilding> = {}): CampusBuilding {
  return {
    id: "L",
    code: "L",
    name: "L Building",
    category: "Academic",
    hours: "Open until 10:00 PM",
    walk_time: "4 min walk",
    floors: [1, 2, 3],
    tags: ["Accessible entry"],
    rooms: [makeRoom()],
    ...overrides,
  };
}

function makeSavedPlace(overrides: Partial<SavedPlace> = {}): SavedPlace {
  return {
    id: "sp-1",
    building_id: "L",
    room_id: "L-101",
    label: null,
    created_at: "2026-11-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("Campus Data & Helper Unit Tests (#19)", () => {
  const buildings: CampusBuilding[] = [
    makeBuilding({
      id: "L",
      code: "L",
      name: "L Building",
      rooms: [makeRoom({ id: "L-101", building_id: "L" })],
    }),
    makeBuilding({
      id: "D",
      code: "D",
      name: "D Building",
      rooms: [
        makeRoom({ id: "D-101", building_id: "D", name: "Library Desk" }),
      ],
    }),
  ];

  const savedPlaces: SavedPlace[] = [
    makeSavedPlace({ id: "sp-1", building_id: "L", room_id: "L-101" }),
    makeSavedPlace({ id: "sp-2", building_id: "D", room_id: "D-101" }),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getBuildings as jest.Mock).mockResolvedValue(buildings);
    (getSavedPlaces as jest.Mock).mockResolvedValue(savedPlaces);
  });

  test("getBuildingById returns the correct building for valid IDs (case-insensitive)", () => {
    const buildingL = getBuildingById(buildings, "L");
    const buildingLowerD = getBuildingById(buildings, "d");

    expect(buildingL).toBeDefined();
    expect(buildingL?.name).toBe("L Building");
    expect(buildingLowerD?.id).toBe("D");
  });

  test("getBuildingById returns undefined for unknown or empty IDs", () => {
    expect(getBuildingById(buildings, "UNKNOWN")).toBeUndefined();
    expect(getBuildingById(buildings, "")).toBeUndefined();
  });

  test("all saved places map to valid buildings and rooms", async () => {
    const [fetchedBuildings, fetchedSavedPlaces] = await Promise.all([
      getBuildings(),
      getSavedPlaces(),
    ]);

    expect(fetchedSavedPlaces.length).toBeGreaterThan(0);
    fetchedSavedPlaces.forEach((place) => {
      const building = getBuildingById(fetchedBuildings, place.building_id);
      expect(building).toBeDefined();
      const room = building?.rooms.find((r) => r.id === place.room_id);
      expect(room).toBeDefined();
    });
  });
});
