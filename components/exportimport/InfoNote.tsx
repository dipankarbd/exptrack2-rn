import React from "react";
import { Text, useTheme } from "react-native-paper";
import { StyleSheet } from "react-native";

export default function InfoNote() {
  const theme = useTheme();

  return (
    <Text
      variant="labelSmall"
      style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}
    >
      Export will generate a backup you can share. Import will replace all
      existing data with the selected backup.
    </Text>
  );
}

const styles = StyleSheet.create({
  infoText: {
    fontStyle: "italic",
  },
});
