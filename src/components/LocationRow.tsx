import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

type LocationRowProps = {
  title: string;
  subtitle: string;
  badge?: string;
  accessibilityLabel?: string;
  variant?: "default" | "building";
  onPress: () => void;
};

export function LocationRow({
  title,
  subtitle,
  badge,
  accessibilityLabel,
  variant = "default",
  onPress,
}: LocationRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        variant === "building" ? styles.buildingRow : styles.row,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {variant === "building" && badge ? (
        <View style={styles.roomBadge}>
          <Text style={styles.roomBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <View style={styles.textGroup}>
        <Text
          numberOfLines={variant === "building" ? 1 : undefined}
          style={[styles.title, variant === "building" && styles.roomTitle]}
        >
          {title}
        </Text>
        <Text
          numberOfLines={variant === "building" ? 1 : undefined}
          style={[
            styles.subtitle,
            variant === "building" && styles.roomSubtitle,
          ]}
        >
          {subtitle}
        </Text>
      </View>
      {variant === "building" ? (
        <View style={styles.chevron}>
          <Image
            source={require("../../assets/building-detail/chevron-right.svg")}
            style={styles.chevronImage}
            accessibilityElementsHidden
          />
        </View>
      ) : badge ? (
        <Text style={styles.badge}>{badge}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buildingRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 68,
    paddingVertical: 11,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  roomBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  roomBadgeText: {
    color: colors.brand,
    fontSize: 17,
    fontWeight: "600",
  },
  roomTitle: {
    color: colors.text,
    lineHeight: 22,
  },
  roomSubtitle: {
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 20,
  },
  chevron: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronImage: {
    width: 6.66667,
    height: 11.6667,
  },
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
