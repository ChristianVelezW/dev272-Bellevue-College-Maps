import { render, screen } from "@testing-library/react-native";

import Index from "@/app/(tabs)/index";

// to make sure there's a value for insets, even if there is no notch
jest.mock("react-native-safe-area-context", () => ({
  ...jest.requireActual("react-native-safe-area-context"),
  useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
}));

// Test files live outside src/app: every file in app/ is treated as a route.
// This starter test proves Jest works. Replace it when you replace the screen.
test("home screen shows app name", async () => {
  await render(<Index />);

  expect(screen.getByText("BC Maps")).toBeOnTheScreen();
});
