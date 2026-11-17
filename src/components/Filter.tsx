import { colors } from "@/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface FilterProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
}

// renders touchable element with possible icon and label
export function Filter({ label, isSelected, onPress, iconName }: FilterProps) {
  return (
    <TouchableOpacity
      style={[
        styles.tag,
        isSelected ? styles.tagSelected : styles.tagUnselected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {iconName && (
        <Ionicons
          name={iconName}
          size={16}
          color={isSelected ? colors.white : colors.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          isSelected ? styles.labelSelected : styles.labelUnselected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  tagSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  tagUnselected: {
    backgroundColor: colors.white,
    borderColor: colors.tintBorder,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  labelSelected: {
    color: colors.white,
    fontWeight: "600",
  },
  labelUnselected: {
    color: colors.text,
  },
});
