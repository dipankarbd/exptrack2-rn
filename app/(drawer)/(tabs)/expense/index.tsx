import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Snackbar, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import ErrorView from "@/components/common/ErrorView";
import LoadingView from "@/components/common/LoadingView";
import FilterBar from "@/components/common/DayFilterBar";
import EmptyExpenseView from "@/components/expense/EmptyExpenseView";
import ExpenseListView from "@/components/expense/ExpenseListView";

import { getAllExpenseCategoryNames } from "@/utils/categories";
import { useDeleteExpense, useExpenses } from "@/hooks/db/expense";
import { useCategories } from "@/hooks/db/categories";

export default function ExpensesScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [showError, setShowError] = useState(false);

  const { data: categories } = useCategories();
  const { data: expenses = [], error, loading, refetch } = useExpenses(filters);
  const { deleteExpense, error: deleteError } = useDeleteExpense();

  const handlePress = (expenseId: number) =>
    router.push(`./expense/${expenseId}/edit`);

  const handleDelete = useCallback(
    async (id: number) => {
      const success = await deleteExpense(id);
      if (success) refetch();
    },
    [deleteExpense, refetch]
  );

  useEffect(() => {
    if (deleteError) setShowError(true);
  }, [deleteError]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const categoryNameMap = getAllExpenseCategoryNames(categories || []);
  const expensesWithCategoryNames = expenses.map((exp) => ({
    ...exp,
    category: categoryNameMap[exp.categoryId] || "Unknown",
  }));

  return (
    <>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <FilterBar onChange={setFilters} />

        {loading ? (
          <LoadingView />
        ) : error ? (
          <ErrorView errorMessage={error.message} />
        ) : expensesWithCategoryNames.length > 0 ? (
          <ExpenseListView
            expenses={expensesWithCategoryNames}
            onDeleteExpense={handleDelete}
            onPress={handlePress}
          />
        ) : (
          <EmptyExpenseView />
        )}
      </View>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={5000}
        action={{ label: "Dismiss", onPress: () => setShowError(false) }}
        style={{ backgroundColor: theme.colors.error }}
      >
        {deleteError?.message || "Something went wrong"}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
});
