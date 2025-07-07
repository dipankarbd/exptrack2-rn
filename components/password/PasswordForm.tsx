import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { Controller } from "react-hook-form";
import ErrorMessage from "../common/FormInputErrorMessage"; // Or use your own simple text component

type Props = {
  control: any;
  errors: any;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export default function PasswordForm({
  control,
  errors,
  isSubmitting,
  onSubmit,
}: Props) {
  const [secureText, setSecureText] = useState(true);

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="password"
        rules={{ required: "Password is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry={secureText}
            error={!!errors.password}
            right={
              <TextInput.Icon
                icon={secureText ? "eye-off" : "eye"}
                onPress={() => setSecureText((prev) => !prev)}
              />
            }
          />
        )}
      />
      <ErrorMessage error={errors.password} />

      <Button
        mode="contained"
        onPress={onSubmit}
        disabled={isSubmitting}
        style={styles.submitButton}
        contentStyle={{ paddingVertical: 8 }}
      >
        Open
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    gap: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});
