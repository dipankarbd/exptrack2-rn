import React from "react";
import { View, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { TextInput, Button } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";

import ErrorMessage from "../common/FormInputErrorMessage";

export type CategoryFormData = {
  name: string;
  parentId: number | null;
};

type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

type Props = {
  control: any;
  errors: any;
  isSubmitting: boolean;
  onSubmit: () => void;
  categories: Category[];
};

const categoriesOptions = (categories: Category[]) => {
  return [
    { label: "None", value: "null" },
    ...categories
      .filter((cat) => cat.parentId === null)
      .map((cat) => ({
        label: cat.name.toString(),
        value: cat.id.toString(),
      })),
  ];
};

export default function CategoryForm({
  control,
  errors,
  isSubmitting,
  onSubmit,
  categories,
}: Props) {
  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="name"
        rules={{ required: "Category name is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Category Name"
            value={value}
            onChangeText={onChange}
            error={!!errors.name}
            placeholder="Furniture"
          />
        )}
      />
      <ErrorMessage error={errors.name} />

      <Controller
        control={control}
        name="parentId"
        render={({ field: { onChange, value } }) => {
          const dropdownValue = value == null ? "null" : value.toString();

          return (
            <Dropdown
              key={dropdownValue}
              label="Parent"
              value={dropdownValue}
              onSelect={(val) => {
                onChange(val === "null" ? null : Number(val));
              }}
              options={categoriesOptions(categories)}
              error={!!errors.parentId}
            />
          );
        }}
      />
      <ErrorMessage error={errors.parentId} />

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
