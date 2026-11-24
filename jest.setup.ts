process.env.EXPO_PUBLIC_SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

jest.mock("react-native-maps", () => {
  const { View } = jest.requireActual("react-native");
  return { __esModule: true, default: View, Marker: View, Polyline: View };
});

export {};
