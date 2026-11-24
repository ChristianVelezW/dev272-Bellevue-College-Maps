import campusPaths from "@/data/campus-paths.json";
import { buildGraph } from "@/utils/graph";

export const { graph: campusGraph } = buildGraph(campusPaths);
