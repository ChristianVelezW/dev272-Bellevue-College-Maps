import { fireEvent, render, screen } from "@testing-library/react-native";

import Index from "@/app/(tabs)/index";

const mockNavigate = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 47, right: 0, bottom: 34, left: 0 }),
}));

jest.mock("expo-image", () => ({ Image: "Image" }));

beforeEach(() => jest.clearAllMocks());

// Test files live outside src/app: every file in app/ is treated as a route.
test("map screen shows the campus map placeholder", async () => {
  await render(<Index />);

  expect(screen.getByText("Campus map coming soon")).toBeOnTheScreen();
});

test("opens the Search tab when the map search bar is pressed", async () => {
  await render(<Index />);

  await fireEvent.press(
    screen.getByRole("button", { name: "Search building or room" }),
  );

  expect(mockNavigate).toHaveBeenCalledWith("/search");
});
