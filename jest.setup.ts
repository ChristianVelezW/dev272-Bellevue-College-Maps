process.env.EXPO_PUBLIC_SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

jest.mock("react-native-maps", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { View } = jest.requireActual("react-native");
  const mockCamera = { fitToCoordinates: jest.fn(), animateCamera: jest.fn() };
  class MapView extends React.Component {
    fitToCoordinates = mockCamera.fitToCoordinates;
    animateCamera = mockCamera.animateCamera;
    render() {
      return React.createElement(View, this.props);
    }
  }
  return {
    __esModule: true,
    default: MapView,
    Marker: View,
    Polyline: View,
    mockCamera,
  };
});

export {};
