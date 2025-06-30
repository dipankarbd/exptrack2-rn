import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Snackbar, useTheme } from "react-native-paper";

import CurrencyListView from "@/components/currency/CurrencyListView";
import EmptyCurrencyView from "@/components/currency/EmptyCurrencyView";
import ErrorView from "@/components/common/ErrorView";
import LoadingView from "@/components/common/LoadingView";

import { useCurrencies, useDeleteCurrency } from "@/hooks/db/currency";

export default function CurrenciesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const isFocused = useIsFocused();

  const [showError, setShowError] = useState(false);

  const { data = [], error, loading, refetch } = useCurrencies();
  const { deleteCurrency, error: deleteError } = useDeleteCurrency();

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  useEffect(() => {
    if (deleteError) {
      setShowError(true);
    }
  }, [deleteError]);

  const handlePress = (currencyId: number) => {
    router.push(`./currencies/${currencyId}/edit`);
  };

  const handleDelete = useCallback(
    async (id: number) => {
      const success = await deleteCurrency(id);
      if (success) {
        refetch();
      }
    },
    [deleteCurrency, refetch]
  );

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView errorMessage={error.message} />;
  }

  return (
    <>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {data.length > 0 ? (
          <CurrencyListView
            currencies={data}
            onPress={handlePress}
            onDeleteCurrency={handleDelete}
          />
        ) : (
          <EmptyCurrencyView />
        )}
      </View>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={5000}
        action={{ label: "Dismiss", onPress: () => setShowError(false) }}
        style={{ backgroundColor: theme.colors.error }}
      >
        {deleteError?.message || "Something went wrong while deleting"}
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
