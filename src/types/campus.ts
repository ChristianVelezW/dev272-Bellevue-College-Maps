// Sprint 1 starter types & seed data for Search and Building Detail screens.
// Safe to expand or connect to a Context/Query layer during data implementation.
export type BuildingCatergory =
  "Academic" | "Student Services" | "Library" | "Dining";

export type RoomType = "Classroom" | "Computer Lab" | "Office" | "Study";

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type PathNode = {
  id: number;
  coordinate: Coordinate;
  entrance?: { buildingId: string; accessible: boolean };
};

export type PathEdge = {
  from: number;
  to: number;
  lengthMeters: number;
  stairs: boolean;
};

export type CampusGraph = {
  nodes: Map<number, PathNode>;
  neighbors: Map<number, { nodeId: number; edge: PathEdge }[]>;
};

export type Route = {
  nodeIds: number[];
  coordinates: Coordinate[];
  lengthMeters: number;
};

export type Maneuver = {
  kind:
    | "start"
    | "slight-left"
    | "left"
    | "sharp-left"
    | "slight-right"
    | "right"
    | "sharp-right"
    | "arrive";
  atMeters: number;
  coordinate: Coordinate;
  text: string;
};

export type RouteProgress = {
  walkedMeters: number;
  remainingMeters: number;
  offRouteMeters: number;
  nextManeuver: Maneuver | null;
  metersToNext: number | null;
  splitIndex: number;
  splitPoint: Coordinate;
};

export type ReportCategory =
  "Bug" | "Feature Request" | "Wrong Information" | "Other";

export type LocationType =
  "Study Spot" | "Classroom" | "Food" | "Office" | "Other";

export type CampusRoom = {
  id: string;
  building_id?: string;
  number: string;
  name: string;
  floor: number;
  type: RoomType;
  is_accessible: boolean;
};

export type CampusBuilding = {
  id: string;
  code: string;
  name: string;
  category: BuildingCatergory;
  hours: string;
  walk_time: string;
  floors: number[];
  tags: string[];
  rooms: CampusRoom[];
};

export type BuildingRow = {
  id: string;
  code: string;
  name: string;
  category: BuildingCatergory;
  hours: string;
  walk_time: string;
  floors: number[];
  tags: string[];
  created_at: string;
};

export type RoomRow = {
  id: string;
  building_id: string;
  number: string;
  name: string;
  floor: number;
  type: RoomType;
  is_accessible: boolean;
  created_at: string;
};

export type SavedPlaceRow = {
  id: string;
  building_id: string;
  room_id: string | null;
  label: string | null;
  location_type: LocationType;
  notes: string | null;
  created_at: string;
};

export type SavedPlace = {
  id: string;
  building_id: string;
  room_id: string | null;
  label: string | null;
  location_type: LocationType;
  notes: string | null;
  created_at: string;
};

export type CreateSavedPlaceInput = {
  building_id: string;
  room_id: string | null;
  label: string | null;
  location_type: LocationType;
  notes: string | null;
};

export type UpdateSavedPlaceInput = {
  label?: string | null;
};

export type ReportRow = {
  id: string;
  category: ReportCategory;
  building_id: string | null;
  room_id: string | null;
  description: string;
  created_at: string;
};

export type IssueReport = {
  id: string;
  category: ReportCategory;
  building_id: string | null;
  room_id: string | null;
  description: string;
  created_at: string;
};

export type CreateIssueReportInput = {
  category: ReportCategory;
  building_id: string;
  room_id?: string | null;
  description: string;
};
