import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Snackbar, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import ErrorView from "@/components/common/ErrorView";
import LoadingView from "@/components/common/LoadingView";
import FilterBar from "@/components/common/DayFilterBar";
import TransferListView from "@/components/transfer/TransferListView";
import EmptyTransferView from "@/components/transfer/EmptyTransferView";

import { useTransfers, useDeleteTransfer } from "@/hooks/db/transfer";

export default function TransfersScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [showError, setShowError] = useState(false);

  const {
    data: transfers = [],
    error,
    loading,
    refetch,
  } = useTransfers(filters);
  const { deleteTransfer, error: deleteError } = useDeleteTransfer();

  useEffect(() => {
    if (deleteError) setShowError(true);
  }, [deleteError]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handlePress = (transferId: number) =>
    router.push(`./transfer/${transferId}/edit`);

  const handleDelete = useCallback(
    async (id: number) => {
      const success = await deleteTransfer(id);
      if (success) refetch();
    },
    [deleteTransfer, refetch]
  );

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
        ) : transfers.length > 0 ? (
          <TransferListView
            transfers={transfers}
            onDeleteTransfer={handleDelete}
            onPress={handlePress}
          />
        ) : (
          <EmptyTransferView />
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
