import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { type ComponentProps, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/constants/colors";
import { useCampus } from "@/context/CampusContext";
import {
  campusGraph,
  campusWalkways,
  mainCampusEntranceBuildingId,
} from "@/data/campusGraph";
import { useGuidance } from "@/hooks/useGuidance";
import { useGuidanceCamera } from "@/hooks/useGuidanceCamera";
import type {
  CampusBuilding,
  CampusRoom,
  Maneuver,
  Route,
} from "@/types/campus";
import { buildIndoorSteps } from "@/utils/indoorSteps";

const maneuverIcons = {
  start: "arrow-up",
  "slight-left": "arrow-up-left-box",
  left: "arrow-back",
  "sharp-left": "return-down-back",
  "slight-right": "arrow-up-right-box",
  right: "arrow-forward",
  "sharp-right": "return-down-forward",
  arrive: "location",
} satisfies Record<Maneuver["kind"], ComponentProps<typeof Ionicons>["name"]>;

const entrances = [...campusGraph.nodes.values()].filter(
  (node) => node.entrance,
);
const manualOrigin = `the ${mainCampusEntranceBuildingId} entrance`;

function feet(meters: number) {
  return `${Math.round(meters * 3.281)} ft`;
}

function findDestination(
  buildings: CampusBuilding[],
  roomId: string | undefined,
) {
  const key = roomId?.trim().toLowerCase();
  if (!key) return;
  for (const building of buildings) {
    const room = building.rooms.find(
      (candidate) =>
        candidate.id.toLowerCase() === key ||
        candidate.number.toLowerCase() === key,
    );
    if (room) return { building, room };
  }
}

export default function NavigationScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string | string[] }>();
  const router = useRouter();
  const { buildings, isLoading, error, refreshCampusData, avoidStairs } =
    useCampus();
  const destination = findDestination(
    buildings,
    Array.isArray(roomId) ? roomId[0] : roomId,
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: destination
            ? `Directions to ${destination.room.number}`
            : "Directions",
          headerTitleAlign: "center",
          headerTitleStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: "600",
          },
          headerStyle: { backgroundColor: colors.white },
          headerShadowVisible: false,
          headerTintColor: colors.brand,
        }}
      />
      {destination ? (
        <RoomGuidance {...destination} avoidStairs={avoidStairs} />
      ) : (
        <View style={styles.fallback}>
          {isLoading && <ActivityIndicator color={colors.brand} />}
          <Text style={styles.sectionTitle}>
            {isLoading
              ? "Loading room…"
              : error
                ? "Couldn’t load campus rooms"
                : "Room not found"}
          </Text>
          {!isLoading &&
            (error ? (
              <PrimaryButton label="Try again" onPress={refreshCampusData} />
            ) : (
              <PrimaryButton
                label="Back to Search"
                onPress={() => router.replace("/search")}
              />
            ))}
        </View>
      )}
    </View>
  );
}

