import React from "react";
import { Alert } from "react-native";
import { Button } from "react-native-paper";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";

import { DATABASE_NAME } from "@/db";
import { showAlert } from "./helpers";

export default function ImportButton() {
  const importDatabase = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      const file = result?.assets?.[0];
      const isValid =
        file?.uri &&
        file.name?.toLowerCase().endsWith(".db") &&
        file.size != null &&
        file.size > 0;

      if (!isValid) {
        return showAlert("Invalid File", "Please select a valid backup file.");
      }

      const targetPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;

      Alert.alert(
        "Confirm Import",
        "This will replace your current data. Do you want to continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Import",
            onPress: async () => {
              try {
                await FileSystem.copyAsync({ from: file.uri, to: targetPath });
                showAlert(
                  "Success",
                  "Import complete. Please restart the app."
                );
              } catch (copyError) {
                console.error("Copy failed:", copyError);
                showAlert("Error", "Failed to import your backup.");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Import error:", error);
      showAlert("Error", "Something went wrong during import.");
    }
  };

  return (
    <Button
      mode="outlined"
      icon="file-import"
      onPress={importDatabase}
      style={{ borderRadius: 8 }}
    >
      Import Data
    </Button>
  );
}
