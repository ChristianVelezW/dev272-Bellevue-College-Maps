import { fireEvent, render, screen } from "@testing-library/react-native";
import SearchScreen from "../app/(tabs)/search";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 47, right: 0, bottom: 34, left: 0 }),
}));
jest.mock("expo-image", () => ({ Image: "Image" }));

beforeEach(() => jest.clearAllMocks());

test("filters as you type and clears the query to restore results", async () => {
  await render(<SearchScreen />);
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
  await render(<SearchScreen />);
  await fireEvent.press(screen.getByRole("button", { name: "Buildings" }));
  expect(screen.queryByText("L-201")).toBeNull();
  await fireEvent.press(screen.getByRole("button", { name: "Rooms" }));
  expect(screen.queryByText("BUILDINGS")).toBeNull();
  expect(screen.getByText("L-225")).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole("button", { name: "Accessible" }));
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
  await render(<SearchScreen />);
  const input = screen.getByLabelText("Search building or room");
  await fireEvent.changeText(input, "  L-201  ");
  await fireEvent(input, "submitEditing");
  await fireEvent.changeText(input, "l-201");
  await fireEvent(input, "submitEditing");
  expect(
    screen.getAllByRole("button", { name: /Search again for/i }),
  ).toHaveLength(1);
  await fireEvent.press(screen.getByRole("button", { name: "Buildings" }));
  await fireEvent.press(screen.getByRole("button", { name: "Clear search" }));
  await fireEvent.press(
    screen.getByRole("button", { name: "Search again for l-201" }),
  );
  expect(input).toHaveDisplayValue("l-201");
  expect(screen.getByRole("button", { name: "All" })).toBeSelected();
  expect(screen.getByText("L-201")).toBeOnTheScreen();
});
