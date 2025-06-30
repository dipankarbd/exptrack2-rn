import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Dialog } from "react-native-paper";

type Props = {
  isVisible: boolean;
  message: string;
};

export default function ProgressDialog({ message, isVisible }: Props) {
  return (
    <Dialog visible={isVisible} dismissable={false}>
      <Dialog.Content style={styles.container}>
        <ActivityIndicator
          animating={true}
          size="small"
          style={styles.activity}
        />
        <Dialog.Title style={styles.title}>{message}</Dialog.Title>
      </Dialog.Content>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  activity: {
    marginRight: 16,
  },
  title: {
    fontSize: 16,
  },
});
