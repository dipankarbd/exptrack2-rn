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

import IncomeForm, { IncomeFormData } from "@/components/income/IncomeForm";
import ProgressDialog from "@/components/common/ProgressDialog";

import { useAccounts } from "@/hooks/db/account";
import { useAddIncome } from "@/hooks/db/income";
import dayjs from "dayjs";

export default function CreateIncomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormData>({
    defaultValues: {
      source: "Other",
      amount: 0,
      date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    },
  });

  const { data: accounts, error: accountsError } = useAccounts();
  const { addIncome, isAdding, error: addError } = useAddIncome();

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (addError || accountsError) {
      setShowError(true);
    }
  }, [addError, accountsError]);

  const onSubmit = async (data: IncomeFormData) => {
    const success = await addIncome({
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
        <ProgressDialog isVisible={isAdding} message="Saving income..." />
      </Portal>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={5000}
        style={{ backgroundColor: theme.colors.error }}
        action={{ label: "Dismiss", onPress: () => setShowError(false) }}
      >
        {addError?.message || accountsError?.message || "Something went wrong"}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
