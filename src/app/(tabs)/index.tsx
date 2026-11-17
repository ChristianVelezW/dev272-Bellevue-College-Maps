import { Filter } from "@/components/Filter";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MapFilter =
  | "All"
  | "Buildings"
  | "Rooms"
  | "Food"
  | "Accessible"
  | "Parking"
  | "Bathrooms";

const MAP_FILTERS: MapFilter[] = [
  "All",
  "Buildings",
  "Rooms",
  "Food",
  "Accessible",
  "Parking",
  "Bathrooms",
];

export default function MapScreen() {
  const [activeFilter, setActiveFilter] = useState<MapFilter>("All");
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>BC Maps</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {MAP_FILTERS.map((filter) => (
          <Filter
            key={filter}
            label={filter}
            isSelected={activeFilter === filter}
            onPress={() => setActiveFilter(filter)}
          />
        ))}
      </ScrollView>

      <View>
        <Text>Map Coming Soon!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
