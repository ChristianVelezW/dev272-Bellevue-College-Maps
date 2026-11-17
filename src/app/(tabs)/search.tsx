import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LocationRow } from "../../components/LocationRow";
import { colors } from "../../constants/colors";
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
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  function rememberSearch(value: string) {
    const term = value.trim();
    if (!term) return;
    setRecentSearches((previous) =>
      [
        term,
        ...previous.filter((item) => item.toLowerCase() !== term.toLowerCase()),
      ].slice(0, 5),
    );
  }

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
        buildingCode: building.code,
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
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.heading}>
            Search
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.searchField}>
            <View
              style={styles.searchIcon}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Image
                source={require("../../../assets/search/search.svg")}
                style={styles.searchIconImage}
              />
            </View>
            <TextInput
              ref={inputRef}
              style={styles.input}
              accessibilityLabel="Search building or room"
              placeholder="Search building or room (e.g. L-201)"
              placeholderTextColor={colors.secondaryText}
              selectionColor={colors.brand}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => rememberSearch(query)}
            />
            {query.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={13}
                style={styles.clearButton}
                onPress={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
              >
                <Image
                  source={require("../../../assets/search/close.svg")}
                  style={styles.clearIconImage}
                  accessibilityElementsHidden
                />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.filterRow}>
            {FILTER_OPTIONS.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: activeFilter === option }}
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
                ROOMS · {matchingRooms.length}{" "}
                {matchingRooms.length === 1 ? "RESULT" : "RESULTS"}
              </Text>
              {matchingRooms.length === 0 ? (
                <Text style={styles.emptyText}>No matching rooms.</Text>
              ) : (
                <View>
                  {matchingRooms.map((room) => (
                    <LocationRow
                      key={room.id}
                      title={room.number}
                      subtitle={`${room.buildingName} · Floor ${room.floor} · ${room.name}`}
                      variant="building"
                      badge={room.buildingCode}
                      accessibilityLabel={`${room.number}, ${room.buildingName}, Floor ${room.floor}, ${room.name}${room.isAccessible ? ", Accessible" : ""}`}
                      onPress={() => {
                        rememberSearch(query || room.number);
                        router.push({
                          pathname: "/building/[id]",
                          params: { id: room.buildingId },
                        });
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : null}

          {showBuildings ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>BUILDINGS</Text>
              {matchingBuildings.length === 0 ? (
                <Text style={styles.emptyText}>No matching buildings.</Text>
              ) : (
                <View>
                  {matchingBuildings.map((building) => (
                    <LocationRow
                      key={building.id}
                      title={building.name}
                      subtitle={`${building.floors.length} floors · ${building.hours}`}
                      variant="building"
                      badge={building.code}
                      onPress={() => {
                        rememberSearch(query || building.name);
                        router.push({
                          pathname: "/building/[id]",
                          params: { id: building.id },
                        });
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : null}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RECENT</Text>
            {recentSearches.length === 0 ? (
              <Text style={styles.emptyText}>
                Your recent searches will appear here.
              </Text>
            ) : (
              <View style={styles.filterRow}>
                {recentSearches.map((term) => (
                  <Pressable
                    key={term}
                    accessibilityRole="button"
                    accessibilityLabel={`Search again for ${term}`}
                    style={styles.filterChip}
                    onPress={() => {
                      setQuery(term);
                      setActiveFilter("All");
                      rememberSearch(term);
                    }}
                  >
                    <Text style={styles.filterText}>{term}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  container: { paddingBottom: 24 },
  header: {
    minHeight: 60,
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  content: { paddingTop: 4, paddingHorizontal: 20, gap: 14 },
  heading: {
    fontSize: 30,
    lineHeight: 40,
    fontWeight: "700",
    color: colors.text,
  },
  searchField: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
  },
  searchIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchIconImage: { width: 14.7917, height: 14.7917 },
  clearButton: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  clearIconImage: { width: 10.3125, height: 10.3125 },
  input: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    padding: 0,
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    minHeight: 34,
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: colors.brand,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  filterTextActive: {
    color: colors.white,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 0.768,
    color: colors.brand,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.secondaryText,
  },
});
