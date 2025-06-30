import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import { Controller } from "react-hook-form";

import ErrorMessage from "../common/FormInputErrorMessage";

export type AccountFormData = {
  name: string;
  type: "Bank" | "Cash" | "CreditCard";
  state: "Active" | "Inactive" | "Closed";
  currencyId: number;
};

type Currency = {
  id: number;
  description: string;
};

type Props = {
  control: any;
  errors: any;
  isSubmitting: boolean;
  onSubmit: () => void;
  currencies: Currency[];
};

const accountTypeOptions = [
  {
    label: "Bank",
    value: "Bank",
  },
  {
    label: "Cash",
    value: "Cash",
  },
  {
    label: "Credit Card",
    value: "CreditCard",
  },
];

const accountStateOptions = ["Active", "Inactive", "Closed"].map((src) => ({
  label: src,
  value: src,
}));

const currencyOptions = (currencies: Currency[]) =>
  currencies.map((currency) => ({
    label: `${currency.description}`,
    value: currency.id.toString(),
  }));

export default function AccountForm({
  control,
  errors,
  isSubmitting,
  onSubmit,
  currencies,
}: Props) {
  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="name"
        rules={{ required: "Account name is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Account Name"
            value={value}
            onChangeText={onChange}
            error={!!errors.name}
            placeholder="e.g. My Savings"
          />
        )}
      />
      <ErrorMessage error={errors.name} />

      <Controller
        control={control}
        name="type"
        rules={{ required: "Account type is required" }}
        render={({ field: { onChange, value } }) => (
          <Dropdown
            label="Account Type"
            value={value}
            onSelect={onChange}
            options={accountTypeOptions}
            error={!!errors.type}
          />
        )}
      />
      <ErrorMessage error={errors.type} />

      <Controller
        control={control}
        name="state"
        rules={{ required: "Account state is required" }}
        render={({ field: { onChange, value } }) => (
          <Dropdown
            label="Account State"
            value={value}
            onSelect={onChange}
            options={accountStateOptions}
            error={!!errors.state}
          />
        )}
      />
      <ErrorMessage error={errors.state} />

      <Controller
        control={control}
        name="currencyId"
        rules={{ required: "Currency is required" }}
        render={({ field: { onChange, value } }) => (
          <Dropdown
            label="Currency"
            value={value ? value.toString() : ""}
            onSelect={(val) => onChange(Number(val))}
            options={currencyOptions(currencies)}
            error={!!errors.currencyId}
          />
        )}
      />
      <ErrorMessage error={errors.currencyId} />

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
