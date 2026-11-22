import { PrimaryButton } from "@/components/PrimaryButton";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NavigationScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Directions" }} />
      <Text style={styles.title}>Directions to {roomId}</Text>
      <Text style={styles.subTitle}>Here are the directions</Text>
      <PrimaryButton
        label="End Route"
        iconName="close-circle-outline"
        variant="danger"
        onPress={() => router.replace("/")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  subTitle: {
    color: "black",
  },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#003D79",
  },
  buttonText: {
    color: "#003D79",
    fontWeight: "600",
  },
});
