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

import ExpenseForm, { ExpenseFormData } from "@/components/expense/ExpenseForm";
import ProgressDialog from "@/components/common/ProgressDialog";

import { useAccounts } from "@/hooks/db/account";
import { useCategories } from "@/hooks/db/categories";
import { useExpenseById, useUpdateExpense } from "@/hooks/db/expense";

export default function EditExpenseScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const expenseId = Number(id);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>();

  const { data: accounts = [], error: accountsError } = useAccounts();
  const { data: categories = [], error: categoriesError } = useCategories();
  const {
    data: expense,
    loading,
    error: expenseError,
  } = useExpenseById(expenseId);
  const { updateExpense, isUpdating, error: updateError } = useUpdateExpense();

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (expense) {
      setValue("amount", expense.amount);
      setValue("date", dayjs(expense.date).format("YYYY-MM-DD HH:mm:ss"));
      setValue("accountId", expense.accountId);
      setValue("categoryId", expense.categoryId);
    }
  }, [expense, setValue]);

  useEffect(() => {
    if (updateError || expenseError || accountsError || categoriesError) {
      setShowError(true);
    }
  }, [updateError, expenseError, accountsError, categoriesError]);

  const onSubmit = async (data: ExpenseFormData) => {
    const success = await updateExpense({
      id: expenseId,
      accountId: data.accountId,
      categoryId: data.categoryId,
      amount: parseFloat(data.amount as any),
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
          {expense && (
            <ExpenseForm
              control={control}
              errors={errors}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit(onSubmit)}
              accounts={accounts}
              categories={categories}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <ProgressDialog
          isVisible={loading || isUpdating}
          message= {loading ? "Loading...": "Saving..."}
        />
      </Portal>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={5000}
        style={{ backgroundColor: theme.colors.error }}
        action={{ label: "Dismiss", onPress: () => setShowError(false) }}
      >
        {updateError?.message ||
          expenseError?.message ||
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
