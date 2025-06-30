import React from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";

type Props = {
  error: { message: string } | undefined;
};

export default function FormInputErrorMessage({ error }: Props) {
  if (!error) return null;
  return <Text style={styles.error}>{error.message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    color: "#B00020",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
});
