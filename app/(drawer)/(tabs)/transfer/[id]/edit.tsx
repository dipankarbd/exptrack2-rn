import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm } from "react-hook-form";
import { useTheme, Portal, Snackbar } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";

import TransferForm, {
  TransferFormData,
} from "@/components/transfer/TransferForm";
import ProgressDialog from "@/components/common/ProgressDialog";

import { useTransferById, useUpdateTransfer } from "@/hooks/db/transfer";
import { useAccounts } from "@/hooks/db/account";
import { useCurrencies } from "@/hooks/db/currency";

export default function EditTransferScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const transferId = parseInt(id);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormData>();

  const { data: transfer, loading, error } = useTransferById(transferId);
  const { data: accounts = [], error: accountsError } = useAccounts();
  const { data: currencies = [], error: currenciesError } = useCurrencies();
  const {
    updateTransfer,
    isUpdating,
    error: updateError,
  } = useUpdateTransfer();

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error || accountsError || currenciesError || updateError) {
      setShowError(true);
    }
  }, [error, accountsError, currenciesError, updateError]);

  useEffect(() => {
    if (transfer) {
      setValue("fromAccountId", transfer.fromAccount.id);
      setValue("toAccountId", transfer.toAccount.id);
      setValue("amount", transfer.amount);
      setValue("conversionRate", transfer.conversionRate);
      setValue("date", dayjs(transfer.date).format("YYYY-MM-DD HH:mm:ss"));
    }
  }, [transfer, setValue]);

  const onSubmit = async (data: TransferFormData) => {
    const success = await updateTransfer({
      id: transferId,
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
        <ProgressDialog
          isVisible={isUpdating || loading}
          message="Saving changes..."
        />
      </Portal>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={5000}
        style={{ backgroundColor: theme.colors.error }}
        action={{ label: "Dismiss", onPress: () => setShowError(false) }}
      >
        {error?.message ||
          updateError?.message ||
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
