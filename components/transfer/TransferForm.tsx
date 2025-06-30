import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { View, StyleSheet } from "react-native";
import { Controller, useWatch } from "react-hook-form";
import { TextInput, Button } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";

import ErrorMessage from "../common/FormInputErrorMessage";

export type TransferFormData = {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  conversionRate: number;
  date: string;
};

type Account = {
  id: number;
  name: string;
  state: "Active" | "Inactive" | "Closed";
  currencyId: number;
};

type Currency = {
  id: number;
  code: string;
};

type Props = {
  control: any;
  setValue: any;
  errors: any;
  isSubmitting: boolean;
  onSubmit: () => void;
  accounts: Account[];
  currencies: Currency[];
};

const getAccountOptions = (accounts: Account[], currencies: Currency[]) =>
  accounts
    .filter((acc) => acc.state === "Active")
    .map((acc) => {
      const currency = currencies.find((cur) => cur.id === acc.currencyId);
      const currencyCode = currency ? ` (${currency.code})` : "";
      return {
        label: `${acc.name}${currencyCode}`,
        value: acc.id.toString(),
      };
    });

export default function TransferForm({
  control,
  setValue,
  errors,
  isSubmitting,
  onSubmit,
  accounts,
  currencies,
}: Props) {
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const fromAccountId = useWatch({ control, name: "fromAccountId" });
  const toAccountId = useWatch({ control, name: "toAccountId" });

  const fromAccount = accounts.find((acc) => acc.id === fromAccountId);
  const toAccount = accounts.find((acc) => acc.id === toAccountId);

  const isDifferentCurrency =
    fromAccount && toAccount && fromAccount.currencyId !== toAccount.currencyId;

  useEffect(() => {
    if (!isDifferentCurrency) {
      setValue("conversionRate", 1.0);
    }
  }, [isDifferentCurrency, setValue]);

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="fromAccountId"
        rules={{ required: "From Account is required" }}
        render={({ field: { onChange, value } }) => (
          <Dropdown
            label="From Account"
            value={value?.toString()}
            onSelect={(val) => onChange(Number(val))}
            options={getAccountOptions(accounts, currencies)}
            error={!!errors.fromAccountId}
          />
        )}
      />
      <ErrorMessage error={errors.fromAccountId} />

      <Controller
        control={control}
        name="toAccountId"
        rules={{
          required: "To Account is required",
          validate: (val) =>
            val !== fromAccountId || "From and To account must differ",
        }}
        render={({ field: { onChange, value } }) => (
          <Dropdown
            label="To Account"
            value={value?.toString()}
            onSelect={(val) => onChange(Number(val))}
            options={getAccountOptions(accounts, currencies)}
            error={!!errors.toAccountId}
          />
        )}
      />
      <ErrorMessage error={errors.toAccountId} />

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

      {isDifferentCurrency && (
        <>
          <Controller
            control={control}
            name="conversionRate"
            rules={{
              required: "Conversion rate is required",
              validate: (val) =>
                (!isNaN(parseFloat(val)) && parseFloat(val) > 0) ||
                "Must be a valid number",
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Conversion Rate"
                value={value?.toString() ?? ""}
                onChangeText={(text) => onChange(text)}
                keyboardType="decimal-pad"
                error={!!errors.conversionRate}
                placeholder="e.g. 1.0"
              />
            )}
          />

          <ErrorMessage error={errors.conversionRate} />
        </>
      )}

      <Controller
        control={control}
        name="date"
        rules={{ required: "Date is required" }}
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
        contentStyle={styles.submitButtonContent}
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
  submitButtonContent: {
    paddingVertical: 8,
  },
});
