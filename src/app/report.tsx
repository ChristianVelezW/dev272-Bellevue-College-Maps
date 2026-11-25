import { getBuildings } from "@/api/building";
import { createIssueReport } from "@/api/reports";
import { Filter } from "@/components/Filter";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/constants/colors";
import { ReportCategory } from "@/types/campus";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const REPORT_FILTER: ReportCategory[] = [
  "Bug",
  "Feature Request",
  "Wrong Information",
  "Other",
];

export default function ReportIssue() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<ReportCategory | "">("");
  const [buildingId, setBuildingId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({
    category: "",
    buildingId: "",
    description: "",
  });
  const {
    data: buildings = [],
    isLoading: buildingsLoading,
    isError: buildingsError,
    refetch: refetchBuildings,
  } = useQuery({
    queryKey: ["buildings"],
    queryFn: getBuildings,
  });

  const selectedBuilding = buildings.find(
    (building) => building.id === buildingId,
  );

  const availableRooms = selectedBuilding?.rooms ?? [];
  const mutation = useMutation({
    mutationFn: createIssueReport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["reports"],
      });
      Alert.alert(
        "Report Submitted",
        "Thank you for helping improve BC Maps!",
        [
          {
            text: "Continue",
            onPress: () => router.back(),
          },
        ],
      );
    },
    onError: (error) => {
      Alert.alert(
        "Unable to Submit Report",
        error.message || "Please try again.",
      );
    },
  });

  const handleBuildingChange = (value: string) => {
    setBuildingId(value);
    setRoomId("");
    setErrors((previous) => ({
      ...previous,
      buildingId: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {
      category: "",
      buildingId: "",
      description: "",
    };

    if (!activeFilter) {
      newErrors.category = "Please select an issue type";
    }

    if (!buildingId) {
      newErrors.buildingId = "Please select a building";
    }

    if (!description.trim()) {
      newErrors.description = "Please describe the issue";
    } else if (description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    } else if (description.trim().length > 300) {
      newErrors.description = "Description cannot exceed 300 characters";
    }

    if (roomId && !availableRooms.some((room) => room.id === roomId)) {
      newErrors.buildingId = "Please select a valid room";
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = () => {
    if (mutation.isPending) return;

    if (!validateForm() || !activeFilter) return;

    mutation.mutate({
      category: activeFilter,
      building_id: buildingId,
      room_id: roomId || null,
      description: description.trim(),
    });
  };

  const buildingOptions = buildings.map((building) => ({
    label: building.name,
    value: building.id,
  }));

  const roomOptions = availableRooms.map((room) => ({
    label: `${room.number} - ${room.name}`,
    value: room.id,
  }));

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {Platform.OS === "ios" && <View style={styles.dragIndicator} />}
        <Text style={styles.title}>Report an Issue</Text>
        <Text style={styles.description}>
          Wrong room, closed entrance, or broken elevator?{"\n"}
          Tell us so that the map stays accurate.
        </Text>

        {/* Issue Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Issue Type *</Text>
          <View style={[styles.filterContainer]}>
            {REPORT_FILTER.map((category) => (
              <Filter
                key={category}
                label={category}
                isSelected={activeFilter === category}
                onPress={() => {
                  setActiveFilter(category);
                  setErrors((previous) => ({
                    ...previous,
                    category: "",
                  }));
                }}
              />
            ))}
          </View>
          {errors.category ? (
            <Text style={styles.fieldError}>{errors.category}</Text>
          ) : null}
        </View>

        {/* Building */}
        <View style={styles.section}>
          <Text style={styles.label}>Building *</Text>
          {buildingsLoading ? (
            <Text style={styles.helperText}>Loading buildings...</Text>
          ) : buildingsError ? (
            <View>
              <Text style={styles.fieldError}>Unable to load buildings.</Text>
              <PrimaryButton
                label="Retry"
                variant="secondary"
                onPress={() => refetchBuildings()}
              />
            </View>
          ) : buildings.length === 0 ? (
            <Text style={styles.fieldError}>
              No buildings are currently available.
            </Text>
          ) : (
            <Dropdown
              style={[styles.dropdown, errors.buildingId && styles.errorInput]}
              data={buildingOptions}
              labelField="label"
              valueField="value"
              placeholder="Select a Building"
              value={buildingId}
              onChange={(item) => handleBuildingChange(item.value)}
            />
          )}
          {errors.buildingId ? (
            <Text style={styles.fieldError}>{errors.buildingId}</Text>
          ) : null}
        </View>

        {/* Optional Room */}
        <View style={styles.section}>
          <Text style={styles.label}>Room (Optional)</Text>
          <Dropdown
            style={[styles.dropdown, !buildingId && styles.disableDropdown]}
            data={roomOptions}
            labelField="label"
            valueField="value"
            placeholder={
              !buildingId
                ? "Select a Building First"
                : roomOptions.length === 0
                  ? "No Rooms Available"
                  : "Select a Room"
            }
            value={roomId}
            disable={!buildingId || buildingsLoading || buildingsError}
            onChange={(item) => setRoomId(item.value)}
          />
          {selectedBuilding && (
            <Text style={styles.helperText}>
              Showing rooms in {selectedBuilding.name}
            </Text>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
              errors.description && styles.errorInput,
            ]}
            placeholder="Describe the issue you encountered..."
            placeholderTextColor={colors.secondaryText}
            value={description}
            onChangeText={(text) => {
              setDescription(text);

              const length = text.trim().length;

              setErrors((previous) => {
                if (!previous.description) return previous;
                return {
                  ...previous,
                  description:
                    length < 20
                      ? "Description must be at least 20 characters"
                      : length > 300
                        ? "Description cannot exceed 300 characters"
                        : "",
                };
              });
            }}
            multiline
            textAlignVertical="top"
          />
          {errors.description ? (
            <Text style={styles.fieldError}>{errors.description}</Text>
          ) : null}
          <Text style={styles.characterCount}>{description.length}/300</Text>
        </View>

        {/* Add Photo Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Photo (Optional)</Text>
          <View style={styles.photoBox}>
            <View style={styles.photoContent}>
              <Ionicons name="camera-outline" size={18} color={colors.brand} />
              <Text style={styles.photoLabel}>Add a Photo (optional)</Text>
            </View>
          </View>
        </View>

        {/* Submission Error */}
        {mutation.isError && (
          <Text style={styles.errorText}>
            {mutation.error.message ||
              "Unable to submit your report. Please try again."}
          </Text>
        )}

        {/* Buttons */}
        <PrimaryButton
          label="Submit Report"
          iconName="send-outline"
          onPress={handleSubmit}
          isLoading={mutation.isPending}
          disabled={
            mutation.isPending ||
            buildingsLoading ||
            buildingsError ||
            buildings.length === 0
          }
        />
        <PrimaryButton
          label="Cancel"
          variant="secondary"
          onPress={() => router.back()}
          disabled={mutation.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  dragIndicator: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.gray,
    alignSelf: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: colors.text,
    marginTop: Platform.OS === "android" ? 20 : 0,
  },
  description: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: "center",
  },
  section: {
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
  },
  dropdown: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.tintBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  disableDropdown: {
    backgroundColor: colors.surface,
    opacity: 0.65,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.tintBorder,
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
  },
  descriptionInput: {
    minHeight: 140,
  },
  helperText: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  characterCount: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: "right",
  },
  photoBox: {
    height: 80,
    borderWidth: 1.5,
    borderColor: colors.gray,
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  photoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.secondaryText,
  },
  errorInput: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  fieldError: {
    color: colors.danger,
    fontSize: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
});
