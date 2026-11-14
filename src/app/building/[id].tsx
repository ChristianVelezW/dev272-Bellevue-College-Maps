// Bare-bones functional screen (search/filter state, dynamic [id] lookup, and route params).
// Styled with minimal StyleSheet shells so UI polish can be layered in without altering logic.
// Note: `as unknown as Href` on /navigate/[roomId] can be simplified once navigation routes merge.
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LocationRow } from "../../components/LocationRow";
import { getBuildingById } from "../../data/buildings";

export default function BuildingDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [selectedFloor, setSelectedFloor] = useState<number>(1);

  const building = id ? getBuildingById(id) : undefined;

  if (!building) {
    return (
      <View style={styles.fallbackContainer}>
        <Stack.Screen options={{ title: "Building Not Found" }} />
        <Text style={styles.title}>Building not found</Text>
        <Text style={styles.subtitle}>
          No campus building matched ID &quot;{id ?? "unknown"}&quot;.
        </Text>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const activeFloor = building.floors.includes(selectedFloor)
    ? selectedFloor
    : (building.floors[0] ?? 1);

  const roomsOnFloor = building.rooms.filter(
    (room) => room.floor === activeFloor,
  );
  const primaryRoom = roomsOnFloor[0] ?? building.rooms[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: building.name }} />

      {/* Building Header */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>{building.name}</Text>
        <Text style={styles.subtitle}>
          {building.hours} · {building.walkTime}
        </Text>

        <View style={styles.tagRow}>
          {building.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Floor Selector */}
      <View style={styles.floorRow}>
        {building.floors.map((floor) => (
          <Pressable
            key={floor}
            style={[
              styles.floorButton,
              activeFloor === floor && styles.floorButtonActive,
            ]}
            onPress={() => setSelectedFloor(floor)}
          >
            <Text
              style={[
                styles.floorButtonText,
                activeFloor === floor && styles.floorButtonTextActive,
              ]}
            >
              Floor {floor}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Floor Plan Placeholder for Eyob's UI Pass */}
      <View style={styles.floorPlanPlaceholder}>
        <Text style={styles.placeholderText}>
          Floor {activeFloor} Plan Placeholder ({building.code} Building)
        </Text>
      </View>

      {/* Rooms on Active Floor */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ROOMS ON FLOOR {activeFloor}</Text>
        {roomsOnFloor.length === 0 ? (
          <Text style={styles.subtitle}>
            No rooms listed on Floor {activeFloor}.
          </Text>
        ) : (
          roomsOnFloor.map((room) => (
            <LocationRow
              key={room.id}
              title={`${room.number} - ${room.name}`}
              subtitle={room.type}
              badge={room.isAccessible ? "Accessible" : undefined}
              onPress={() =>
                router.push({
                  pathname: "/navigate/[roomId]",
                  params: { roomId: room.number },
                } as unknown as Href)
              }
            />
          ))
        )}
      </View>

      {/* Bottom Directions CTA */}
      {primaryRoom ? (
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            router.push({
              pathname: "/navigate/[roomId]",
              params: { roomId: primaryRoom.number },
            } as unknown as Href)
          }
        >
          <Text style={styles.primaryButtonText}>
            Directions to {primaryRoom.number}
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  headerSection: {
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  tag: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#374151",
  },
  floorRow: {
    flexDirection: "row",
    gap: 8,
  },
  floorButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  floorButtonActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  floorButtonText: {
    fontSize: 14,
    color: "#111827",
  },
  floorButtonTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  floorPlanPlaceholder: {
    height: 110,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#9ca3af",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  placeholderText: {
    fontSize: 13,
    color: "#6b7280",
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
