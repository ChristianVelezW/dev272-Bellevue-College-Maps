import { getBuildingById, SAVED_PLACES } from "../data/buildings";

describe("Campus Data & Helper Unit Tests (#19)", () => {
  test("getBuildingById returns the correct building for valid IDs (case-insensitive)", () => {
    const buildingL = getBuildingById("L");
    const buildingLowerD = getBuildingById("d");

    expect(buildingL).toBeDefined();
    expect(buildingL?.name).toBe("L Building");
    expect(buildingLowerD?.id).toBe("D");
  });

  test("getBuildingById returns undefined for unknown or empty IDs", () => {
    expect(getBuildingById("UNKNOWN")).toBeUndefined();
    expect(getBuildingById("")).toBeUndefined();
  });

  test("all saved places map to valid buildings and rooms", () => {
    expect(SAVED_PLACES.length).toBeGreaterThan(0);
    SAVED_PLACES.forEach((place) => {
      const building = getBuildingById(place.buildingId);
      expect(building).toBeDefined();
      const room = building?.rooms.find((r) => r.id === place.roomId);
      expect(room).toBeDefined();
    });
  });
});
