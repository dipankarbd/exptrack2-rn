import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";

import ExpenseCategoryRow from "./ExpenseCategoryRow";

type Props = {
  currencyCode: string;
  currencySymbol: string;
  totalExpense: number;
  categories: { categoryName: string; total: number }[];
};

export default function ExpenseSummaryCard({
  currencyCode,
  currencySymbol,
  totalExpense,
  categories,
}: Props) {
  const theme = useTheme();

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <Card.Content>
        <View style={styles.header}>
          <Text style={[styles.totalLabel, { color: theme.colors.primary }]}>
            Total Expense
          </Text>
          <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
            {currencySymbol}
            {totalExpense.toFixed(2)}
          </Text>
        </View>

        <Text
          style={[
            styles.currencyCode,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Currency: {currencyCode}
        </Text>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: theme.colors.outlineVariant ?? "#ccc",
            },
          ]}
        />

        {categories.map((cat, idx) => (
          <ExpenseCategoryRow
            key={idx}
            categoryName={cat.categoryName}
            amount={cat.total}
            symbol={currencySymbol}
          />
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    marginHorizontal: 12,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  currencyCode: {
    fontSize: 13,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
});
