import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Snackbar, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import IncomeListView from "@/components/income/IncomeListView";
import EmptyIncomeView from "@/components/income/EmptyIncomeView";
import ErrorView from "@/components/common/ErrorView";
import LoadingView from "@/components/common/LoadingView";
import FilterBar from "@/components/common/DayFilterBar";

import { useDeleteIncome, useIncomes } from "@/hooks/db/income";

export default function IncomesScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [showError, setShowError] = useState(false);

  const { data: incomes = [], error, loading, refetch } = useIncomes(filters);
  const { deleteIncome, error: deleteError } = useDeleteIncome();

  const handlePress = (incomeId: number) =>
    router.push(`./income/${incomeId}/edit`);

  const handleDelete = useCallback(
    async (id: number) => {
      const success = await deleteIncome(id);
      if (success) refetch();
    },
    [deleteIncome, refetch]
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    if (deleteError) setShowError(true);
  }, [deleteError]);

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
        ) : incomes.length > 0 ? (
          <IncomeListView
            incomes={incomes}
            onDeleteIncome={handleDelete}
            onPress={handlePress}
          />
        ) : (
          <EmptyIncomeView />
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
