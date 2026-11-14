import { Pressable, StyleSheet, Text, View } from "react-native";

type LocationRowProps = {
  title: string;
  subtitle: string;
  badge?: string;
  onPress: () => void;
};

export function LocationRow({
  title,
  subtitle,
  badge,
  onPress,
}: LocationRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.textGroup}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 8,
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    color: "#4b5563",
  },
  badge: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },
});
