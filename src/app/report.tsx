import { Filter } from "@/components/Filter";
import { PrimaryButton } from "@/components/PrimaryButton";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type ReportFilter = "Bug" | "Feature Request" | "Wrong Information" | "Other";

const REPORT_FILTER: ReportFilter[] = [
  "Bug",
  "Feature Request",
  "Wrong Information",
  "Other",
];

// filter can be used later to select what kind of issue
// for now it won't have much function without the form
export default function ReportIssue() {
  const [activeFilter, setActiveFilter] = useState<ReportFilter>("Bug");

  const [description] = useState<string | null>(null);

  const handleSubmit = () => {};

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagRow}
      >
        {REPORT_FILTER.map((category) => (
          <Filter
            key={category}
            label={category}
            isSelected={activeFilter === category}
            onPress={() => setActiveFilter(category)}
          />
        ))}
      </ScrollView>

      <Text style={styles.title}>Report an Issue</Text>
      <Text> PlacerHolder </Text>
      <PrimaryButton
        label="Submit Report"
        iconName="send-outline"
        disabled={!description?.trim()}
        onPress={handleSubmit}
      />
      <PrimaryButton
        label="Cancel"
        variant="secondary"
        onPress={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  button: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#003D79",
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  tagContainer: {
    height: 48,
    justifyContent: "center",
  },
  tagScrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
});
