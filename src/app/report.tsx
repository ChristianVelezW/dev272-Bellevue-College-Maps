import { Filter } from "@/components/Filter";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text>Cancel</Text>
      </Pressable>
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
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 4,
  },
});
