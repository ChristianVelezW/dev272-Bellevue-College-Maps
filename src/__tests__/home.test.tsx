import { fireEvent, render, screen } from "@testing-library/react-native";
import { getBuildings } from "@/api/building";
import { getSavedPlaces } from "@/api/savedPlaces";
import Index from "@/app/(tabs)/index";
import { CampusProvider } from "@/context/CampusContext";
import type { CampusBuilding } from "@/types/campus";

jest.mock("@/api/building", () => ({
  getBuildings: jest.fn(),
}));

jest.mock("@/api/savedPlaces", () => ({
  getSavedPlaces: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ navigate: mockNavigate, push: mockPush }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 47, right: 0, bottom: 34, left: 0 }),
}));

jest.mock("expo-image", () => ({ Image: "Image" }));

const mockBuildings: CampusBuilding[] = [
  {
    id: "D",
    code: "D",
    name: "D Building (Library Media Center)",
    category: "Library",
    hours: "Open until 8:00 PM",
    walk_time: "2 min walk",
    floors: [1, 2],
    tags: ["Accessible entry", "Elevator", "Study Spaces"],
    rooms: [],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (getBuildings as jest.Mock).mockResolvedValue(mockBuildings);
  (getSavedPlaces as jest.Mock).mockResolvedValue([]);
});

test("map screen shows the campus map placeholder", async () => {
  await render(
    <CampusProvider>
      <Index />
    </CampusProvider>,
  );

  expect(screen.getByText("Campus map coming soon")).toBeOnTheScreen();
});

test("opens the Search tab when the map search bar is pressed", async () => {
  await render(
    <CampusProvider>
      <Index />
    </CampusProvider>,
  );

  await fireEvent.press(
    screen.getByRole("button", { name: "Search building or room" }),
  );

  expect(mockNavigate).toHaveBeenCalledWith("/search");
});

test("shows the D Building summary and opens its details", async () => {
  await render(
    <CampusProvider>
      <Index />
    </CampusProvider>,
  );

  expect(
    await screen.findByText("D Building (Library Media Center)"),
  ).toBeOnTheScreen();
  expect(screen.getByText("Library · 2 floors · 2 min walk")).toBeOnTheScreen();

  await fireEvent.press(screen.getByRole("button", { name: "Details" }));

  expect(mockPush).toHaveBeenCalledWith({
    pathname: "/building/[id]",
    params: { id: "D" },
  });
});

test("starts with Library selected and switches the placeholder filter to Food", async () => {
  await render(
    <CampusProvider>
      <Index />
    </CampusProvider>,
  );

  const library = screen.getByRole("button", { name: "Library, filter" });
  const food = screen.getByRole("button", { name: "Food, filter" });
  expect(library).toBeSelected();

  await fireEvent.press(food);

  expect(food).toBeSelected();
  expect(library).not.toBeSelected();
});
