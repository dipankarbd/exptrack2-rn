import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card, Divider, Text } from "react-native-paper";

import ExportButton from "@/components/exportimport/ExportButton";
import ImportButton from "@/components/exportimport/ImportButton";
import InfoNote from "@/components/exportimport/InfoNote";

export default function ExportImportDataScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Backup & Restore" titleStyle={styles.title} />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.description}>
            You can export or restore your saved data below.
          </Text>

          <ExportButton />
          <ImportButton />
        </Card.Content>

        <Divider style={styles.divider} />
        <Card.Content>
          <InfoNote />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    marginBottom: 20,
  },
  divider: {
    marginVertical: 16,
  },
});
