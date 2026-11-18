import { fireEvent, render, screen } from "@testing-library/react-native";
import BuildingDetailScreen from "../app/building/[id]";

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

beforeEach(() => {
  mockParams = { id: "L" };
  jest.clearAllMocks();
});

test("shows the requested building and changes the plan, rooms, and destination with its floor", async () => {
  await render(<BuildingDetailScreen />);
  expect(screen.getByText("L Building")).toBeOnTheScreen();
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
    expect(screen.getByText("Building not found")).toBeOnTheScreen();
    expect(screen.queryByRole("tab")).toBeNull();
    await fireEvent.press(
      screen.getByRole("button", { name: "Back to Search" }),
    );
    expect(mockReplace).toHaveBeenCalledWith("/search");
  },
);

test("accepts lowercase and array route parameters without showing another building's rooms", async () => {
  mockParams = { id: ["d"] };
  await render(<BuildingDetailScreen />);
  expect(
    screen.getByText("D Building (Library Media Center)"),
  ).toBeOnTheScreen();
  expect(screen.getByText("D-101 · Main Library Desk")).toBeOnTheScreen();
  expect(screen.queryByText("L-101 · Lecture Hall")).toBeNull();
  expect(screen.queryByRole("tab", { name: "Floor 3" })).toBeNull();
});

test("handles an empty floor and updates to a floor with rooms", async () => {
  mockParams = { id: "N" };
  await render(<BuildingDetailScreen />);
  expect(screen.getByText("No rooms listed on Floor 1.")).toBeOnTheScreen();
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
  const result = await render(<BuildingDetailScreen />);
  await fireEvent.press(screen.getByRole("tab", { name: "Floor 3" }));
  mockParams = { id: "D" };
  await result.rerender(<BuildingDetailScreen />);
  expect(screen.getByRole("tab", { name: "Floor 1" })).toBeSelected();
  expect(screen.getByText("D-101 · Main Library Desk")).toBeOnTheScreen();
});
