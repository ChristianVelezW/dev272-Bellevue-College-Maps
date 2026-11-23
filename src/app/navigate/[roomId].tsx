import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/constants/colors";
import { useCampus } from "@/context/CampusContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Temp Placeholders text
const ROUTE_STEPS = [
  {
    id: "1",
    icon: "arrow-up" as const,
    title: "Head straight",
    description: "Continue along the main campus walkway",
    distance: "355 ft",
  },
  {
    id: "2",
    icon: "arrow-back" as const,
    title: "Turn left",
    description: "Follow the path toward your building",
    distance: "210 ft",
  },
  {
    id: "3",
    icon: "arrow-up" as const,
    title: "Continue straight",
    description: "Walk toward the main entrance",
    distance: "255 ft",
  },
  {
    id: "4",
    icon: "location" as const,
    title: "You have arrived",
    description: "Your destination is nearby",
    distance: "",
  },
];

export default function NavigationScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string | string[] }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { buildings } = useCampus();
  const destination = Array.isArray(roomId) ? roomId[0] : roomId;
  const building = buildings.find((item) =>
    item.rooms.some(
      (room) => room.number.toLowerCase() === destination?.toLowerCase(),
    ),
  );
  const room = building?.rooms.find(
    (item) => item.number.toLowerCase() === destination?.toLowerCase(),
  );
  const destinationName = room
    ? `${room.number}`
    : destination || "Unknown Location";

  // Temp Placeholders text
  const estimatedTime = "4 min";
  const totalDistance = "820 ft";
  const arrivalTime = "10:09 AM";

  const accessibilityOptions = ["Accessible Route", "No Stairs"];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `Directions to ${destination || "Unknown Location"}`,
          headerTitleAlign: "center",
          headerTitleStyle: {
            color: colors.text,
            fontSize: 18,
            fontWeight: "600",
          },
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerShadowVisible: false,
          headerTintColor: colors.brand,
        }}
      />

      {/* Map area - Eyob can replace this with the actual GPS map */}
      <View style={styles.mapContainer}>
        <View style={styles.mapLayer}>
          <Text style={styles.mapPlaceholder}>Campus Map Coming Soon!</Text>
        </View>

        {/* Next direction Card */}
        <View style={styles.instructionCard}>
          <View style={styles.instructionIcon}>
            <Ionicons name="arrow-up" size={34} color={colors.white} />
          </View>
          <View style={styles.instructionText}>
            <Text style={styles.instructionTitle}>Head straight</Text>
            <Text style={styles.instructionSubtitle}>
              Continue along the main walkway
            </Text>
          </View>
          <Text style={styles.instructionDistance}>120 ft</Text>
        </View>

        {/* Route information drawer */}
        <View
          style={[
            styles.bottomDrawer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.drawerHandle} />

          {/* Trip information */}
          <View style={styles.tripSummary}>
            <View style={styles.tripDetails}>
              <View style={styles.tripRow}>
                <Text style={styles.tripValue}>{estimatedTime}</Text>
                <Text style={styles.tripSeparator}>•</Text>
                <Text style={styles.tripValue}>{totalDistance}</Text>
              </View>

              <View style={styles.tripRow}>
                <Text style={styles.tripSubValue}>{arrivalTime}</Text>
                <Text style={styles.tripSeparator}>•</Text>
                <Text style={styles.tripSubValue} numberOfLines={1}>
                  {destinationName}
                </Text>
              </View>
            </View>

            {/* Navigation Chips */}
            <View style={styles.chipContainer}>
              {accessibilityOptions.map((option) => (
                <View key={option} style={styles.accessibilityChip}>
                  <Text style={styles.accessibilityChipText}>{option}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Step-by-step directions */}
          <View style={styles.stepsSection}>
            <Text style={styles.sectionTitle}>DIRECTIONS</Text>
            <ScrollView
              style={styles.stepsList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {ROUTE_STEPS.map((step) => (
                <View key={step.id} style={styles.stepRow}>
                  <View style={styles.stepIconContainer}>
                    <Ionicons name={step.icon} size={21} color={colors.brand} />
                  </View>
                  <View style={styles.stepText}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDescription}>
                      {step.description}
                    </Text>
                  </View>
                  <Text style={styles.stepDistance}>{step.distance}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* End route */}
          <PrimaryButton
            label="End Route"
            iconName="close-circle-outline"
            variant="danger"
            onPress={() => router.replace("/")}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
    minHeight: 100,
  },
  mapLayer: {
    flex: 1,
    backgroundColor: colors.tint,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  mapPlaceholder: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  instructionCard: {
    position: "absolute",
    top: 16,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
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
  instructionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  instructionSubtitle: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  instructionDistance: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand,
  },
  bottomDrawer: {
    ...Platform.select({
      ios: {
        height: "55%",
      },
      android: {
        height: "45%",
      },
    }),
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
  tripRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minWidth: 0,
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
  tripSeparator: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  chipContainer: {
    alignItems: "flex-end",
    gap: 6,
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
  stepText: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  stepDescription: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  stepDistance: {
    fontSize: 11,
    color: colors.secondaryText,
    fontWeight: "600",
  },
});
