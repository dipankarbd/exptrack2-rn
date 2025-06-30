import React, { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Divider, useTheme } from "react-native-paper";

import TransactionItemView from "./TransactionItemView";

type TransactionItem = {
  id: string;
  type: "Income" | "Expense" | "Transfer In" | "Transfer Out";
  amount: number;
  date: string;
  balance: number;
  description: string;
};

type Props = {
  transactions: TransactionItem[];
  currency: string;
  onRefresh?: () => Promise<void>;
};

export default function TransactionListView({
  transactions,
  currency,
  onRefresh,
}: Props) {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const renderItem = useCallback(
    ({ item }: { item: TransactionItem }) => (
      <View style={[styles.row, { backgroundColor: theme.colors.surface }]}>
        <TransactionItemView
          type={item.type}
          amount={item.amount}
          balance={item.balance}
          date={item.date}
          currencySymbol={currency}
          description={item.description}
        />
      </View>
    ),
    [currency, theme.colors.surface]
  );

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={Divider}
      contentContainerStyle={styles.container}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  row: {
    flex: 1,
  },
});
