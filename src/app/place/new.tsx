import { PrimaryButton } from "@/components/PrimaryButton";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SavePlace() {
  const [selectedRoomId] = useState<string | null>(null);
  const [selectedBuilding] = useState<{ id: string; name: string } | null>();

  const handleSave = () => {};

  // Logic goes here
  // eslint-disable-next-line no-console
  console.log("Saved place:", {
    roomId: selectedRoomId,
    building: selectedBuilding,
  });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report an Issue</Text>
      <Text> PlacerHolder </Text>
      <PrimaryButton
        label="Save Place"
        iconName="bookmark-outline"
        disabled={!selectedRoomId}
        onPress={handleSave}
      />
      <PrimaryButton
        label="Cancel"
        variant="secondary"
        onPress={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  button: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#003D79",
  },
});
