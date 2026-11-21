import { fireEvent, render, screen } from "@testing-library/react-native";
import { getBuildings } from "@/api/building";
import { getSavedPlaces } from "@/api/savedPlaces";
import type { CampusBuilding, SavedPlace } from "@/types/campus";
import ProfileScreen from "../app/(tabs)/profile";
import { CampusProvider } from "../context/CampusContext";

jest.mock("@/api/building", () => ({
  getBuildings: jest.fn(),
}));

jest.mock("@/api/savedPlaces", () => ({
  getSavedPlaces: jest.fn(),
}));

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

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
        id: "L-302",
        building_id: "L",
        number: "L-302",
        name: "Quiet Study Room",
        floor: 3,
        type: "Study",
        is_accessible: true,
      },
    ],
  },
];

const mockSavedPlaces: SavedPlace[] = [
  {
    id: "sp-1",
    building_id: "L",
    room_id: "L-302",
    label: "Quiet Study",
    created_at: "2026-11-01T00:00:00.000Z",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (getBuildings as jest.Mock).mockResolvedValue(mockBuildings);
  (getSavedPlaces as jest.Mock).mockResolvedValue(mockSavedPlaces);
});

describe("Profile Screen", () => {
  test("displays the profile page and all section headers", async () => {
    await render(
      <CampusProvider>
        <ProfileScreen />
      </CampusProvider>,
    );

    expect(screen.getByText("Profile")).toBeOnTheScreen();
    expect(screen.getByText("SAVED PLACES")).toBeOnTheScreen();
    expect(screen.getByText("NAVIGATION")).toBeOnTheScreen();
    expect(screen.getByText("APP")).toBeOnTheScreen();
  });

  test("opens the correct building and floor when a saved place is selected", async () => {
    await render(
      <CampusProvider>
        <ProfileScreen />
      </CampusProvider>,
    );

    await fireEvent.press(await screen.findByText("Quiet Study Room"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/building/[id]",
      params: {
        id: "L",
        floor: "3",
      },
    });
  });

  test("opens the Add Place screen", async () => {
    await render(
      <CampusProvider>
        <ProfileScreen />
      </CampusProvider>,
    );
    await fireEvent.press(screen.getByText("Add Place"));
    expect(mockPush).toHaveBeenCalledWith("/place/new");
  });

  test("opens the Report an Issue screen", async () => {
    await render(
      <CampusProvider>
        <ProfileScreen />
      </CampusProvider>,
    );
    await fireEvent.press(screen.getByText("Report an Issue"));
    expect(mockPush).toHaveBeenCalledWith("/report");
  });

  test("allows users to change navigation settings", async () => {
    await render(
      <CampusProvider>
        <ProfileScreen />
      </CampusProvider>,
    );
    const accessibleSwitch = screen.getByRole("switch", {
      name: "Accessible Routes Only",
    });

    const stairsSwitch = screen.getByRole("switch", {
      name: "Avoid Stairs",
    });

    expect(accessibleSwitch.props.value).toBe(false);
    expect(stairsSwitch.props.value).toBe(false);

    await fireEvent(accessibleSwitch, "valueChange", true);
    expect(accessibleSwitch.props.value).toBe(true);

    await fireEvent(stairsSwitch, "valueChange", true);
    expect(stairsSwitch.props.value).toBe(true);
  });
});
