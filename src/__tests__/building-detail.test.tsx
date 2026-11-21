import { fireEvent, render, screen } from "@testing-library/react-native";
import { getBuildings } from "@/api/building";
import { getSavedPlaces } from "@/api/savedPlaces";
import type { CampusBuilding, SavedPlace } from "@/types/campus";
import BuildingDetailScreen from "@/app/building/[id]";
import { CampusProvider } from "@/context/CampusContext";

jest.mock("@/api/building", () => ({
  getBuildings: jest.fn(),
}));

jest.mock("@/api/savedPlaces", () => ({
  getSavedPlaces: jest.fn(),
}));

let mockParams: { id?: string | string[] } = { id: "L" };
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    canGoBack: () => false,
  }),
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
        id: "L-205",
        building_id: "L",
        number: "L-205",
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
  {
    id: "D",
    code: "D",
    name: "D Building (Library Media Center)",
    category: "Library",
    hours: "Open until 8:00 PM",
    walk_time: "2 min walk",
    floors: [1, 2],
    tags: ["Accessible entry", "Elevator", "Study Spaces"],
    rooms: [
      {
        id: "D-101",
        building_id: "D",
        number: "D-101",
        name: "Main Library Desk",
        floor: 1,
        type: "Study",
        is_accessible: true,
      },
    ],
  },
  {
    id: "N",
    code: "N",
    name: "N Building",
    category: "Academic",
    hours: "Open until 9:00 PM",
    walk_time: "5 min walk",
    floors: [1, 2],
    tags: ["Accessible entry", "Elevator"],
    rooms: [
      {
        id: "N-201",
        building_id: "N",
        number: "N-201",
        name: "Computer Science Lab",
        floor: 2,
        type: "Computer Lab",
        is_accessible: true,
      },
    ],
  },
];

const mockSavedPlaces: SavedPlace[] = [];

beforeEach(() => {
  mockParams = { id: "L" };
  jest.clearAllMocks();
  (getBuildings as jest.Mock).mockResolvedValue(mockBuildings);
  (getSavedPlaces as jest.Mock).mockResolvedValue(mockSavedPlaces);
});

test("shows the requested building and changes the plan, rooms, and destination with its floor", async () => {
  await render(
    <CampusProvider>
      <BuildingDetailScreen />
    </CampusProvider>,
  );
  expect(await screen.findByText("L Building")).toBeOnTheScreen();
  expect(screen.getByText("L-101 · Lecture Hall")).toBeOnTheScreen();

  await fireEvent.press(screen.getByRole("tab", { name: "Floor 2" }));

  expect(screen.getByRole("tab", { name: "Floor 2" })).toBeSelected();
  expect(
    screen.getByText("Floor plan · Floor 2 (room 201 highlighted)"),
  ).toBeOnTheScreen();
  expect(screen.getByText("ROOMS ON FLOOR 2")).toBeOnTheScreen();
  expect(screen.getByText("L-201 · Classroom")).toBeOnTheScreen();
  expect(screen.getByText("L-225 · Faculty Office")).toBeOnTheScreen();
  expect(screen.queryByText("L-101 · Lecture Hall")).toBeNull();

  await fireEvent.press(
    screen.getByRole("button", { name: "Directions to L-201" }),
  );
  expect(mockPush).toHaveBeenCalledWith({
    pathname: "/navigate/[roomId]",
    params: { roomId: "L-201" },
  });

  await fireEvent.press(screen.getByText("L-205 · Classroom"));
  expect(mockPush).toHaveBeenLastCalledWith({
    pathname: "/navigate/[roomId]",
    params: { roomId: "L-205" },
  });
});

test.each(["missing-building", undefined, ""])(
  "recovers safely from building ID %s",
  async (id) => {
    mockParams = { id };
    await render(<BuildingDetailScreen />);
    expect(await screen.findByText("Building not found")).toBeOnTheScreen();
    expect(screen.queryByRole("tab")).toBeNull();
    await fireEvent.press(
      screen.getByRole("button", { name: "Back to Search" }),
    );
    expect(mockReplace).toHaveBeenCalledWith("/search");
  },
);

test("accepts lowercase and array route parameters without showing another building's rooms", async () => {
  mockParams = { id: ["d"] };
  await render(
    <CampusProvider>
      <BuildingDetailScreen />
    </CampusProvider>,
  );
  expect(
    await screen.findByText("D Building (Library Media Center)"),
  ).toBeOnTheScreen();
  expect(screen.getByText("D-101 · Main Library Desk")).toBeOnTheScreen();
  expect(screen.queryByText("L-101 · Lecture Hall")).toBeNull();
  expect(screen.queryByRole("tab", { name: "Floor 3" })).toBeNull();
});

test("handles an empty floor and updates to a floor with rooms", async () => {
  mockParams = { id: "N" };
  await render(
    <CampusProvider>
      <BuildingDetailScreen />
    </CampusProvider>,
  );
  expect(
    await screen.findByText("No rooms listed on Floor 1."),
  ).toBeOnTheScreen();
  expect(screen.getByText("Floor plan · Floor 1")).toBeOnTheScreen();
  expect(screen.queryByRole("button", { name: /^Directions to / })).toBeNull();
  await fireEvent.press(screen.getByRole("tab", { name: "Floor 2" }));
  expect(screen.getByText("N-201 · Computer Science Lab")).toBeOnTheScreen();
  expect(screen.queryByText("No rooms listed on Floor 1.")).toBeNull();
  expect(
    screen.getByText("Floor plan · Floor 2 (room 201 highlighted)"),
  ).toBeOnTheScreen();
  expect(
    screen.getByRole("button", { name: "Directions to N-201" }),
  ).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole("tab", { name: "Floor 1" }));
  expect(screen.getByText("Floor plan · Floor 1")).toBeOnTheScreen();
  expect(screen.queryByRole("button", { name: /^Directions to / })).toBeNull();
});

test("resets the selected floor when the building route changes", async () => {
  const result = await render(
    <CampusProvider>
      <BuildingDetailScreen />
    </CampusProvider>,
  );
  await screen.findByText("L Building");
  await fireEvent.press(screen.getByRole("tab", { name: "Floor 3" }));
  mockParams = { id: "D" };
  await result.rerender(
    <CampusProvider>
      <BuildingDetailScreen />
    </CampusProvider>,
  );
  expect(screen.getByRole("tab", { name: "Floor 1" })).toBeSelected();
  expect(screen.getByText("D-101 · Main Library Desk")).toBeOnTheScreen();
});
