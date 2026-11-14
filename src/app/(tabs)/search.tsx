// Bare-bones functional screen (search/filter state, dynamic [id] lookup, and route params).
// Styled with minimal StyleSheet shells so UI polish can be layered in without altering logic.
// Note: `as unknown as Href` on /navigate/[roomId] can be simplified once navigation routes merge.
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LocationRow } from "../../components/LocationRow";
import { CAMPUS_BUILDINGS } from "../../data/buildings";

type FilterOption = "All" | "Buildings" | "Rooms" | "Accessible";

const FILTER_OPTIONS: FilterOption[] = [
  "All",
  "Buildings",
  "Rooms",
  "Accessible",
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");

  const normalizedQuery = query.trim().toLowerCase();

  const matchingBuildings = CAMPUS_BUILDINGS.filter((building) => {
    const matchesText =
      normalizedQuery === "" ||
      building.name.toLowerCase().includes(normalizedQuery) ||
      building.code.toLowerCase().includes(normalizedQuery);

    const matchesAccessible =
      activeFilter !== "Accessible" ||
      building.tags.some((tag) => tag.toLowerCase().includes("accessible"));

    return matchesText && matchesAccessible;
  });

  const matchingRooms = CAMPUS_BUILDINGS.flatMap((building) =>
    building.rooms
      .filter((room) => {
        const matchesText =
          normalizedQuery === "" ||
          room.number.toLowerCase().includes(normalizedQuery) ||
          room.name.toLowerCase().includes(normalizedQuery) ||
          building.name.toLowerCase().includes(normalizedQuery);

        const matchesAccessible =
          activeFilter !== "Accessible" || room.isAccessible;

        return matchesText && matchesAccessible;
      })
      .map((room) => ({
        ...room,
        buildingId: building.id,
        buildingName: building.name,
      })),
  );

  const showRooms =
    activeFilter === "All" ||
    activeFilter === "Rooms" ||
    activeFilter === "Accessible";
  const showBuildings =
    activeFilter === "All" ||
    activeFilter === "Buildings" ||
    activeFilter === "Accessible";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Search Campus</Text>

      <TextInput
        style={styles.input}
        placeholder="Search building or room (e.g. L-201)"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((option) => (
          <Pressable
            key={option}
            style={[
              styles.filterChip,
              activeFilter === option && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(option)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === option && styles.filterTextActive,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      {showRooms ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ROOMS ({matchingRooms.length})
          </Text>
          {matchingRooms.length === 0 ? (
            <Text style={styles.emptyText}>No matching rooms.</Text>
          ) : (
            matchingRooms.map((room) => (
              <LocationRow
                key={room.id}
                title={room.number}
                subtitle={`${room.buildingName} · Floor ${room.floor} · ${room.name}`}
                badge={room.isAccessible ? "Accessible" : undefined}
                onPress={() =>
                  router.push({
                    pathname: "/building/[id]",
                    params: { id: room.buildingId },
                  } as unknown as unknown as Href)
                }
              />
            ))
          )}
        </View>
      ) : null}

      {showBuildings ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            BUILDINGS ({matchingBuildings.length})
          </Text>
          {matchingBuildings.length === 0 ? (
            <Text style={styles.emptyText}>No matching buildings.</Text>
          ) : (
            matchingBuildings.map((building) => (
              <LocationRow
                key={building.id}
                title={building.name}
                subtitle={`${building.floors.length} floors · ${building.hours}`}
                onPress={() =>
                  router.push({
                    pathname: "/building/[id]",
                    params: { id: building.id },
                  } as unknown as Href)
                }
              />
            ))
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  filterText: {
    fontSize: 13,
    color: "#111827",
  },
  filterTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
  },
});
