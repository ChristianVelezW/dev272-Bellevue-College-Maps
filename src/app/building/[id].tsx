import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LocationRow } from "../../components/LocationRow";
import { colors } from "../../constants/colors";
import { getBuildingById } from "../../data/buildings";
import { CampusBuilding } from "../../types/campus";

function Placeholder({
  label,
  photo = false,
}: {
  label: string;
  photo?: boolean;
}) {
  return (
    <View style={[styles.placeholder, photo && styles.photo]}>
      <Image
        source={require("../../../assets/building-detail/placeholder-diagonal-down.svg")}
        style={StyleSheet.absoluteFill}
        contentFit="fill"
        accessibilityElementsHidden
      />
      <Image
        source={require("../../../assets/building-detail/placeholder-diagonal-up.svg")}
        style={StyleSheet.absoluteFill}
        contentFit="fill"
        accessibilityElementsHidden
      />
      <View style={styles.placeholderPill}>
        <Text style={styles.placeholderText}>{label}</Text>
      </View>
    </View>
  );
}

export default function BuildingDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const buildingId = Array.isArray(id) ? id[0] : id;
  const building = buildingId ? getBuildingById(buildingId) : undefined;
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/search");
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: "Building",
          headerTitleAlign: "center",
          headerTitleStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: "600",
          },
          headerStyle: { backgroundColor: colors.white },
          headerShadowVisible: false,
          headerTintColor: colors.brand,
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={goBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Image
                source={require("../../../assets/building-detail/chevron-left.svg")}
                style={styles.backIcon}
                accessibilityElementsHidden
              />
            </Pressable>
          ),
        }}
      />
      {building ? (
        <BuildingContent key={building.id} building={building} />
      ) : (
        <View style={styles.fallbackContainer}>
          <View style={styles.letterBadge}>
            <Text style={styles.letter}>?</Text>
          </View>
          <Text style={styles.title}>Building not found</Text>
          <Text style={[styles.subtitle, styles.fallbackText]}>
            We couldn’t find this campus building. Go back to Search to find a
            building or room.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryButton,
              styles.fallbackButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace("/search")}
          >
            <Text style={styles.primaryButtonText}>Back to Search</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function BuildingContent({ building }: { building: CampusBuilding }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedFloor, setSelectedFloor] = useState(1);
  const activeFloor = building.floors.includes(selectedFloor)
    ? selectedFloor
    : building.floors[0];
  const roomsOnFloor = building.rooms.filter(
    (room) => room.floor === activeFloor,
  );
  const primaryRoom = roomsOnFloor[0];
  const navigateToRoom = (roomId: string) =>
    router.push({ pathname: "/navigate/[roomId]", params: { roomId } });

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Placeholder label="Building photo" photo />
        <View
          style={[
            styles.content,
            { paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right },
          ]}
        >
          <View style={styles.summary}>
            <View style={styles.letterBadge}>
              <Text style={styles.letter}>{building.code}</Text>
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.title}>{building.name}</Text>
              <Text style={styles.subtitle}>
                {building.hours} · {building.walkTime}
              </Text>
            </View>
            <View style={styles.star}>
              <Image
                source={require("../../../assets/building-detail/star.svg")}
                style={styles.starIcon}
                accessibilityElementsHidden
              />
            </View>
          </View>
          <View style={styles.tagRow}>
            {building.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          {building.floors.length > 0 ? (
            <View
              style={styles.floorPicker}
              accessibilityRole="tablist"
              accessibilityLabel="Building floors"
            >
              {building.floors.map((floor) => (
                <Pressable
                  key={floor}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeFloor === floor }}
                  style={({ pressed }) => [
                    styles.floorButton,
                    activeFloor === floor && styles.floorButtonActive,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setSelectedFloor(floor)}
                >
                  <Text
                    style={[
                      styles.floorText,
                      activeFloor === floor && styles.floorTextActive,
                    ]}
                  >
                    Floor {floor}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <Placeholder
            label={
              activeFloor === undefined
                ? "Floor plan unavailable"
                : `Floor plan · Floor ${activeFloor}${roomsOnFloor[0] ? ` (room ${roomsOnFloor[0].number.replace(`${building.code}-`, "")} highlighted)` : ""}`
            }
          />
          <Text style={styles.sectionLabel} accessibilityRole="header">
            {activeFloor === undefined
              ? "ROOMS"
              : `ROOMS ON FLOOR ${activeFloor}`}
          </Text>
          <View>
            {roomsOnFloor.length === 0 ? (
              <Text style={[styles.subtitle, styles.emptyRooms]}>
                {activeFloor === undefined
                  ? "No rooms listed for this building."
                  : `No rooms listed on Floor ${activeFloor}.`}
              </Text>
            ) : (
              roomsOnFloor.map((room) => (
                <LocationRow
                  key={room.id}
                  variant="building"
                  title={`${room.number} · ${room.name}`}
                  subtitle={
                    room.isAccessible ? `${room.type} · Accessible` : room.type
                  }
                  badge={room.number.replace(`${building.code}-`, "")}
                  onPress={() => navigateToRoom(room.number)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
      {primaryRoom ? (
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              paddingLeft: 20 + insets.left,
              paddingRight: 20 + insets.right,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() => navigateToRoom(primaryRoom.number)}
          >
            <Text style={styles.primaryButtonText}>
              Directions to {primaryRoom.number}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 12 },
  content: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  summary: { flexDirection: "row", alignItems: "center", gap: 12 },
  summaryText: { flex: 1, gap: 2 },
  letterBadge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  letter: { color: colors.white, fontSize: 21, fontWeight: "700" },
  title: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 33,
    fontWeight: "700",
  },
  subtitle: { color: colors.secondaryText, fontSize: 14, lineHeight: 20 },
  star: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  starIcon: { width: 18.1042, height: 17.4625 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 7,
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  tagText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  floorPicker: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  floorButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  floorButtonActive: {
    backgroundColor: colors.white,
    borderColor: colors.tintBorder,
  },
  floorText: {
    color: colors.secondaryText,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  floorTextActive: { color: colors.text, fontWeight: "600" },
  placeholder: {
    height: 120,
    backgroundColor: colors.tint,
    borderWidth: 1,
    borderColor: colors.tintBorder,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  photo: { height: 150 },
  placeholderPill: {
    backgroundColor: colors.tint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    maxWidth: "100%",
  },
  placeholderText: {
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  sectionLabel: {
    color: colors.brand,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  emptyRooms: { paddingVertical: 16 },
  bottomBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.tintBorder,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  pressed: { opacity: 0.7 },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { width: 9, height: 16 },
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  fallbackText: { textAlign: "center", maxWidth: 320 },
  fallbackButton: { alignSelf: "stretch", marginTop: 12 },
});
