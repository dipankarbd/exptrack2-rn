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

import IncomeForm, { IncomeFormData } from "@/components/income/IncomeForm";
import ProgressDialog from "@/components/common/ProgressDialog";

import { useAccounts } from "@/hooks/db/account";
import { useIncomeById, useUpdateIncome } from "@/hooks/db/income";

export default function EditIncomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const incomeId = Number(id);

  const { data: accounts, error: accountsError } = useAccounts();
  const income = useIncomeById(incomeId);
  const { updateIncome, isUpdating, error: updateError } = useUpdateIncome();

  const [showError, setShowError] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormData>();

  useEffect(() => {
    if (income) {
      setValue("accountId", income.account.id);
      setValue("source", income.source);
      setValue("amount", income.amount);
      setValue("date", dayjs(income.date).format("YYYY-MM-DD HH:mm:ss"));
    }
  }, [income, setValue]);

  useEffect(() => {
    if (updateError || accountsError) {
      setShowError(true);
    }
  }, [updateError, accountsError]);

  const onSubmit = async (data: IncomeFormData) => {
    const success = await updateIncome({
      id: incomeId,
      ...data,
      amount: parseFloat(data.amount as any),
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
          <IncomeForm
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
            accounts={accounts || []}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <ProgressDialog isVisible={isUpdating} message="Updating income..." />
      </Portal>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={5000}
        style={{ backgroundColor: theme.colors.error }}
        action={{ label: "Dismiss", onPress: () => setShowError(false) }}
      >
        {updateError?.message ||
          accountsError?.message ||
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