function RoomGuidance({
  building,
  room,
  avoidStairs,
}: {
  building: CampusBuilding;
  room: CampusRoom;
  avoidStairs: boolean;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { status, permission, route, maneuvers, progress, position } =
    useGuidance(campusGraph, building.id, building.name, avoidStairs);
  const mapRef = useRef<MapView>(null);
  const camera = useGuidanceCamera(
    mapRef,
    route,
    position,
    progress?.walkedMeters ?? 0,
  );
  const [selection, setSelection] = useState<{
    route: Route;
    index: number;
  } | null>(null);
  const manual = permission === "denied";
  const stepIndex =
    selection && selection.route === route ? selection.index : 0;
  const manualStep = manual ? maneuvers[stepIndex] : undefined;
  const indoors =
    status === "manual-indoors" ||
    status === "arrived" ||
    manualStep?.kind === "arrive";
  const coordinates = route?.coordinates ?? [];
  const walked =
    progress && progress.walkedMeters > 0
      ? [...coordinates.slice(0, progress.splitIndex + 1), progress.splitPoint]
      : [];
  const remaining = manual
    ? coordinates
    : progress && progress.remainingMeters > 0
      ? [progress.splitPoint, ...coordinates.slice(progress.splitIndex + 1)]
      : [];
  const entrance =
    coordinates[coordinates.length - 1] ??
    entrances.find(
      (node) =>
        node.entrance?.buildingId === building.id &&
        (!avoidStairs || node.entrance.accessible),
    )?.coordinate;

  const next = manualStep ?? progress?.nextManeuver;
  const showTurn = (manual || status === "guiding") && next != null;
  const statusMessages = {
    asking: "Allow location access to start directions.",
    locating: "Finding your location…",
    denied:
      manualStep?.text ??
      (avoidStairs
        ? `No step-free route from ${manualOrigin} to this building.`
        : `No walking route from ${manualOrigin} to this building.`),
    "manual-indoors": `Start at ${manualOrigin}.`,
    "location-unavailable": "Location unavailable. Check Location Services.",
    "off-campus": "You’re outside the campus paths. Move closer to a walkway.",
    "no-route": avoidStairs
      ? "No step-free route to this building."
      : "No walking route to this building.",
    rerouting: "Rerouting from your current location…",
    arrived: `You’ve arrived at ${building.name}.`,
    guiding: next?.text ?? "Continue to the entrance.",
  };
  const bannerIcon = showTurn
    ? maneuverIcons[next.kind]
    : indoors
      ? "location"
      : status === "rerouting"
        ? "sync"
        : "locate";
  const remainingMeters =
    status === "arrived"
      ? 0
      : manualStep && route
        ? route.lengthMeters - manualStep.atMeters
        : progress?.remainingMeters;

  return (
    <>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          onMapReady={camera.onMapReady}
          onPanDrag={camera.onPanDrag}
          testID="guidance-map"
          style={StyleSheet.absoluteFill}
          showsUserLocation={permission === "granted"}
          initialRegion={{
            latitude: 47.58455,
            longitude: -122.1485,
            latitudeDelta: 0.0026,
            longitudeDelta: 0.0034,
          }}
        >
          {campusWalkways.map((line, i) => (
            <Polyline
              key={i}
              testID="campus-walkway"
              coordinates={line}
              strokeColor={colors.tintBorder}
              strokeWidth={2}
            />
          ))}
          {walked.length >= 2 && (
            <Polyline
              testID="walked-route"
              coordinates={walked}
              strokeColor={colors.gray}
              strokeWidth={6}
              zIndex={1}
            />
          )}
          {remaining.length >= 2 && (
            <Polyline
              testID="remaining-route"
              coordinates={remaining}
              strokeColor={colors.brand}
              strokeWidth={6}
              zIndex={2}
            />
          )}
          {entrance && (
            <Marker
              testID="destination-entrance"
              coordinate={entrance}
              title={`${building.name} entrance`}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.marker}>
                <Text style={styles.markerCode}>{building.code}</Text>
              </View>
            </Marker>
          )}
        </MapView>
        {camera.canRecenter && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Recenter"
            onPress={camera.recenter}
            style={styles.recenter}
          >
            <Ionicons name="locate" size={18} color={colors.brand} />
            <Text style={styles.controlText}>Recenter</Text>
          </Pressable>
        )}
        <View
          testID="turn-card"
          onLayout={({ nativeEvent }) =>
            camera.setBannerHeight(nativeEvent.layout.height)
          }
          style={styles.instructionCard}
          accessibilityLiveRegion="polite"
        >
          <View style={styles.instructionIcon}>
            <Ionicons name={bannerIcon} size={32} color={colors.white} />
          </View>
          <View style={styles.instructionText}>
            {manualStep && (
              <Text style={styles.manualCaption}>
                {`From ${manualOrigin} · Step ${stepIndex + 1} of ${maneuvers.length}`}
              </Text>
            )}
            {status === "guiding" && progress?.metersToNext != null && (
              <Text style={styles.instructionDistance}>
                {feet(progress.metersToNext)}
              </Text>
            )}
            <Text style={styles.instructionSubtitle}>
              {statusMessages[status]}
            </Text>
            {manual && (
              <View style={styles.permissionActions}>
                <Text style={styles.instructionSubtitle}>Location off</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => Linking.openSettings()}
                  style={styles.settings}
                >
                  <Text style={styles.settingsText}>Open Settings</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>

      <View
        style={[
          styles.bottomDrawer,
          (indoors || maneuvers.length > 0) && styles.expandedDrawer,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.drawerHandle} />
        <View style={styles.tripSummary}>
          <View style={styles.tripDetails}>
            {remainingMeters != null && (
              <Text style={styles.tripValue}>
                {`${Math.ceil(remainingMeters / 1.3 / 60)} min · ${feet(remainingMeters)}`}
              </Text>
            )}
            <Text style={styles.tripSubValue}>
              Room {room.number} · {building.name}
            </Text>
          </View>
          {avoidStairs && (
            <View style={styles.accessibilityChip}>
              <Text style={styles.accessibilityChipText}>No stairs</Text>
            </View>
          )}
        </View>
        {indoors ? (
          <View style={styles.stepsSection}>
            <Text style={styles.sectionTitle}>INDOOR DIRECTIONS</Text>
            <ScrollView style={styles.stepsList}>
              {buildIndoorSteps(building.name, room, avoidStairs).map(
                (instruction, i) => (
                  <View key={instruction} style={styles.stepRow}>
                    <View style={styles.stepIconContainer}>
                      <Text style={styles.controlText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepTitle}>{instruction}</Text>
                  </View>
                ),
              )}
            </ScrollView>
          </View>
        ) : (
          maneuvers.length > 0 && (
            <View style={styles.stepsSection}>
              <Text style={styles.sectionTitle}>DIRECTIONS</Text>
              <ScrollView style={styles.stepsList} nestedScrollEnabled>
                {maneuvers.map((step, i) => (
                  <View
                    key={i}
                    style={[
                      styles.stepRow,
                      manual && i === stepIndex && styles.selectedStep,
                    ]}
                    accessibilityState={
                      manual ? { selected: i === stepIndex } : undefined
                    }
                  >
                    <View style={styles.stepIconContainer}>
                      <Ionicons
                        name={maneuverIcons[step.kind]}
                        size={21}
                        color={colors.brand}
                      />
                    </View>
                    <Text style={styles.stepTitle}>{step.text}</Text>
                    <Text style={styles.stepDistance}>
                      {feet(step.atMeters)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )
        )}
        {manualStep && route && (
          <View style={styles.stepControls}>
            <PrimaryButton
              label="Back"
              variant="secondary"
              disabled={stepIndex === 0}
              onPress={() => setSelection({ route, index: stepIndex - 1 })}
              style={styles.stepButton}
            />
            <PrimaryButton
              label="Next"
              disabled={stepIndex === maneuvers.length - 1}
              onPress={() => setSelection({ route, index: stepIndex + 1 })}
              style={styles.stepButton}
            />
          </View>
        )}
        <PrimaryButton
          label="End Route"
          iconName="close-circle-outline"
          variant="danger"
          onPress={() => router.replace("/")}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  stepControls: { flexDirection: "row", gap: 12 },
  stepButton: { flex: 1, width: "auto", minHeight: 44, paddingVertical: 8 },
  selectedStep: { backgroundColor: colors.tint },
  manualCaption: { color: colors.white, fontWeight: "700", fontSize: 14 },
  permissionActions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: 12,
  },
  settings: { minHeight: 44, justifyContent: "center" },
  settingsText: {
    color: colors.white,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  recenter: {
    position: "absolute",
    bottom: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    minHeight: 44,
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.tintBorder,
  },
  controlText: { fontWeight: "600", color: colors.brand },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  marker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderColor: colors.white,
    borderWidth: 2,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  markerCode: { color: colors.white, fontSize: 16, fontWeight: "700" },
  mapContainer: {
    flex: 1,
    position: "relative",
    minHeight: 100,
  },
  instructionCard: {
    position: "absolute",
    top: 16,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondaryText,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    borderRadius: 14,
  },
  instructionIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: {
    flex: 1,
    gap: 3,
  },
  instructionSubtitle: {
    fontSize: 15,
    color: colors.tint,
  },
  instructionDistance: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
  },
  bottomDrawer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 9,
    gap: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: colors.tintBorder,
    elevation: 8,
  },
  expandedDrawer: { height: "46%" },
  drawerHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 5,
    backgroundColor: "#D1D5DB",
  },
  tripSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 8,
  },
  tripDetails: {
    flex: 1,
    minWidth: 0,
    gap: 9,
  },
  tripValue: {
    ...Platform.select({
      ios: {
        fontSize: 15,
        fontWeight: "700",
      },
      android: {
        fontSize: 22,
        fontWeight: "700",
      },
    }),
    color: colors.text,
  },
  tripSubValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.brand,
  },
  accessibilityChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tintBorder,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  accessibilityChipText: {
    ...Platform.select({
      ios: {
        fontSize: 10,
        fontWeight: "600",
      },
      android: {
        fontSize: 12,
        fontWeight: "600",
      },
    }),
    color: colors.brand,
  },
  stepsSection: {
    flex: 1,
    minHeight: 0,
    gap: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colors.brand,
  },
  stepsList: {
    flex: 1,
  },
  stepRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
    paddingVertical: 6,
  },
  stepIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  stepDistance: {
    fontSize: 11,
    color: colors.secondaryText,
    fontWeight: "600",
  },
});
