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
import { useRouter } from "expo-router";

import ExpenseForm, { ExpenseFormData } from "@/components/expense/ExpenseForm";
import ProgressDialog from "@/components/common/ProgressDialog";

import { useAccounts } from "@/hooks/db/account";
import { useCategories } from "@/hooks/db/categories";
import { useAddExpense } from "@/hooks/db/expense";

export default function CreateExpenseScreen() {
  const theme = useTheme();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    defaultValues: {
      amount: 0,
      date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    },
  });

  const { data: accounts = [], error: accountsError } = useAccounts();
  const { data: categories = [], error: categoriesError } = useCategories();
  const { addExpense, isAdding, error: addError } = useAddExpense();

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (addError || accountsError || categoriesError) {
      setShowError(true);
    }
  }, [addError, accountsError, categoriesError]);

  const onSubmit = async (data: ExpenseFormData) => {
    const success = await addExpense({
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
          <ExpenseForm
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
            accounts={accounts}
            categories={categories}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <ProgressDialog isVisible={isAdding} message="Saving expense..." />
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
          categoriesError?.message ||
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
