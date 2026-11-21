import { fireEvent, render, screen } from "@testing-library/react-native";
import { getBuildings } from "@/api/building";
import { getSavedPlaces } from "@/api/savedPlaces";
import type { CampusBuilding, SavedPlace } from "@/types/campus";
import SearchScreen from "@/app/(tabs)/search";
import { CampusProvider } from "@/context/CampusContext";

jest.mock("@/api/building", () => ({
  getBuildings: jest.fn(),
}));

jest.mock("@/api/savedPlaces", () => ({
  getSavedPlaces: jest.fn(),
}));

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 47, right: 0, bottom: 34, left: 0 }),
}));
jest.mock("expo-image", () => ({ Image: "Image" }));

const mockBuildings: CampusBuilding[] = [
  {
    id: "L",
    code: "L",
    name: "L Building",
    category: "Academic",
    hours: "Open until 10:00 PM",
    walk_time: "4 min walk",
    floors: [1, 2, 3],
    tags: ["Accessible entry", "Elevator", "Restrooms"],
    rooms: [
      {
        id: "L-101",
        building_id: "L",
        number: "L-101",
        name: "Lecture Hall",
        floor: 1,
        type: "Classroom",
        is_accessible: true,
      },
      {
        id: "L-201",
        building_id: "L",
        number: "L-201",
        name: "Classroom",
        floor: 2,
        type: "Classroom",
        is_accessible: true,
      },
      {
        id: "L-225",
        building_id: "L",
        number: "L-225",
        name: "Faculty Office",
        floor: 2,
        type: "Office",
        is_accessible: false,
      },
    ],
  },
];

const mockSavedPlaces: SavedPlace[] = [];

beforeEach(() => {
  jest.clearAllMocks();
  (getBuildings as jest.Mock).mockResolvedValue(mockBuildings);
  (getSavedPlaces as jest.Mock).mockResolvedValue(mockSavedPlaces);
});

test("filters as you type and clears the query to restore results", async () => {
  await render(
    <CampusProvider>
      <SearchScreen />
    </CampusProvider>,
  );
  await screen.findByText("L-101");

  const input = screen.getByLabelText("Search building or room");
  expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  await fireEvent.changeText(input, "l-201");
  expect(screen.getByText("ROOMS · 1 RESULT")).toBeOnTheScreen();
  expect(screen.getByText("L-201")).toBeOnTheScreen();
  expect(screen.queryByText("L-101")).toBeNull();
  await fireEvent.press(screen.getByRole("button", { name: "Clear search" }));
  expect(input).toHaveDisplayValue("");
  expect(screen.getByText("L-101")).toBeOnTheScreen();
  expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  await fireEvent.changeText(input, "no-such-room");
  expect(screen.getByText("No matching rooms.")).toBeOnTheScreen();
  expect(screen.getByText("No matching buildings.")).toBeOnTheScreen();
});

test("retains category and accessibility filters and opens a room's building", async () => {
  await render(
    <CampusProvider>
      <SearchScreen />
    </CampusProvider>,
  );
  await screen.findByText("L-201");

  await fireEvent.press(
    screen.getByRole("button", { name: "Buildings, filter" }),
  );
  expect(screen.queryByText("L-201")).toBeNull();
  await fireEvent.press(screen.getByRole("button", { name: "Rooms, filter" }));
  expect(screen.queryByText("BUILDINGS")).toBeNull();
  expect(screen.getByText("L-225")).toBeOnTheScreen();
  await fireEvent.press(
    screen.getByRole("button", { name: "Accessible, filter" }),
  );
  expect(screen.queryByText("L-225")).toBeNull();
  await fireEvent.press(screen.getByText("L-201"));
  expect(mockPush).toHaveBeenCalledWith({
    pathname: "/building/[id]",
    params: { id: "L" },
  });
  expect(
    screen.getByRole("button", { name: "Search again for L-201" }),
  ).toBeOnTheScreen();
});

test("remembers submitted searches once and recalls them across filters", async () => {
  await render(
    <CampusProvider>
      <SearchScreen />
    </CampusProvider>,
  );
  await screen.findByText("L-201");

  const input = screen.getByLabelText("Search building or room");
  await fireEvent.changeText(input, "  L-201  ");
  await fireEvent(input, "submitEditing");
  await fireEvent.changeText(input, "l-201");
  await fireEvent(input, "submitEditing");
  expect(
    screen.getAllByRole("button", { name: /Search again for/i }),
  ).toHaveLength(1);
  await fireEvent.press(
    screen.getByRole("button", { name: "Buildings, filter" }),
  );
  await fireEvent.press(screen.getByRole("button", { name: "Clear search" }));
  await fireEvent.press(
    screen.getByRole("button", { name: "Search again for l-201" }),
  );
  expect(input).toHaveDisplayValue("l-201");
  expect(screen.getByRole("button", { name: "All, filter" })).toBeSelected();
  expect(screen.getByText("L-201")).toBeOnTheScreen();
});
