import { StyleSheet, Text, View } from "react-native";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BC Maps</Text>
      <View>
        <Text>Map Coming Soon!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
});
