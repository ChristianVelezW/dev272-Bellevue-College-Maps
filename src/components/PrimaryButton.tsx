import { colors } from "@/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle; // for style overrides
};

export function PrimaryButton({
  label,
  onPress,
  iconName,
  variant = "primary",
  isLoading = false,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || isLoading;

  const getBackgroundColor = () => {
    if (isDisabled) return "#9ca3af";
    if (variant === "secondary") return colors.tint;
    if (variant === "danger") return colors.danger;
    return colors.brand;
  };

  const getTextColor = () => {
    if (isDisabled) return colors.white;
    if (variant === "secondary") return colors.brand;
    return colors.white;
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.button, { backgroundColor: getBackgroundColor() }, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {iconName && (
            <Ionicons
              name={iconName}
              size={18}
              color={getTextColor()}
              style={styles.icon}
              accessibilityElementsHidden={true}
              importantForAccessibility="no"
            />
          )}
          <Text style={[styles.text, { color: getTextColor() }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: "100%",
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
});
