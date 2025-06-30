import React from "react";
import { Button } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { DATABASE_NAME } from "@/db";
import { getFormattedDateTime, showAlert } from "./helpers";

export default function ExportButton() {
  const exportDatabase = async () => {
    try {
      const dbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
      const dbInfo = await FileSystem.getInfoAsync(dbPath);

      if (!dbInfo.exists) {
        return showAlert("Error", "Saved data not found.");
      }

      const exportDir = `${FileSystem.documentDirectory}exports/`;
      await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

      const exportFile = `${exportDir}exptrack_backup_${getFormattedDateTime()}.db`;
      await FileSystem.copyAsync({ from: dbPath, to: exportFile });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        return showAlert("Error", "Sharing is not supported on this device.");
      }

      await Sharing.shareAsync(exportFile);
    } catch (error) {
      console.error("Export error:", error);
      showAlert("Error", "Failed to export your data.");
    }
  };

  return (
    <Button
      mode="contained"
      icon="file-export"
      onPress={exportDatabase}
      style={{ marginBottom: 12, borderRadius: 8 }}
    >
      Export Data
    </Button>
  );
}
