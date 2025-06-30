import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "react-native-paper";

import ErrorView from "@/components/common/ErrorView";
import LoadingView from "@/components/common/LoadingView";
import TransactionFilterBar from "@/components/transactions/TransactionFilterBar";
import TransactionListView from "@/components/transactions/TransactionListView";
import EmptyTransactionView from "@/components/transactions/EmptyTransactionView";

import { useAccounts, useAccountWithCurrencyById } from "@/hooks/db/account";
import { useTransactions } from "@/hooks/db/transaction";

export default function TransactionScreen() {
  const theme = useTheme();

  const { data: accounts = [], loading, error } = useAccounts();

  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    accountId?: number;
  }>({});

  const account = useAccountWithCurrencyById(filters?.accountId ?? -1);

  const { data: transactions, refetch } = useTransactions(filters);

  const currencyCode = account?.currency.symbol ?? "N/A";

  const handleFilterChange = useCallback(
    (newFilters: {
      startDate?: string;
      endDate?: string;
      accountId?: number;
    }) => {
      const hasChanged =
        filters.startDate !== newFilters.startDate ||
        filters.endDate !== newFilters.endDate ||
        filters.accountId !== newFilters.accountId;

      if (hasChanged) {
        setFilters({
          startDate: newFilters.startDate!,
          endDate: newFilters.endDate!,
          accountId: newFilters.accountId!,
        });
      }
    },
    [filters]
  );

  if (loading) return <LoadingView />;
  if (error) return <ErrorView errorMessage={error.message} />;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TransactionFilterBar accounts={accounts} onChange={handleFilterChange} />

      {transactions.length > 0 ? (
        <TransactionListView
          transactions={transactions}
          currency={currencyCode}
          onRefresh={refetch}
        />
      ) : (
        <EmptyTransactionView />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
});
