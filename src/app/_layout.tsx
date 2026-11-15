import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="building/[id]"
        options={{ title: "Building Details" }}
      />
      <Stack.Screen
        name="navigate/[roomId]"
        options={{ title: "Directions" }}
      />
      <Stack.Screen
        name="place/new"
        options={{
          presentation: "modal",
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          presentation: "modal",
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
