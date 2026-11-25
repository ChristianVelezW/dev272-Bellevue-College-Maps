import { getBuildings } from "@/api/building";
import { createSavedPlace } from "@/api/savedPlaces";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors } from "@/constants/colors";
import { useCampus } from "@/context/CampusContext";
import { LocationType } from "@/types/campus";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const locationTypes: LocationType[] = [
  "Study Spot",
  "Classroom",
  "Food",
  "Office",
  "Other",
];

const initialErrors = {
  buildingId: "",
  locationName: "",
  locationType: "",
  notes: "",
};

export default function SavePlace() {
  const queryClient = useQueryClient();
  const { refreshCampusData } = useCampus();
  const [buildingId, setBuildingId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationType, setLocationType] = useState<LocationType | "">("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState(initialErrors);

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
    mutationFn: createSavedPlace,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["savedPlaces"],
      });
      await refreshCampusData();
      Alert.alert(
        "Place Saved!",
        "Your location has been saved successfully!",
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
        "Unable to Save Location",
        error.message || "Please try again!",
      );
    },
  });

  const clearError = (field: keyof typeof initialErrors) => {
    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  const handleBuildingChange = (value: string) => {
    setBuildingId(value);
    setRoomId("");

    clearError("buildingId");
  };

  const validateForm = () => {
    const newErrors = { ...initialErrors };

    if (!buildingId) {
      newErrors.buildingId = "Please select a building";
    } else if (!buildings.some((building) => building.id === buildingId)) {
      newErrors.buildingId = "Please select a valid building";
    }

    if (!locationName.trim()) {
      newErrors.locationName = "Please enter a location name";
    } else if (locationName.trim().length > 60) {
      newErrors.locationName = "Location name cannot exceed 60 characters";
    }

    if (!locationType) {
      newErrors.locationType = "Please select a location type";
    }

    if (notes.trim().length > 250) {
      newErrors.notes = "Notes cannot exceed 250 characters";
    }

    if (roomId && !availableRooms.some((room) => room.id === roomId)) {
      newErrors.buildingId = "Please select a valid room";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSave = () => {
    if (mutation.isPending) return;

    if (!validateForm() || !locationType) return;

    mutation.mutate({
      building_id: buildingId,
      room_id: roomId || null,
      label: locationName.trim(),
      location_type: locationType,
      notes: notes.trim() || null,
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
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {Platform.OS === "ios" && <View style={styles.dragIndicator} />}

        <Text style={styles.title}>Save a Place</Text>

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
            style={[
              styles.dropdown,
              (!buildingId || buildingsLoading || buildingsError) &&
                styles.disableDropdown,
            ]}
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
            disable={
              !buildingId ||
              buildingsLoading ||
              buildingsError ||
              roomOptions.length === 0
            }
            onChange={(item) => setRoomId(item.value)}
          />

          {selectedBuilding && (
            <Text style={styles.helperText}>
              {availableRooms.length} rooms available in {""}
              {selectedBuilding.name}
            </Text>
          )}
        </View>

        {/* Location Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Location Name *</Text>

          <TextInput
            style={[styles.input, errors.locationName && styles.errorInput]}
            placeholder="Ex: Quiet Study Area"
            placeholderTextColor={colors.secondaryText}
            value={locationName}
            onChangeText={(text) => {
              setLocationName(text);

              if (text.trim() && text.length <= 60) {
                clearError("locationName");
              }
            }}
          />

          {errors.locationName ? (
            <Text style={styles.fieldError}>{errors.locationName}</Text>
          ) : null}

          <Text style={styles.characterCount}>{locationName.length}/60</Text>
        </View>

        {/* Location Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Location Type *</Text>

          <View style={styles.chipContainer}>
            {locationTypes.map((type) => (
              <Pressable
                key={type}
                accessibilityRole="button"
                accessibilityState={{
                  selected: locationType === type,
                }}
                style={[
                  styles.chip,
                  locationType === type && styles.selectedChip,
                ]}
                onPress={() => {
                  setLocationType(type);
                  clearError("locationType");
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    locationType === type && styles.selectedChipText,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          {errors.locationType ? (
            <Text style={styles.fieldError}>{errors.locationType}</Text>
          ) : null}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (Optional)</Text>

          <TextInput
            style={[
              styles.input,
              styles.notesInput,
              errors.notes && styles.errorInput,
            ]}
            placeholder="Add additional information..."
            placeholderTextColor={colors.secondaryText}
            value={notes}
            onChangeText={(text) => {
              setNotes(text);

              if (text.trim().length <= 250) {
                clearError("notes");
              }
            }}
            multiline
            textAlignVertical="top"
          />

          {errors.notes ? (
            <Text style={styles.fieldError}>{errors.notes}</Text>
          ) : null}

          <Text style={styles.characterCount}>{notes.length}/250</Text>
        </View>

        {/* API Error */}
        {mutation.isError && (
          <Text style={styles.errorText}>
            {mutation.error.message ||
              "Unable to save your location. Please try again."}
          </Text>
        )}

        {/* Buttons */}
        <PrimaryButton
          label="Save Place"
          iconName="bookmark-outline"
          onPress={handleSave}
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
  dragIndicator: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.gray,
    alignSelf: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: colors.text,
    marginTop: Platform.OS === "android" ? 20 : 0,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 18,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
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
  notesInput: {
    minHeight: 110,
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
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.tintBorder,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  selectedChip: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
  },
  selectedChipText: {
    color: colors.white,
    fontWeight: "600",
  },
  errorInput: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  fieldError: {
    color: colors.danger,
    fontSize: 12,
    margin: 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
});
