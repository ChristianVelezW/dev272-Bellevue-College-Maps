// Sprint 1 starter types & seed data for Search and Building Detail screens.
// Safe to expand or connect to a Context/Query layer during data implementation.
export type CampusRoom = {
  id: string;
  number: string;
  name: string;
  floor: number;
  type: "Classroom" | "Computer Lab" | "Office" | "Study";
  isAccessible: boolean;
};

export type CampusBuilding = {
  id: string;
  code: string;
  name: string;
  category: "Academic" | "Student Services" | "Library" | "Dining";
  hours: string;
  walkTime: string;
  floors: number[];
  tags: string[];
  rooms: CampusRoom[];
};
