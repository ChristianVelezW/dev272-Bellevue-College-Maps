import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.sectionTitle}>Saved Places</Text>
      <Text style={styles.placeholder}>
        Your saved locations will appear here.
      </Text>
      <Pressable onPress={() => router.push("/place/new")}>
        <Text>Save a Location</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Navigation</Text>
      <Text style={styles.placeholder}>
        Accessibility preferences coming soon.
      </Text>
      <Pressable onPress={() => router.push("/report")}>
        <Text>Report an Issue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    fontSize: 14,
    color: "#6b7280",
  },
});
