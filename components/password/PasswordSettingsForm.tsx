import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Switch, TextInput, Button } from "react-native-paper";
import { Controller, useWatch } from "react-hook-form";

import ErrorMessage from "../common/FormInputErrorMessage";

export type PasswordSettingsFormData = {
  enablePassword: boolean;
  password: string;
};

type Props = {
  control: any;
  errors: any;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export default function PasswordSettingsForm({
  control,
  errors,
  isSubmitting,
  onSubmit,
}: Props) {
  // 🔍 Watch the enablePassword field reactively
  const enablePassword = useWatch({
    control,
    name: "enablePassword",
    defaultValue: false,
  });

  return (
    <View style={styles.form}>
      {/* Enable Password Switch */}
      <Controller
        control={control}
        name="enablePassword"
        render={({ field: { value, onChange } }) => (
          <View style={styles.switchRow}>
            <Text style={styles.label}>Enable Password</Text>
            <Switch value={value} onValueChange={onChange} />
          </View>
        )}
      />

      {/* Password Input */}
      <Controller
        control={control}
        name="password"
        rules={{
          validate: (val) =>
            enablePassword && !val ? "Password is required" : true,
        }}
        render={({ field: { value, onChange } }) => (
          <TextInput
            label="Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            error={!!errors.password}
            disabled={!enablePassword}
            style={styles.input}
          />
        )}
      />

      <ErrorMessage error={errors.password} />

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={onSubmit}
        disabled={isSubmitting}
        style={styles.submitButton}
        contentStyle={{ paddingVertical: 8 }}
      >
        Save Settings
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
  },
  input: {
    marginTop: -8,
  },
  submitButton: {
    marginTop: 8,
  },
});
