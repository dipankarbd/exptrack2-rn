import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Snackbar, useTheme } from "react-native-paper";

import AccountListView from "@/components/account/AccountListView";
import EmptyAccountView from "@/components/account/EmptyAccountView";
import ErrorView from "@/components/common/ErrorView";
import LoadingView from "@/components/common/LoadingView";

import { useAccounts, useDeleteAccount } from "@/hooks/db/account";

export default function AccountsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const isFocused = useIsFocused();

  const [showError, setShowError] = useState(false);

  const { data: accounts = [], error, loading, refetch } = useAccounts();
  const { deleteAccount, error: deleteError } = useDeleteAccount();

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

  const handlePress = (accountId: number) => {
    router.push(`./accounts/${accountId}/edit`);
  };

  const handleDelete = useCallback(
    async (id: number) => {
      const success = await deleteAccount(id);
      if (success) {
        refetch();
      }
    },
    [deleteAccount, refetch]
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
        {accounts.length > 0 ? (
          <AccountListView
            accounts={accounts}
            onPress={handlePress}
            onDeleteAccount={handleDelete}
          />
        ) : (
          <EmptyAccountView />
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
