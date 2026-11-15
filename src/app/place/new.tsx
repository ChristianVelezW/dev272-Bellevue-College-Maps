import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SavePlace() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report an Issue</Text>
      <Text> PlacerHolder </Text>
      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text>Cancel</Text>
      </Pressable>
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
