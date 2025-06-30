import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm } from "react-hook-form";
import { useTheme, Portal, Snackbar } from "react-native-paper";
import { useRouter } from "expo-router";

import TransferForm, {
  TransferFormData,
} from "@/components/transfer/TransferForm";
import ProgressDialog from "@/components/common/ProgressDialog";

import { useAccounts } from "@/hooks/db/account";
import { useCurrencies } from "@/hooks/db/currency";
import { useAddTransfer } from "@/hooks/db/transfer";

import dayjs from "dayjs";

export default function CreateTransferScreen() {
  const theme = useTheme();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormData>({
    defaultValues: {
      amount: 0,
      conversionRate: 1.0,
      date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    },
  });

  const { data: accounts = [], error: accountsError } = useAccounts();
  const { data: currencies = [], error: currenciesError } = useCurrencies();
  const { addTransfer, isAdding, error: addError } = useAddTransfer();

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (addError || accountsError || currenciesError) {
      setShowError(true);
    }
  }, [addError, accountsError, currenciesError]);

  const onSubmit = async (data: TransferFormData) => {
    const success = await addTransfer({
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: parseFloat(data.amount as any),
      conversionRate: parseFloat(data.conversionRate as any),
      date: data.date,
    });

    if (success) {
      router.back();
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <TransferForm
            control={control}
            errors={errors}
            setValue={setValue}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
            accounts={accounts}
            currencies={currencies}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <ProgressDialog isVisible={isAdding} message="Saving transfer..." />
      </Portal>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={5000}
        style={{ backgroundColor: theme.colors.error }}
        action={{ label: "Dismiss", onPress: () => setShowError(false) }}
      >
        {addError?.message ||
          accountsError?.message ||
          currenciesError?.message ||
          "Something went wrong"}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
