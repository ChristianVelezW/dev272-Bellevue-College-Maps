import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { useCampus } from "../../context/CampusContext";
import { Filter } from "../../components/Filter";

type MapFilter = "Library" | "Food" | "Restrooms" | "Parking";

const MAP_FILTER_OPTIONS: MapFilter[] = [
  "Library",
  "Food",
  "Restrooms",
  "Parking",
];

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<MapFilter>("Library");
  const { getBuildingById } = useCampus();
  const building = getBuildingById("D");

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
          style={({ pressed }) => [styles.searchBar, pressed && styles.pressed]}
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {MAP_FILTER_OPTIONS.map((option) => (
            <Filter
              key={option}
              label={option}
              isSelected={activeFilter === option}
              onPress={() => setActiveFilter(option)}
            />
          ))}
        </ScrollView>
      </View>
      {building ? (
        <View style={styles.buildingCard}>
          <View style={styles.cardHandle} />
          <View style={styles.buildingSummary}>
            <View style={styles.buildingTile}>
              <Text style={styles.buildingCode}>{building.code}</Text>
            </View>
            <View style={styles.buildingText}>
              <Text style={styles.buildingName} numberOfLines={1}>
                {building.name}
              </Text>
              <Text style={styles.buildingSubtitle}>
                {`${building.category} · ${building.floors.length} ${building.floors.length === 1 ? "floor" : "floors"} · ${building.walk_time}`}
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Details"
            accessibilityHint="Opens the building details"
            onPress={() =>
              router.push({
                pathname: "/building/[id]",
                params: { id: building.id },
              })
            }
            style={({ pressed }) => [
              styles.detailsButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.detailsText}>Details</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapLayer: {
    backgroundColor: colors.tint,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  filterScroll: {
    flexGrow: 0,
    marginTop: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  searchIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchIconImage: {
    width: 15,
    height: 15,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    color: colors.gray,
  },
  buildingCard: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tintBorder,
    borderRadius: 16,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
  },
  cardHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    backgroundColor: colors.tintBorder,
    borderRadius: 2,
  },
  buildingSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buildingTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  buildingCode: {
    color: colors.white,
    fontSize: 19,
    fontWeight: "700",
  },
  buildingText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  buildingName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  buildingSubtitle: {
    color: colors.secondaryText,
    fontSize: 14,
  },
  detailsButton: {
    height: 48,
    borderRadius: 26,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsText: {
    color: colors.brand,
    fontSize: 17,
    fontWeight: "600",
  },
});
