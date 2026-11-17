import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, styles.mapLayer]}>
        <Text style={styles.placeholder}>Campus map coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.tint,
  },
  mapLayer: {
    backgroundColor: colors.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    fontSize: 14,
    color: colors.secondaryText,
  },
});
