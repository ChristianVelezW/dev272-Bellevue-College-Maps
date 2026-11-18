import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { colors } from "../../constants/colors";
import { useCampus } from "../../context/CampusContext";

export default function ProfileScreen() {
  const router = useRouter();

  const {
    buildings,
    savedPlaces: savedPlaceRefs,
    accessibleOnly,
    setAccessibleOnly,
    avoidStairs,
    setAvoidStairs,
  } = useCampus();

  const savedPlaces = savedPlaceRefs.flatMap((place) => {
    const building = buildings.find((item) => item.id === place.buildingId);

    const room = building?.rooms.find((item) => item.id === place.roomId);

    if (!building || !room) {
      return [];
    }

    return [
      {
        id: place.id,
        buildingId: building.id,
        buildingCode: building.code,
        locationName: room.name,
        roomNumber: room.number,
        floor: room.floor,
      },
    ];
  });
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Profile</Text>
      {/* Saved Places */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SAVED PLACES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.savedPlacesContainer}
        >
          {savedPlaces.map((place) => (
            <Pressable
              key={place.id}
              style={styles.placeCard}
              onPress={() =>
                router.push({
                  pathname: "/building/[id]",
                  params: { id: place.buildingId, floor: String(place.floor) },
                })
              }
            >
              <View style={styles.buildingLetterContainer}>
                <Text style={styles.buildingLetter}>{place.buildingCode}</Text>
              </View>
              <Text style={styles.placeName}>{place.locationName}</Text>
              <Text style={styles.roomNumber}>{place.roomNumber}</Text>
            </Pressable>
          ))}
          {/* Add a Place */}
          <Pressable
            style={styles.addPlaceCard}
            onPress={() => router.push("/place/new")}
          >
            <View style={styles.addIconContainer}>
              <Ionicons name="add" size={28} color={colors.brand} />
            </View>
            <Text style={styles.addPlaceText}>Add Place</Text>
          </Pressable>
        </ScrollView>
      </View>
      {/* Navigation Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NAVIGATION</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Accessible Routes Only</Text>
          </View>
          <Switch
            accessibilityLabel="Accessible Routes Only"
            value={accessibleOnly}
            onValueChange={setAccessibleOnly}
            trackColor={{ false: "#646464", true: colors.brand }}
          />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Avoid Stairs</Text>
          </View>
          <Switch
            accessibilityLabel="Avoid Stairs"
            value={avoidStairs}
            onValueChange={setAvoidStairs}
            trackColor={{ false: "#646464", true: colors.brand }}
          />
        </View>
      </View>
      {/* Navigation Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>APP</Text>
        <Pressable
          style={styles.reportRow}
          onPress={() => router.push("/report")}
        >
          <Text style={styles.reportText}>Report an Issue</Text>
          <Ionicons name="chevron-forward" size={22} color={"#6b7280"} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    gap: 28,
    backgroundColor: colors.white,
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.text,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.brand,
  },
  savedPlacesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  placeCard: {
    width: 110,
    minHeight: 130,
    borderWidth: 2,
    borderColor: colors.tintBorder,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.white,
  },
  buildingLetterContainer: {
    width: 58,
    height: 58,
    backgroundColor: colors.tint,
    borderWidth: 2,
    borderColor: colors.tint,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buildingLetter: {
    fontSize: 30,
    fontWeight: "600",
    color: colors.brand,
  },
  placeName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
    color: colors.text,
  },
  roomNumber: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  addPlaceCard: {
    width: 100,
    minHeight: 130,
    borderWidth: 1,
    borderColor: colors.brand,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.white,
  },
  addIconContainer: {
    width: 48,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderStyle: "dashed",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addPlaceText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.brand,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  settingText: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  reportText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
  },
});
