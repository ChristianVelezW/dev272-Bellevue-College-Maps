import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, styles.mapLayer]}>
        <Text style={styles.placeholder}>Campus map coming soon</Text>
      </View>
      <View style={[styles.topOverlay, { paddingTop: insets.top + 9 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search building or room"
          accessibilityHint="Opens the Search tab"
          onPress={() => router.navigate("/search")}
          style={({ pressed }) => [
            styles.searchBar,
            pressed && styles.searchBarPressed,
          ]}
        >
          <View
            style={styles.searchIcon}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Image
              source={require("../../../assets/search/search.svg")}
              style={styles.searchIconImage}
              accessible={false}
            />
          </View>
          <Text style={styles.searchText} numberOfLines={1}>
            Search building or room
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.tint,
  },
  mapLayer: {
    backgroundColor: colors.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  searchBar: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tintBorder,
    borderRadius: 12,
  },
  searchBarPressed: {
    opacity: 0.7,
  },
  searchIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchIconImage: {
    width: 14.7917,
    height: 14.7917,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: colors.gray,
  },
});
