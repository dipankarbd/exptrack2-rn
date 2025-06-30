import dayjs from "dayjs";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { TextInput, Button } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import CategoryModalPicker from "./CategoryModalPicker";
import ErrorMessage from "../common/FormInputErrorMessage";
import CalculatorInput from "../common/CalculatorInput";

export type ExpenseFormData = {
  accountId: number;
  categoryId: number;
  amount: number;
  date: string;
};

interface ExpenseCategory {
  id: number;
  name: string;
  parentId: number | null;
}

type Account = {
  id: number;
  name: string;
  type: "Bank" | "Cash" | "CreditCard";
  state: "Active" | "Inactive" | "Closed";
  currencyId: number;
  createdAt: string;
};

type Props = {
  control: any;
  errors: any;
  isSubmitting: boolean;
  onSubmit: () => void;
  accounts: Account[];
  categories: ExpenseCategory[];
};

const accountOptions = (accounts: Account[]) =>
  accounts
    .filter((account) => account.state === "Active")
    .map((account) => ({
      label: account.name,
      value: account.id.toString(),
    }));

export default function ExpenseForm({
  control,
  errors,
  isSubmitting,
  onSubmit,
  accounts,
  categories,
}: Props) {
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="amount"
        rules={{
          required: "Amount is required",
          validate: (val) =>
            (!isNaN(parseFloat(val)) && parseFloat(val) > 0) ||
            "Must be a valid number",
        }}
        render={({ field: { onChange, value } }) => (
          <CalculatorInput
            label="Amount"
            value={value?.toString() ?? ""}
            onChange={(val) => onChange(val)}
            error={!!errors.amount}
            placeholder="e.g. 100.00"
          />
        )}
      />
      <ErrorMessage error={errors.amount} />

      <Controller
        control={control}
        name="categoryId"
        rules={{ required: "Category is required" }}
        render={({ field: { value, onChange } }) => (
          <CategoryModalPicker
            value={value}
            onChange={onChange}
            error={!!errors.categoryId}
            categories={categories}
          />
        )}
      />
      <ErrorMessage error={errors.categoryId} />

      <Controller
        control={control}
        name="accountId"
        rules={{ required: "Account is required" }}
        render={({ field: { onChange, value } }) => (
          <Dropdown
            label="Account"
            value={value?.toString()}
            onSelect={(val) => onChange(Number(val))}
            options={accountOptions(accounts)}
            error={!!errors.accountId}
          />
        )}
      />
      <ErrorMessage error={errors.accountId} />

      <Controller
        control={control}
        name="date"
        rules={{ required: "Date and time is required" }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label="Date"
              value={value ? dayjs(value).format("YYYY-MM-DD hh:mm A") : ""}
              editable={false}
              pointerEvents="none"
              error={!!errors.date}
              right={
                <TextInput.Icon
                  icon="calendar-clock"
                  onPress={() => setDatePickerVisible(true)}
                />
              }
            />
            <DateTimePickerModal
              isVisible={datePickerVisible}
              mode="datetime"
              date={value ? dayjs(value).toDate() : new Date()}
              onConfirm={(date) => {
                onChange(dayjs(date).format("YYYY-MM-DD HH:mm:ss"));
                setDatePickerVisible(false);
              }}
              onCancel={() => setDatePickerVisible(false)}
            />
          </>
        )}
      />
      <ErrorMessage error={errors.date} />

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
