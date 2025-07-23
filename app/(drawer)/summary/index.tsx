import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Snackbar, useTheme } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";

import DayFilterBar from "@/components/common/DayFilterBar";
import LoadingView from "@/components/common/LoadingView";
import ErrorView from "@/components/common/ErrorView";
import ExpenseSummaryCard from "@/components/summary/ExpenseSummaryCard";
import EmptySummaryView from "@/components/summary/EmptySummaryView";

import { useExpenseSummary } from "@/hooks/db/summary";

export default function ExpenseSummaryScreen() {
  const theme = useTheme();
  const isFocused = useIsFocused();

  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [showError, setShowError] = useState(false);

  const {
    data: summaryList = [],
    error,
    loading,
    refetch,
  } = useExpenseSummary(filters);

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  useEffect(() => {
    if (error) setShowError(true);
  }, [error]);

  return (
    <>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <DayFilterBar onChange={setFilters} />

        {loading ? (
          <LoadingView />
        ) : error ? (
          <ErrorView errorMessage={error.message} />
        ) : summaryList.length === 0 ? (
          <EmptySummaryView />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {summaryList.map((summary) => (
              <ExpenseSummaryCard
                key={summary.currencyCode}
                currencyCode={summary.currencyCode}
                currencySymbol={summary.currencySymbol}
                totalExpense={summary.totalExpense}
                categories={summary.categories}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={5000}
        action={{ label: "Dismiss", onPress: () => setShowError(false) }}
        style={{ backgroundColor: theme.colors.error }}
      >
        {error?.message || "Something went wrong while loading summary."}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  scrollContent: {
    paddingTop: 8, // 👈 Ensures first card’s top border is visible
    paddingBottom: 24,
  },
});
