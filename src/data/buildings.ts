// Sprint 1 starter types & seed data for Search and Building Detail screens.
// Safe to expand or connect to a Context/Query layer during data implementation.
import { CampusBuilding } from "../types/campus";

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: "L",
    code: "L",
    name: "L Building",
    category: "Academic",
    hours: "Open until 10:00 PM",
    walkTime: "4 min walk",
    floors: [1, 2, 3],
    tags: ["Accessible entry", "Elevator", "Restrooms"],
    rooms: [
      {
        id: "L-101",
        number: "L-101",
        name: "Lecture Hall",
        floor: 1,
        type: "Classroom",
        isAccessible: true,
      },
      {
        id: "L-201",
        number: "L-201",
        name: "Classroom",
        floor: 2,
        type: "Classroom",
        isAccessible: true,
      },
      {
        id: "L-205",
        number: "L-205",
        name: "Classroom",
        floor: 2,
        type: "Classroom",
        isAccessible: true,
      },
      {
        id: "L-210",
        number: "L-210",
        name: "Computer Lab",
        floor: 2,
        type: "Computer Lab",
        isAccessible: true,
      },
      {
        id: "L-225",
        number: "L-225",
        name: "Faculty Office",
        floor: 2,
        type: "Office",
        isAccessible: false,
      },
      {
        id: "L-302",
        number: "L-302",
        name: "Quiet Study Room",
        floor: 3,
        type: "Study",
        isAccessible: true,
      },
    ],
  },
  {
    id: "D",
    code: "D",
    name: "D Building (Library Media Center)",
    category: "Library",
    hours: "Open until 8:00 PM",
    walkTime: "2 min walk",
    floors: [1, 2],
    tags: ["Accessible entry", "Elevator", "Study Spaces"],
    rooms: [
      {
        id: "D-101",
        number: "D-101",
        name: "Main Library Desk",
        floor: 1,
        type: "Study",
        isAccessible: true,
      },
      {
        id: "D-204",
        number: "D-204",
        name: "Media Lab",
        floor: 2,
        type: "Computer Lab",
        isAccessible: true,
      },
    ],
  },
  {
    id: "C",
    code: "C",
    name: "C Building (Cafeteria & Student Union)",
    category: "Dining",
    hours: "Open until 7:00 PM",
    walkTime: "3 min walk",
    floors: [1, 2],
    tags: ["Accessible entry", "Food", "Restrooms"],
    rooms: [
      {
        id: "C-102",
        number: "C-102",
        name: "Main Dining Commons",
        floor: 1,
        type: "Study",
        isAccessible: true,
      },
      {
        id: "C-212",
        number: "C-212",
        name: "Student Government Office",
        floor: 2,
        type: "Office",
        isAccessible: true,
      },
    ],
  },
  {
    id: "N",
    code: "N",
    name: "N Building",
    category: "Academic",
    hours: "Open until 9:00 PM",
    walkTime: "5 min walk",
    floors: [1, 2],
    tags: ["Accessible entry", "Elevator"],
    rooms: [
      {
        id: "N-201",
        number: "N-201",
        name: "Computer Science Lab",
        floor: 2,
        type: "Computer Lab",
        isAccessible: true,
      },
    ],
  },
  {
    id: "R",
    code: "R",
    name: "R Building",
    category: "Academic",
    hours: "Open until 9:00 PM",
    walkTime: "6 min walk",
    floors: [1, 2, 3],
    tags: ["Accessible entry", "Elevator", "Restrooms"],
    rooms: [
      {
        id: "R-110",
        number: "R-110",
        name: "Seminar Room",
        floor: 1,
        type: "Classroom",
        isAccessible: true,
      },
    ],
  },
];

export function getBuildingById(id: string): CampusBuilding | undefined {
  return CAMPUS_BUILDINGS.find(
    (building) => building.id.toLowerCase() === id.toLowerCase(),
  );
}
