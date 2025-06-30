import React from "react";
import { View, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { TextInput, Button } from "react-native-paper";

import ErrorMessage from "../common/FormInputErrorMessage";

type Props = {
  control: any;
  errors: any;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export default function CurrencyForm({
  control,
  errors,
  isSubmitting,
  onSubmit,
}: Props) {
  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="code"
        rules={{ required: "Currency code is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Currency Code"
            value={value}
            onChangeText={onChange}
            error={!!errors.code}
            placeholder="e.g. USD"
            autoCapitalize="characters"
          />
        )}
      />
      <ErrorMessage error={errors.code} />

      <Controller
        control={control}
        name="description"
        rules={{ required: "Description is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Description"
            value={value}
            onChangeText={onChange}
            error={!!errors.description}
            placeholder="e.g. US Dollar"
          />
        )}
      />
      <ErrorMessage error={errors.description} />

      <Controller
        control={control}
        name="symbol"
        rules={{ required: "Symbol is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Symbol"
            value={value}
            onChangeText={onChange}
            error={!!errors.symbol}
            placeholder="e.g. $"
          />
        )}
      />
      <ErrorMessage error={errors.symbol} />

      <Button
        mode="contained"
        onPress={onSubmit}
        disabled={isSubmitting}
        style={styles.submitButton}
        contentStyle={{ paddingVertical: 8 }}
      >
        Save
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});
