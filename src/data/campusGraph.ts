import campusPaths from "@/data/campus-paths.json";
import { buildGraph } from "@/utils/graph";

export const mainCampusEntranceBuildingId = "D";

export const { graph: campusGraph } = buildGraph(campusPaths);

export const campusWalkways = campusPaths.features.flatMap(({ geometry }) => {
  const { coordinates } = geometry;
  if (geometry.type !== "LineString" || !coordinates.every(Array.isArray))
    return [];
  return [
    coordinates.map(([longitude, latitude]) => ({ latitude, longitude })),
  ];
});
