import dayjs from "dayjs";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Controller } from "react-hook-form";
import { TextInput, Button } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";

import DateTimePickerModal from "react-native-modal-datetime-picker";

import ErrorMessage from "../common/FormInputErrorMessage";

export type IncomeFormData = {
  accountId: number;
  source: "Salary" | "Interest" | "Profit" | "Other";
  amount: number;
  date: string;
};

type Account = {
  id: number;
  type: "Bank" | "Cash" | "CreditCard";
  state: "Active" | "Inactive" | "Closed";
  name: string;
  currencyId: number;
  createdAt: string;
};

type Props = {
  control: any;
  errors: any;
  isSubmitting: boolean;
  onSubmit: () => void;
  accounts: Account[];
};

const sourceOptions = ["Salary", "Interest", "Profit", "Other"].map((src) => ({
  label: src,
  value: src,
}));

const accountOptions = (accounts: Account[]) =>
  accounts
    .filter((account) => account.state === "Active")
    .map((account) => ({
      label: account.name,
      value: account.id.toString(),
    }));

export default function IncomeForm({
  control,
  errors,
  isSubmitting,
  onSubmit,
  accounts,
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
          <TextInput
            label="Amount"
            value={value?.toString() ?? ""}
            onChangeText={(text) => onChange(text)}
            keyboardType="decimal-pad"
            error={!!errors.amount}
            placeholder="e.g. 100.00"
          />
        )}
      />
      <ErrorMessage error={errors.amount} />

      <Controller
        control={control}
        name="source"
        rules={{ required: "Income source is required" }}
        render={({ field: { onChange, value } }) => (
          <Dropdown
            label="Income Source"
            value={value}
            onSelect={onChange}
            options={sourceOptions}
            error={!!errors.source}
          />
        )}
      />
      <ErrorMessage error={errors.source} />

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
